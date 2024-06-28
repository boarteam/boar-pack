import { Module } from '@nestjs/common';
import { EcnInstrumentsGroupsService } from './ecn-instruments-groups.service';
import { EcnInstrumentsGroupsController } from './ecn-instruments-groups.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EcnInstrumentsGroup } from './entities/ecn-instruments-group.entity';
import { AMTS_DB_NAME } from "../liquidity-app/liquidity-app.config";
import { GenericHistoryModule } from "../../tools/generic-history.module";
import { ViewEcnInstrumentsGroupsPolicy } from "./policies/view-ecn-instruments-groups.policy";
import { EcnInstrumentsGroupHistory } from "./entities/ecn-instruments-group-hst.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([EcnInstrumentsGroup, EcnInstrumentsGroupHistory], AMTS_DB_NAME),
    GenericHistoryModule.generate<EcnInstrumentsGroupHistory>({
      endpoint: 'liquidity/ecn-instruments-groups-hst',
      apiTag: 'Ecn Instruments Groups History',
      Entity: EcnInstrumentsGroupHistory,
      policy: new ViewEcnInstrumentsGroupsPolicy,
      tableName: 'ecn_instruments_groups_hst',
      htsType: 's',
      hactionColumnExists: true,
      idColumnName: 'id',
    }),
  ],
  providers: [
    EcnInstrumentsGroupsService,
  ],
  exports: [
    EcnInstrumentsGroupsService
  ],
  controllers: [EcnInstrumentsGroupsController],
})
export class EcnInstrumentsGroupsModule {}
