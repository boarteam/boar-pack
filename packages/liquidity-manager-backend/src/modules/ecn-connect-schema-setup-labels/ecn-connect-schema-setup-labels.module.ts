import { Module } from '@nestjs/common';
import { EcnConnectSchemaSetupLabelsService } from './ecn-connect-schema-setup-labels.service';
import { EcnConnectSchemaSetupLabelsController } from './ecn-connect-schema-setup-labels.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AMTS_DB_NAME } from "../liquidity-app/liquidity-app.config";
import { EcnConnectSchemaSetupLabel } from './entities/ecn-connect-schema-setup-label.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EcnConnectSchemaSetupLabel], AMTS_DB_NAME),
  ],
  providers: [
    EcnConnectSchemaSetupLabelsService,
  ],
  exports: [
    EcnConnectSchemaSetupLabelsService
  ],
  controllers: [EcnConnectSchemaSetupLabelsController],
})
export class EcnConnectSchemaSetupLabelsModule {
}
