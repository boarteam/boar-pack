import { Module } from '@nestjs/common';
import { EcnSubscrSchemaService } from './ecn-subscr-schema.service';
import { EcnSubscrSchemaController } from './ecn-subscr-schema.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EcnSubscrSchema } from './entities/ecn-subscr-schema.entity';
import { AMTS_DB_NAME } from "../liquidity-app.config";
import { EcnExecutionMode } from "./entities/ecn-execution-mode.entity";
import { GenericLiquidityModule } from "../tools/generic-liquidity.module";
import { ViewEcnSubscrSchemaPolicy } from "./policies/view-ecn-subscr-schema.policy";

@Module({
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
  controllers: [EcnSubscrSchemaController],
})
export class EcnSubscrSchemaModule {}
