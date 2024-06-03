import { Controller, DynamicModule, Get, Module, Query } from '@nestjs/common';
import { InjectDataSource, InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, ObjectLiteral, Repository } from "typeorm";
import { ApiExtraModels, ApiOkResponse, ApiTags, getSchemaPath } from "@nestjs/swagger";
import { AMTS_DB_NAME } from "../modules/liquidity-app/liquidity-app.config";
import { CheckPolicies, IPolicyHandler } from "@jifeon/boar-pack-users-backend";
import { GetHistoryResponse } from "./dto/history-get-many-response.dto";
import { GetHistoryDatasQueryDto } from "./dto/history-get-many-query.dto";

type TGenericHistoryModuleConfig<Entity> = {
  endpoint: string;
  apiTag: string;
  Entity: new () => Entity;
  policy: IPolicyHandler;
  tableName: string;
}

@Module({})
export class GenericHistoryModule {
  static generate<Entity extends ObjectLiteral>(config: TGenericHistoryModuleConfig<Entity>): DynamicModule {
    class GenericHistoryService {
      constructor(
        @InjectRepository(config.Entity, AMTS_DB_NAME)
        readonly repo: Repository<Entity>,

        @InjectDataSource(AMTS_DB_NAME)
        readonly dataSource: DataSource,
      ) {
      }

      async getMany({
        search,
        limit,
        page,
        sortDirection,
      }: GetHistoryDatasQueryDto): Promise<GetHistoryResponse<Entity>> {
        const historyTableName = config.tableName;

        let history_ts_column = 'ts';
        const selectColumns = [];
        for (const { propertyName: cName } of this.repo.metadata.columns) {
          if (cName === 'hts') {
            history_ts_column = 'hts';
          }

          selectColumns.push(`new.${cName} AS new_${cName}`, `old.${cName} AS old_${cName}`);
        }

        const dataQuery = this.dataSource
          .createQueryBuilder()
          .from(historyTableName, 'new')

        const totalQuery = this.dataSource
          .createQueryBuilder()
          .select('count(*)', 'total')
          .from('(' + dataQuery.select(['new.hid']).getQuery() + ')', 'data')
          .setParameters(dataQuery.getParameters());

        // if (sortDirection) dataQuery.orderBy('instrument.hts', sortDirection);

        if (limit) dataQuery.limit(limit);
        if (page) dataQuery.offset((page - 1) * (limit ?? 0));

        dataQuery
          .select(selectColumns)
          .leftJoin(
            historyTableName,
            'old',
            `
              old.id = new.id
              and 
              old.${history_ts_column} = (
                select max(${history_ts_column})
                from ${historyTableName}
                where id = new.id
                and ${history_ts_column} < new.${history_ts_column}
              )
          `)
          .orderBy(`new.${history_ts_column}`, 'DESC');

        const totalPromise = totalQuery
          .getRawOne<{ total: GetHistoryResponse<Entity>['total'] }>()
          .then((result) => (result ? Number(result.total) : 0));

        const dataPromise =
          dataQuery.getRawMany()
            .then(data => {
              return data.map(({
                new_ts: ts,
                old_ts,
                new_haction: haction,
                old_haction,
                new_hid: hid,
                old_hid,
                ...restFields
              }) => {
                const resultValue = {
                  new: {},
                  old: {},
                  ts,
                  haction,
                  hid,
                };

                console.log(ts, haction, hid, restFields)
                for (const [fieldName, value] of Object.entries(restFields)) {
                  const type = fieldName.substring(0, 3);
                  const entityProp = fieldName.substring(4);
                  // @ts-ignore
                  resultValue[type][entityProp] = value;
                }

                return resultValue;
              }) as GetHistoryResponse<Entity>['data'];
            });

        const [data, total] = await Promise.all([dataPromise, totalPromise]);

        // @ts-ignore
        return { data, total };
      }
    }

    // @ApiExtraModels(GetHistoryDatasQueryDto)
    // @ApiExtraModels(GetHistoryResponse<Entity>)
    @CheckPolicies(config.policy)
    @ApiTags(config.apiTag)
    @Controller(config.endpoint)
    class GenericHistoryController {
      constructor(
        private readonly service: GenericHistoryService,
      ) {
      }

      @Get('/')
      // @ApiOkResponse({
      //   schema: {
      //     $ref: getSchemaPath(GetHistoryResponse<Entity>),
      //   }
      // })
      async getMany(@Query() query: GetHistoryDatasQueryDto): Promise<GetHistoryResponse<Entity>> {
        return await this.service.getMany(query);
      }
    }

    return {
      module: GenericHistoryModule,
      imports: [
        TypeOrmModule.forFeature([config.Entity], AMTS_DB_NAME),
      ],
      providers: [
        GenericHistoryService,
      ],
      controllers: [
        GenericHistoryController,
      ],
      exports: [
        GenericHistoryService,
      ],
    };
  }
}
