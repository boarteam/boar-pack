import { Module } from '@nestjs/common';
import { EcnModulesService } from './ecn-modules.service';
import { EcnModulesController } from './ecn-modules.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EcnModule } from './entities/ecn-module.entity';
import { AMTS_DB_NAME } from "../liquidity-app/liquidity-app.config";
import { ViewEcnModulesPolicy } from './policies/view-ecn-modules.policy';
import { GenericHistoryModule } from '../../tools/generic-history.module';
import { EcnModulesHistory } from './entities/ecn-modules-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EcnModule], AMTS_DB_NAME),
    GenericHistoryModule.generate<EcnModulesHistory>({
      endpoint: 'liquidity/ecn-modules-history',
      apiTag: 'Ecn Modules History',
      Entity: EcnModulesHistory,
      policy: new ViewEcnModulesPolicy,
      tableName: 'ecn_modules_history',
      htsType: 's',
      hactionColumnExists: false,
      idColumnName: 'id',
    }),
  ],
  providers: [
    EcnModulesService,
  ],
  exports: [
    EcnModulesService
  ],
  controllers: [EcnModulesController],
})
export class EcnModulesModule {}
