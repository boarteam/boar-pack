import { Module } from '@nestjs/common';
import { EcnModulesService } from './ecn-modules.service';
import { EcnModulesController } from './ecn-modules.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EcnModule } from './entities/ecn-module.entity';
import { AMTS_DB_NAME } from "../liquidity-app/liquidity-app.config";

@Module({
  imports: [
    TypeOrmModule.forFeature([EcnModule], AMTS_DB_NAME),
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
