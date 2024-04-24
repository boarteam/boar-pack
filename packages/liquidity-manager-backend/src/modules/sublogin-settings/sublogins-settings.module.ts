import { Module } from '@nestjs/common';
import { SubloginsSettingsService } from './sublogins-settings.service';
import { SubloginsSettingsController } from './sublogins-settings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AMTS_DB_NAME } from "../liquidity-app/liquidity-app.config";
import { SubloginSettings } from "./entities/sublogin-settings.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SubloginSettings,
    ], AMTS_DB_NAME),
  ],
  providers: [
    SubloginsSettingsService,
  ],
  exports: [
    SubloginsSettingsService,
  ],
  controllers: [SubloginsSettingsController],
})
export class SubloginsSettingsModule {}
