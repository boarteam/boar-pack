import { Controller, DynamicModule, Get, Post, Param, Module, Query } from '@nestjs/common';
import { InjectDataSource, InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, ObjectLiteral, Repository } from "typeorm";
import { ApiExtraModels, ApiOkResponse, ApiTags, getSchemaPath } from "@nestjs/swagger";
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
      private _selectColumns: string[];

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

      private get selectColumns() {
        if (this._selectColumns) {
          return this._selectColumns;
        }

        const columnsMap: Record<string, string> = {};
        for (const { databaseName: columnName } of this.repo.metadata.columns) {
          columnsMap[`new.${columnName}`] = `new_${columnName}`;
          columnsMap[`old.${columnName}`] = `old_${columnName}`;
        }
        
        columnsMap['new.hid'] = 'hid';
        delete columnsMap['old.hid'];

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
        }

        this._htsColumnName = columnsMap['new.hts'] ? 'hts' : 'ts';
        columnsMap[`new.${this._htsColumnName}`] = 'hts';
        delete columnsMap[`old.${this._htsColumnName}`];

        this._selectColumns = Object.entries(columnsMap).map(([columnName, alias]) => `${columnName} as ${alias}`);
        return this._selectColumns;
      }

      convertMsToHts(ms: number) {
        switch (config.htsType) {
          case 's': return ms / 1000;
          case 'ms':
          default: return ms;
        }
      }

      async getMany({
        search,
        limit,
        offset,
        sort,
        ids,
        hts,
      }: GetHistoryDatasQueryDto): Promise<GetHistoryResponse<Entity>> {
        const tableName = config.tableName;

        const dataQuery = this.dataSource
          .createQueryBuilder()
          .from(tableName, 'new')
          .select(this.selectColumns)
          .leftJoin(
            tableName,
            'old',
            `
              old.${config.idColumnName} = new.${config.idColumnName}
              and 
              old.${this.htsColumnName} = (
                select max(${this.htsColumnName})
                from ${tableName}
                where ${config.idColumnName} = new.${config.idColumnName}
                and ${this.htsColumnName} < new.${this.htsColumnName}
              )
          `)

        if (hts) {
          dataQuery.andWhere(
            new Brackets(qb => {
              qb
                .andWhere(`new.${this._htsColumnName} < ${this.convertMsToHts(hts[1])}`)
                .andWhere(`new.${this._htsColumnName} > ${this.convertMsToHts(hts[0])}`)
            })
          )
        }

        if (ids?.length) {
          dataQuery.andWhere(
            new Brackets(qb => {
              qb
                .orWhere(`new.${config.idColumnName} in (:...ids)`, { ids: Array.isArray(ids) ? ids : [ids] })
                .orWhere(`old.${config.idColumnName} in (:...ids)`, { ids: Array.isArray(ids) ? ids : [ids] })
            })
          )
        }

        if (search) {
          dataQuery.andWhere(
            new Brackets(qb => {
              // for (let i = 0; i < f.length; i++) {
                // if (f[i][1] === 'haction') continue;
                qb.orWhere('lower(new.descr) like lower(:search)', { search: `%${search}%` })
                qb.orWhere('lower(old.descr) like lower(:search)', { search: `%${search}%` })
              // }
            })
          )
        }

        const totalQuery = this.dataSource
          .createQueryBuilder()
          .select('count(*)', 'total')
          .from('(' + dataQuery.getQuery() + ')', 'data')
          .setParameters(dataQuery.getParameters());

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
