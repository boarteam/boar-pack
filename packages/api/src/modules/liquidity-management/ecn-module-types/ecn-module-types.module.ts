import { DynamicModule, Module } from '@nestjs/common';
import { EcnModuleTypesService } from './ecn-module-types.service';
import { EcnModuleTypesController } from './ecn-module-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EcnModuleType } from './entities/ecn-module-type.entity';
import { TModuleConfig } from "../../app/app.types";
import { AMTS_DB_NAME } from "../../amts-db/amts-db.config";

@Module({})
export class EcnModuleTypesModule {
  static register(config: TModuleConfig = { withControllers: true }): DynamicModule {
    const dynamicModule: DynamicModule = {
      module: EcnModuleTypesModule,
      imports: [
        TypeOrmModule.forFeature([EcnModuleType], AMTS_DB_NAME),
      ],
      providers: [
        EcnModuleTypesService,
      ],
      exports: [
        EcnModuleTypesService
      ],
    };

    if (config.withControllers) {
      dynamicModule.controllers = [EcnModuleTypesController];
    }

    return dynamicModule;
  }
}
