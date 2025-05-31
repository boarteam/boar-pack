import { Injectable } from '@nestjs/common';
import { InstrumentsHistoryQueryDto } from "./dto/instruments-history-query.dto";
import { InstrumentsHistory } from "./entities/instruments-history.entity";
import { InstrumentsHistoryResponseDto } from "./dto/instruments-history-response.dto";
import { Repository } from "typeorm";

@Injectable()
export class InstrumentsHistoryService {

  constructor(
    private readonly repo: Repository<InstrumentsHistory>,
  ) {}

  async getAvailabilityReport(query: InstrumentsHistoryQueryDto): Promise<InstrumentsHistoryResponseDto> {
    const { start, end, groupId, platformId } = query;

    const allowedSortColumns = ['symbolName', 'availabilityPercent'];
    const allowedDirections = ['ASC', 'DESC'];

    const sort = query.sort?.split(',');

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
              and (instruments_group_id = $3 or $3 is null)
              and (provider_id = $4 or $4 is null)
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
      groupId || null,
      platformId || null]
    );

    return {
      data
    }
  }
}
