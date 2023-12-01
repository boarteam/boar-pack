import { DynamicModule, Module } from '@nestjs/common';
import { EcnInstrumentsGroupsService } from './ecn-instruments-groups.service';
import { EcnInstrumentsGroupsController } from './ecn-instruments-groups.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EcnInstrumentsGroup } from './entities/ecn-instruments-group.entity';
import { TModuleConfig } from "../../app/app.types";
import { AMTS_DB_NAME } from "../../app/amts-typeorm.config";

@Module({})
export class EcnInstrumentsGroupsModule {
  static register(config: TModuleConfig = { withControllers: true }): DynamicModule {
    const dynamicModule: DynamicModule = {
      module: EcnInstrumentsGroupsModule,
      imports: [
        TypeOrmModule.forFeature([EcnInstrumentsGroup], AMTS_DB_NAME),
      ],
      providers: [
        EcnInstrumentsGroupsService,
      ],
      exports: [
        EcnInstrumentsGroupsService
      ],
    };

    if (config.withControllers) {
      dynamicModule.controllers = [EcnInstrumentsGroupsController];
    }

    return dynamicModule;
  }
}
