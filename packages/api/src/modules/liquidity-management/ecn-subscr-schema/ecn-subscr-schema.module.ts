import { DynamicModule, Module } from '@nestjs/common';
import { EcnSubscrSchemaService } from './ecn-subscr-schema.service';
import { EcnSubscrSchemaController } from './ecn-subscr-schema.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EcnSubscrSchema } from './entities/ecn-subscr-schema.entity';
import { TModuleConfig } from "../../app/app.types";
import { AMTS_DB_NAME } from "../../amts-db/amts-db.config";
import { EcnExecutionMode } from "./entities/ecn-execution-mode.entity";
import { GenericLiquidityModule } from "../generic-liquidity.module";
import { ViewEcnSubscrSchemaPolicy } from "./policies/view-ecn-subscr-schema.policy";

@Module({})
export class EcnSubscrSchemaModule {
  static register(config: TModuleConfig = { withControllers: true }): DynamicModule {
    const dynamicModule: DynamicModule = {
      module: EcnSubscrSchemaModule,
      imports: [
        TypeOrmModule.forFeature([
          EcnSubscrSchema,
          EcnExecutionMode,
        ], AMTS_DB_NAME),
        GenericLiquidityModule.generate<EcnExecutionMode>({
          endpoint: 'liquidity/ecn-execution-modes',
          apiTag: 'Ecn Execution Modes',
          Entity: EcnExecutionMode,
          policy: new ViewEcnSubscrSchemaPolicy,
        })
      ],
      providers: [
        EcnSubscrSchemaService,
      ],
      exports: [
        EcnSubscrSchemaService,
      ],
    };

    if (config.withControllers) {
      dynamicModule.controllers = [EcnSubscrSchemaController];
    }

    return dynamicModule;
  }
}
