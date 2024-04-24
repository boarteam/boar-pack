import { Module } from '@nestjs/common';
import { EcnModuleTypesService } from './ecn-module-types.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EcnModuleType } from './entities/ecn-module-type.entity';
import { AMTS_DB_NAME } from "../liquidity-app/liquidity-app.config";

@Module({
  imports: [
    TypeOrmModule.forFeature([EcnModuleType], AMTS_DB_NAME),
  ],
  providers: [
    EcnModuleTypesService,
  ],
  exports: [
    EcnModuleTypesService
  ],
})
export class EcnModuleTypesModule {}
