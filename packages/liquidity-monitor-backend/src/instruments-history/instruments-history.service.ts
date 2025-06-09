import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InstrumentsHistory, InstrumentsHistoryState } from "./entities/instruments-history.entity";
import { Repository } from "typeorm";
import { InstrumentsHistoryQueryDto } from "./dto/instruments-history-query.dto";
import { InstrumentsHistoryResponseDto } from './dto/instruments-history-response.dto';
import { SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from 'cron';
import { ConfigService } from '@nestjs/config';
import { SERVICES } from "../api-statistic";

type TSourceForInstrumentsHistory = {
  symbol_name: string;
  instruments_group_id: string;
  provider_id: string;
  state: InstrumentsHistoryState;
  created_at: Date;
}

@Injectable()
export class InstrumentsHistoryService implements OnModuleInit {
  private readonly logger = new Logger(InstrumentsHistoryService.name);

  constructor(
    private readonly repo: Repository<InstrumentsHistory>,
    private schedulerRegistry: SchedulerRegistry,
    private configService: ConfigService
  ) {}

  onModuleInit() {
    this.runUpdateInstrumentHistoryJob();
  }

  runUpdateInstrumentHistoryJob() {
    this.logger.log('InstrumentsHistoryService initialized, starting history update interval');

    const jobName = 'update-instrument-history';

    // Cron schedule every day at 00:00:06 by default
    const cronSchedule = this.configService.get<string>('INSTRUMENTS_HISTORY_UPDATE_CRON_SCHEDULE', '0 6 * * * *');

    const job = new CronJob(cronSchedule, () => {
      return this.updateInstrumentHistory();
    });

    this.schedulerRegistry.addCronJob(jobName, job);
    job.start();

    this.logger.log(
      `Job ${jobName} added with the following schedule: ${cronSchedule}`,
    );
  }

  async updateInstrumentHistory(): Promise<void> {
    try {
      this.logger.debug('Starting instruments history update');

      const sourceRecordsQuery = `
        with
        -- get the last history timestamp
        last_history_timestamp as (
            select created_at as last_timestamp
            from instruments_history
            order by created_at desc
            limit 1
        ),

        -- 1) for each instrument event, we determine its 'end' moment (the next change)
        events as (select ie.*,
                        lead(ie.created_at) over (
                            partition by ie.symbol_name, ie.instruments_group_id
                            order by ie.created_at
                            ) as ends_at
                from instruments_events ie
                where ie.created_at > (select last_timestamp from last_history_timestamp)),

        -- 2) activity periods of our system (TID): from created_at to last_checked_at of each record
        tid_periods as (select created_at      as start_at,
                            last_checked_at as end_at
                        from api_statistic
                        where service_name = $1
                        and created_at > (select last_timestamp from last_history_timestamp)),

        -- 3) aggregated periods of quotes receipt by providers
        --    (we simply save all timestamps, we will check absence by them)
        quotes as (select quotes_provider_name as provider_name,
                        created_at           as quote_at
                from quotes_statistic
                where created_at > (select last_timestamp from last_history_timestamp)),

        -- 4) main select: for each event in instrument events, we match the group,
        --    platform (provider_id), and calculate the state
        select_events as (select e.symbol_name,
                                e.instruments_group_id,
                                ig.platform_id             as provider_id,
                                -- calculate state by priority described in the task
                                case
                                    -- 1) TID down: there is no tid_periods period covering the start of the event
                                    when not exists (select 1
                                                    from tid_periods t
                                                    where e.created_at between t.start_at and t.end_at) then $2

                                    -- 2) platform down: for the period [created_at, ends_at] there is not a single quote from this provider
                                    when not exists (select 1
                                                    from quotes q
                                                    where q.provider_name::uuid = ig.platform_id
                                                    and q.quote_at between e.created_at
                                                        and coalesce(e.ends_at, e.created_at + interval '1 minute'))
                                        then $3

                                    -- 3) scheduled off quotes: quotes off flag
                                    when e.is_quotes_off then $4

                                    -- 4) no quotes real: should be traded, but quotes are not coming
                                    when not e.is_quotes_off and e.is_problematic then $5

                                    -- 5) active: everything else
                                    else $6
                                    end                    as state,
                                e.created_at               as event_at,
                                coalesce(e.ends_at, now()) as event_ends_at
                        from events e
                            join instruments_groups ig
                                on e.instruments_group_id = ig.id)
        -- generate series
        select 
            symbol_name,
            instruments_group_id,
            provider_id,
            state,
            generate_series(se.event_at, se.event_ends_at, '1 minute') as created_at
        from select_events se
        order by symbol_name, event_at;
      `;

      const newRecords: TSourceForInstrumentsHistory[] = await this.repo.query(sourceRecordsQuery, [
        SERVICES.TID_API, // $1 - Service name to filter API statistic
        InstrumentsHistoryState.TID_DOWN, // $2
        InstrumentsHistoryState.PLATFORM_DOWN, // $3
        InstrumentsHistoryState.SCHEDULED_OFF_QUOTES, // $4
        InstrumentsHistoryState.NO_QUOTES_REAL, // $5
        InstrumentsHistoryState.ACTIVE // $6
      ]);

      if (newRecords.length === 0) {
        this.logger.debug('No new records to insert');
        return;
      }

      this.logger.debug(`Found ${newRecords.length} new records to insert`);

      const recordsToInsert = newRecords.map(record => {
        const entity = new InstrumentsHistory();
        entity.symbolName = record.symbol_name;
        entity.instrumentsGroupId = record.instruments_group_id;
        entity.providerId = record.provider_id;
        entity.state = record.state;
        entity.createdAt = record.created_at;
        return entity;
      });

      const batchSize = 1000;
      for (let i = 0; i < recordsToInsert.length; i += batchSize) {
        const batch = recordsToInsert.slice(i, i + batchSize);
        await this.repo.save(batch, { chunk: Math.min(batch.length, 100) });
      }

      this.logger.debug(`Successfully inserted ${recordsToInsert.length} records into instruments_history`);
    } catch (error) {
      this.logger.error('Error updating instruments history:', error);
    }
  }

  async getAvailabilityReport(query: InstrumentsHistoryQueryDto): Promise<InstrumentsHistoryResponseDto> {
    const { start, end } = query;

    const allowedSortColumns = ['symbolName', 'availabilityPercent'];
    const allowedDirections = ['ASC', 'DESC'];

    const sort = query.sort?.split(',');
    let [groupIds, platformIds] = [[], []];
    if (query.s) {
      const parsed = JSON.parse(query.s);
      for (const item of parsed['$and']) {
        if (item.groupName) {
          groupIds = item.groupName.$in;
        }
        if (item.platformName) {
          platformIds = item.platformName.$in;
        }
      }
    }

    const sortColumn = allowedSortColumns.includes(sort?.[0] || '') ? sort![0] : 'availabilityPercent';
    const sortDirection = allowedDirections.includes(sort?.[1].toUpperCase() || '') ? sort![1].toUpperCase() : 'ASC';

    const sql = `
        with numbered as (
            select
                symbol_name,
                instruments_group_id,
                provider_id,
                state,
                created_at,
                row_number() over (
                    partition by symbol_name, instruments_group_id, provider_id
                    order by created_at
                    ) as seq_all,
                row_number() over (
                    partition by symbol_name, instruments_group_id, provider_id, state
                    order by created_at
                    ) as seq_state
            from instruments_history
            where
                (created_at >= $1 or $1 is null)
              and (created_at <= $2 or $2 is null)
              and (instruments_group_id = any($3) or $3 is null)
              and (provider_id = any($4) or $4 is null)
        ),
             grouped as (
                 select *,
                        seq_all - seq_state as grp
                 from numbered
             ),
             periods as (
                 select
                     symbol_name,
                     instruments_group_id,
                     provider_id,
                     state,
                     state in ('active', 'scheduled off quotes') as alive,
                     min(created_at) as period_start,
                     max(created_at) as period_end,
                     max(created_at) - min(created_at) + interval '1 minute' as duration
                 from grouped
                 group by symbol_name, instruments_group_id, provider_id, state, grp
             ),
             -- CTE for calculating summary duration by each state
             state_durations as (
                 select
                     symbol_name,
                     instruments_group_id,
                     provider_id,
                     state,
                     alive,
                     sum(duration) as total_duration
                 from periods
                 where not alive
                 group by symbol_name, instruments_group_id, provider_id, state, alive
             )
        -- Final select
        select
            symbol_name as "symbolName",
            ig.label as "groupName",
            p.name as "platformName",
            round(extract(epoch from sum(duration) filter ( where alive )) / extract(epoch from sum(duration)) * 100) as "availabilityPercent",
            to_char(sum(duration) filter ( where state = 'scheduled off quotes' ), 'HH24:MI') as "scheduledOffQuotesDuration",
            to_char(sum(duration) filter ( where not alive ), 'HH24:MI') as "downtimeDuration",
            count(*) filter ( where not alive ) as "incidentsCount",
            to_char(max(duration) filter ( where not alive ), 'HH24:MI') as "maxIncidentDuration",
            to_char(avg(duration) filter ( where not alive ), 'HH24:MI') as "meanIncidentDuration",
            (
                select string_agg(sd.state::varchar || ' - ' || to_char(sd.total_duration, 'HH24:MI'), ', ')
                from state_durations sd
                where sd.symbol_name = periods.symbol_name
                  and sd.instruments_group_id = periods.instruments_group_id
                  and sd.provider_id = periods.provider_id
            ) as reason
        from periods
                 left join instruments_groups ig on ig.id = instruments_group_id
                 left join platforms p on provider_id = p.id
        group by symbol_name, ig.label, p.name, instruments_group_id, provider_id
        order by "${sortColumn}" ${sortDirection};
    `;

    const data = await this.repo.query(sql, [
      start || null,
      end || null,
      groupIds && groupIds.length ? groupIds : null,
      platformIds && platformIds.length ? platformIds : null]
    );

    return {
      data
    }
  }
}
