import { Controller, DynamicModule, Module } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from "typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";
import { Crud } from "@nestjsx/crud";
import { CrudOptions } from "@nestjsx/crud/lib/interfaces";
import { CheckPolicies, IPolicyHandler } from "../casl/policies.guard";
import { ApiTags } from "@nestjs/swagger";
import { AMTS_DB_NAME } from "../amts-db/amts-db.config";

type TGenericLiquidityModuleConfig<Entity> = {
  endpoint: string;
  apiTag: string;
  Entity: new () => Entity;
  policy: IPolicyHandler;
  crudOptions?: CrudOptions;
}

@Module({})
export class GenericLiquidityModule {
  static generate<Entity extends ObjectLiteral>(config: TGenericLiquidityModuleConfig<Entity>): DynamicModule {
    class GenericLiquidityService extends TypeOrmCrudService<Entity> {
      constructor(
        @InjectRepository(config.Entity, AMTS_DB_NAME)
        readonly repo: Repository<Entity>,
      ) {
        super(repo);
      }
    }

    @Crud(Object.assign({
      model: {
        type: config.Entity,
      },
      params: {
        id: {
          field: 'id',
          type: 'number',
          primary: true,
        },
      },
      query: {
        alwaysPaginate: true,
      },
      routes: {
        only: ['getManyBase'],
      },
    }, config.crudOptions))
    @CheckPolicies(config.policy)
    @ApiTags(config.apiTag)
    @Controller(config.endpoint)
    class GenericLiquidityController {
      constructor(
        private readonly service: GenericLiquidityService,
      ) {
      }
    }

    return {
      module: GenericLiquidityModule,
      imports: [
        TypeOrmModule.forFeature([config.Entity], AMTS_DB_NAME),
      ],
      providers: [
        GenericLiquidityService,
      ],
      controllers: [
        GenericLiquidityController,
      ],
      exports: [
        GenericLiquidityService,
      ],
    };
  }
}
