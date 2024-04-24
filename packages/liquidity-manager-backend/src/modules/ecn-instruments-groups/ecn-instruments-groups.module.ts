import { Module } from '@nestjs/common';
import { EcnInstrumentsGroupsService } from './ecn-instruments-groups.service';
import { EcnInstrumentsGroupsController } from './ecn-instruments-groups.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EcnInstrumentsGroup } from './entities/ecn-instruments-group.entity';
import { AMTS_DB_NAME } from "../liquidity-app/liquidity-app.config";

@Module({
  imports: [
    TypeOrmModule.forFeature([EcnInstrumentsGroup], AMTS_DB_NAME),
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
