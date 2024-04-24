import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { EcnInstrument } from './entities/ecn-instrument.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository } from 'typeorm';
import { AMTS_DB_NAME } from '../liquidity-app/liquidity-app.config';
import { EcnConnectSchema } from '../ecn-connect-schema/entities/ecn-connect-schema.entity';
import { EcnSubscrSchema } from '../ecn-subscr-schema/entities/ecn-subscr-schema.entity';
import {
  GetEcnInstrumentsInConnectionsData,
  GetEcnInstrumentsInConnectionsResponse,
  GetInstrumentsInConnectionsQueryDto,
} from './dto/ecn-instruments-get-in-connections.dto';

@Injectable()
export class EcnInstrumentsService extends TypeOrmCrudService<EcnInstrument> {
  private static subscriptionJsonObject = `
    json_object(
      'enabled', subscr.enabled,
      'descr', subscr.descr,
      'markup_bid', subscr.markup_bid,
      'default_markup_bid', subscr.default_markup_bid,
      'min_volume', subscr.min_volume,
      'max_volume', subscr.max_volume,
      'volume_step', subscr.volume_step,
      'instrument_weight', subscr.instrument_weight,
      'execution_mode', subscr.execution_mode,
      'trade_enabled', subscr.trade_enabled
    )
  `;

  private static schemasEqual = `${EcnInstrumentsService.subscriptionJsonObject} = (select data from compare_data where subscr.instrument_hash = compare_data.instrumentHash)`;

  private static connectionsWithEqual = `
    json_objectagg(
      connect.id,
      json_object(
        'enabled', subscr.enabled and connect.enabled,
        'referenceEnabled', (select count(*) from compare_data where subscr.instrument_hash = compare_data.instrumentHash and compare_data.data ->> '$.enabled'),
        'equal', ${EcnInstrumentsService.schemasEqual}
      )
    )
  `;
  private static connectionsWithoutEqual = `
    json_objectagg(
      connect.id,
      json_object(
        'enabled', subscr.enabled and connect.enabled
      )
    )
  `;

  constructor(
    @InjectRepository(EcnInstrument, AMTS_DB_NAME)
    readonly repo: Repository<EcnInstrument>,
    @InjectDataSource(AMTS_DB_NAME)
    readonly dataSource: DataSource,
  ) {
    super(repo);
  }

  async getInConnections({
    id,
    search,
    limit,
    offset,
    sortDirection,
    compareConnectSchemaId,
    showOnlyChanged,
    filterInstrument,
    filterInstrumentsGroup,
  }: GetInstrumentsInConnectionsQueryDto): Promise<GetEcnInstrumentsInConnectionsResponse> {
    const ids = Array.isArray(id) ? id : id ? [id] : [];
    const filterInstruments = Array.isArray(filterInstrument)
      ? filterInstrument
      : filterInstrument
      ? [filterInstrument]
      : [];
    const filterInstrumentsGroups = Array.isArray(filterInstrumentsGroup)
      ? filterInstrumentsGroup
      : filterInstrumentsGroup
      ? [filterInstrumentsGroup]
      : [];

    if (!ids.length) {
      return Promise.resolve({ data: [], total: 0 });
    }

    const dataQuery = this.repo
      .createQueryBuilder('instrument')
      .select('instrument.name', 'instrumentName')
      .addSelect('instrument.instrumentHash', 'instrumentHash')
      // here we aggregate by condition that connect.enabled and subscr.enabled are true
      // if there are connections with different enabled status, we mark it as availability_changed
      // also we count connections to check if all connections are present - some instruments might be missing
      // in some connections. To detect this we count connections and compare it with the number of connections
      // from the input
      .addSelect(
        `count(distinct subscr.enabled and connect.enabled) > 1 or count(connect.id) <> ${ids.length}`,
        'availability_changed',
      )
      .innerJoin(
        EcnSubscrSchema,
        'subscr',
        'instrument.instrumentHash = subscr.instrumentHash',
      )
      .innerJoin(
        EcnConnectSchema,
        'connect',
        'subscr.connectSchemaId = connect.id',
      )
      .where('connect.id in (:...ids)', { ids })
      .groupBy('instrument.name')
      .addGroupBy('subscr.instrumentHash');

    if (filterInstruments.length || filterInstrumentsGroups.length) {
      dataQuery.andWhere(
        new Brackets((qb) => {
          if (filterInstruments.length) {
            qb.orWhere('instrument.instrumentHash in (:...filterInstruments)', {
              filterInstruments,
            });
          }

          if (filterInstrumentsGroups.length) {
            qb.orWhere(
              'instrument.instrumentGroup in (:...filterInstrumentsGroups)',
              {
                filterInstrumentsGroups,
              },
            );
          }
        }),
      );
    }

    if (search)
      dataQuery.andWhere('instrument.name like :search', {
        search: `%${search}%`,
      });

    if (compareConnectSchemaId !== undefined) {
      dataQuery.addSelect(
        EcnInstrumentsService.connectionsWithEqual,
        'connections',
      );
      dataQuery.addCommonTableExpression(
        this.dataSource
          .createQueryBuilder()
          .select('subscr.instrumentHash', 'instrumentHash')
          // might be useful
          // .addSelect("subscr.enabled and connect.enabled", "resultEnabled")
          .addSelect(EcnInstrumentsService.subscriptionJsonObject, 'data')
          .from(EcnSubscrSchema, 'subscr')
          // .innerJoin(EcnConnectSchema, "connect", "subscr.connectSchemaId = connect.id")
          .where('subscr.connectSchemaId = :id', {
            id: compareConnectSchemaId,
          }),
        'compare_data',
      );
      if (showOnlyChanged) {
        dataQuery.having(
          // here we check if there are connections with differences and if all connections are present
          // (in case of Missing subscriptions in some connections)
          `(count(distinct ${EcnInstrumentsService.schemasEqual}) > 1 or count(connect.id) <> ${ids.length})`,
        );
      }
    } else {
      dataQuery.addSelect(
        EcnInstrumentsService.connectionsWithoutEqual,
        'connections',
      );
      if (showOnlyChanged) dataQuery.having(`availability_changed = true`);
    }

    const totalQuery = this.dataSource
      .createQueryBuilder()
      .select('count(*)', 'total')
      .from('(' + dataQuery.getQuery() + ')', 'data')
      .setParameters(dataQuery.getParameters());

    if (sortDirection) dataQuery.orderBy('instrument.name', sortDirection);
    if (limit) dataQuery.limit(limit);
    if (offset) dataQuery.offset(offset);

    const totalPromise = totalQuery
      .getRawOne<{ total: GetEcnInstrumentsInConnectionsResponse['total'] }>()
      .then((result) => (result ? Number(result.total) : 0));
    const dataPromise =
      dataQuery.getRawMany<GetEcnInstrumentsInConnectionsData>();

    const [data, total] = await Promise.all([dataPromise, totalPromise]);
    return { data, total };
  }
}
