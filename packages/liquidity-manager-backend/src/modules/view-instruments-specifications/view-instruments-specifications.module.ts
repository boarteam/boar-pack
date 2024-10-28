import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ViewInstrumentsSpecification } from './entities/view-instruments-specifications.entity';
import { AMTS_DB_NAME } from "../liquidity-app/liquidity-app.config";
import { ViewInstrumentsSpecificationsService } from './view-instruments-specifications.service';
import { ViewInstrumentsSpecificationsController } from './view-instruments-specifications.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ViewInstrumentsSpecification,
    ], AMTS_DB_NAME),
  ],
  providers: [
    ViewInstrumentsSpecificationsService,
  ],
  exports: [
    ViewInstrumentsSpecificationsService
  ],
  controllers: [ViewInstrumentsSpecificationsController],
})
export class ViewInstrumentsSpecificationsModule {}
