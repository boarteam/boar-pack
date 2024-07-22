import { Module } from '@nestjs/common';
import { PositionsService } from './positions.service';
import { PositionsController } from './positions.controller';
import { TpDcModule } from "../tp-dc/tp-dc.module";

@Module({
  imports: [
    TpDcModule,
  ],
  providers: [
    PositionsService,
  ],
  exports: [
    PositionsService,
  ],
  controllers: [
    PositionsController,
  ]
})
export class PositionsModule {
}
