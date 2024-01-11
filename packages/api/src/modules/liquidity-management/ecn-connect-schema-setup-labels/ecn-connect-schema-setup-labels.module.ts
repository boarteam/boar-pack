import { DynamicModule, Module } from '@nestjs/common';
import { EcnConnectSchemaSetupLabelsService } from './ecn-connect-schema-setup-labels.service';
import { EcnConnectSchemaSetupLabelsController } from './ecn-connect-schema-setup-labels.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TModuleConfig } from "../../app/app.types";
import { TP_DB_NAME } from "../../tp-db/tp-db.config";
import { EcnConnectSchemaSetupLabel } from './entities/ecn-connect-schema-setup-label.entity';

@Module({})
export class EcnConnectSchemaSetupLabelsModule {
  static register(config: TModuleConfig = { withControllers: true }): DynamicModule {
    const dynamicModule: DynamicModule = {
      module: EcnConnectSchemaSetupLabelsModule,
      imports: [
        TypeOrmModule.forFeature([EcnConnectSchemaSetupLabel], TP_DB_NAME),
      ],
      providers: [
        EcnConnectSchemaSetupLabelsService,
      ],
      exports: [
        EcnConnectSchemaSetupLabelsService
      ],
    };

    if (config.withControllers) {
      dynamicModule.controllers = [EcnConnectSchemaSetupLabelsController];
    }

    return dynamicModule;
  }
}
