import { Controller, DynamicModule, Get, Post, Param, Module, Query } from '@nestjs/common';
import { InjectDataSource, InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, ObjectLiteral, Repository } from "typeorm";
import { ApiTags } from "@nestjs/swagger";
import { AMTS_DB_NAME } from "../modules/liquidity-app/liquidity-app.config";
import { CheckPolicies, IPolicyHandler } from "@jifeon/boar-pack-users-backend";
import { GetHistoryResponse } from "./dto/history-get-many-response.dto";
import { GetHistoryDatasQueryDto } from "./dto/history-get-many-query.dto";
import { Brackets } from 'typeorm';

type TGenericHistoryModuleConfig<Entity> = {
  endpoint: string;
  apiTag: string;
  Entity: new () => Entity;
  policy: IPolicyHandler;
  tableName: string;
  htsType: 's' | 'ms';
  hactionColumnExists: boolean;
  idColumnName: string;
}

@Module({})
export class GenericHistoryModule {
  static generate<Entity extends ObjectLiteral>(config: TGenericHistoryModuleConfig<Entity>): DynamicModule {
    class GenericHistoryService {
      private _htsColumnName: string;

      constructor(
        @InjectRepository(config.Entity, AMTS_DB_NAME)
        readonly repo: Repository<Entity>,

        @InjectDataSource(AMTS_DB_NAME)
        readonly dataSource: DataSource,
      ) {
      }

      private get htsColumnName() {
        if (this._htsColumnName) {
          return this._htsColumnName;
        }

        this._htsColumnName = 'ts';
        for (const { databaseName: columnName } of this.repo.metadata.columns) {
          if (columnName === 'hts') {
            this._htsColumnName = 'hts';
          }
        }

        return this._htsColumnName;
      }

      private selectColumns(withOld = true, withHaction = true) {
        const columnsMap: Record<string, string> = {};
        for (const { databaseName: columnName } of this.repo.metadata.columns) {
          columnsMap[`new.${columnName}`] = `new_${columnName}`;
          if (withOld) columnsMap[`old.${columnName}`] = `old_${columnName}`;
        }

        columnsMap['new.hid'] = 'hid';
        delete columnsMap['old.hid'];

        if (withHaction) {
          if (config.hactionColumnExists) {
            columnsMap[`
            case 
                when new.haction = 1 then 'Created'
                when new.haction = 2 then 'Updated'
                when new.haction = 3 then 'Deleted'
            end
          `] = 'haction';
            delete columnsMap['new.haction'];
            delete columnsMap['old.haction'];
          } else {
            columnsMap[`
            case 
              when old.${config.idColumnName} is null then 'Created'
              when new.${config.idColumnName} is not null then 'Updated'
              when new.${config.idColumnName} is null then 'Deleted'
            end 
          `] = 'haction';
          }
        } else {
          delete columnsMap['new.haction'];
          delete columnsMap['old.haction'];
        }

        this._htsColumnName = columnsMap['new.hts'] ? 'hts' : 'ts';
        columnsMap[`new.${this._htsColumnName}`] = 'hts';
        delete columnsMap[`old.${this._htsColumnName}`];

        return Object.entries(columnsMap).map(([columnName, alias]) => `${columnName} as ${alias}`);
      }

      convertMsToHts(ms: number) {
        switch (config.htsType) {
          case 's': return ms / 1000;
          case 'ms':
          default: return ms;
        }
      }

      private getDataQuery(tableName: string, {
        search,
        ids,
        hts,
        hactions,
      }: GetHistoryDatasQueryDto, withOld = true) {
        const dataQuery = this.dataSource
          .createQueryBuilder()
          .from(tableName, 'new');

        if (withOld) {
          dataQuery.select(this.selectColumns(withOld, withOld));
        }

        if (withOld) {
          dataQuery.leftJoin(
            config.tableName,
            'old',
            `
              old.${config.idColumnName} = new.${config.idColumnName}
              and 
              old.${this.htsColumnName} = (
                select max(${this.htsColumnName})
                from ${config.tableName}
                where ${config.idColumnName} = new.${config.idColumnName}
                and ${this.htsColumnName} < new.${this.htsColumnName}
              )
          `);
        }

        if (hts) {
          dataQuery.andWhere(
            new Brackets(qb => {
              qb.andWhere(`new.${this.htsColumnName} >= ${this.convertMsToHts(hts[0])}`)
              qb.andWhere(`new.${this.htsColumnName} <= ${this.convertMsToHts(hts[1])}`)
            })
          )
        }

        if (ids?.length) {
          dataQuery.andWhere(
            new Brackets(qb => {
              qb.orWhere(`new.${config.idColumnName} in (:...ids)`, { ids: Array.isArray(ids) ? ids : [ids] });
              if (withOld) {
                qb.orWhere(`old.${config.idColumnName} in (:...ids)`, { ids: Array.isArray(ids) ? ids : [ids] });
              }
            })
          )
        }

        if (search) {
          dataQuery.andWhere(
            new Brackets(qb => {
              for (const { databaseName: columnName } of this.repo.metadata.columns) {
                qb.orWhere(`lower(new.${columnName}) like lower(:search)`, { search: `%${search}%` })
                if (withOld) {
                  qb.orWhere(`lower(old.${columnName}) like lower(:search)`, { search: `%${search}%` });
                }
              }
            })
          )
        }

        if (hactions) {
          dataQuery.orHaving('haction in (:...hactions)', { hactions: Array.isArray(hactions) ? hactions : [hactions] })
        }

        return dataQuery;
      }

      async getMany({
        search,
        limit,
        offset,
        sort,
        ids,
        hts,
        hactions,
      }: GetHistoryDatasQueryDto): Promise<GetHistoryResponse<Entity>> {
        const tableName = config.tableName;

        const dataQueryForTotal = this.getDataQuery('searched_records', {
          search,
          ids,
          hts,
          hactions,
        });

        const totalQuery = this.dataSource
          .createQueryBuilder()
          .addCommonTableExpression(
            this.getDataQuery(tableName, {
              search,
              ids,
              hts: undefined,
              hactions,
            }, false),
            'searched_records'
          )
          .select('count(*)', 'total')
          .from('(' + dataQueryForTotal.getQuery() + ')', 'data')
          .setParameters(dataQueryForTotal.getParameters());

        const dataQuery = this.getDataQuery(tableName, {
          search,
          ids,
          hts,
          hactions,
        });

        if (limit) dataQuery.limit(limit);
        if (offset) dataQuery.offset(offset);

        if (sort && sort.length) dataQuery.orderBy(...sort);
        else dataQuery.orderBy(`new.${this.htsColumnName}`, 'DESC');

        const totalPromise = totalQuery
          .getRawOne<{ total: GetHistoryResponse<Entity>['total'] }>()
          .then((result) => (result ? Number(result.total) : 0));

        const dataPromise =
          dataQuery.getRawMany()
            .then(data => data.map(({
              hts,
              haction,
              hid,
              ...restFields
            }) => {
              const resultValue = {
                new: {},
                old: {},
                haction,
                hts,
                hid,
              };

              let newEmpty = true;
              let oldEmpty = true;
              for (const [fieldName, value] of Object.entries(restFields)) {
                const type = fieldName.substring(0, 3);
                const entityProp = fieldName.substring(4);
                if (!newEmpty || type === 'new') newEmpty = false;
                if (!oldEmpty || type === 'old') oldEmpty = false;
                // @ts-ignore
                resultValue[type][entityProp] = value;
              }

              // @ts-ignore
              resultValue.new = newEmpty ? resultValue.new : this.repo.create(resultValue.new);
              // @ts-ignore
              resultValue.old = oldEmpty ? resultValue.new : this.repo.create(resultValue.old);

              if (haction === undefined) {
                resultValue.haction = newEmpty
                  ? 'Deleted'
                  : oldEmpty
                    ? 'Updated'
                    : 'Created'
              }

              return resultValue;
            }) as GetHistoryResponse<Entity>['data']);

        const [data, total] = await Promise.all([dataPromise, totalPromise]);
        return { data, total };
      }

      async revert(hid: string) {
        // redo with config.idColumnName
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

      @Post('/revert/:hid')
      async revert(@Param('hid') hid: string): Promise<void> {
        return await this.service.revert(hid);
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
