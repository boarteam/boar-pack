import { DynamicModule, Module } from '@nestjs/common';
import { EcnConnectSchemaService } from './ecn-connect-schema.service';
import { EcnConnectSchemaController } from './ecn-connect-schema.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EcnConnectSchema } from './entities/ecn-connect-schema.entity';
import { TModuleConfig } from "../../app/app.types";
import { AMTS_DB_NAME } from "../../amts-db/amts-db.config";

@Module({})
export class EcnConnectSchemaModule {
  static register(config: TModuleConfig = { withControllers: true }): DynamicModule {
    const dynamicModule: DynamicModule = {
      module: EcnConnectSchemaModule,
      imports: [
        TypeOrmModule.forFeature([EcnConnectSchema], AMTS_DB_NAME),
      ],
      providers: [
        EcnConnectSchemaService,
      ],
      exports: [
        EcnConnectSchemaService,
      ],
    };

    if (config.withControllers) {
      dynamicModule.controllers = [EcnConnectSchemaController];
    }

    return dynamicModule;
  }
}
