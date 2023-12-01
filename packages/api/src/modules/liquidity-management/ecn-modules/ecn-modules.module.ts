import { DynamicModule, Module } from '@nestjs/common';
import { EcnModulesService } from './ecn-modules.service';
import { EcnModulesController } from './ecn-modules.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EcnModule } from './entities/ecn-module.entity';
import { TModuleConfig } from "../../app/app.types";
import { AMTS_DB_NAME } from "../../app/amts-typeorm.config";

@Module({})
export class EcnModulesModule {
  static register(config: TModuleConfig = { withControllers: true }): DynamicModule {
    const dynamicModule: DynamicModule = {
      module: EcnModulesModule,
      imports: [
        TypeOrmModule.forFeature([EcnModule], AMTS_DB_NAME),
      ],
      providers: [
        EcnModulesService,
      ],
      exports: [
        EcnModulesService
      ],
    };

    if (config.withControllers) {
      dynamicModule.controllers = [EcnModulesController];
    }

    return dynamicModule;
  }
}
