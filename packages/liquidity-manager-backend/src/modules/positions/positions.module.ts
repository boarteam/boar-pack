import { Module } from '@nestjs/common';
import { PositionsService } from './positions.service';
import { PositionsController } from './positions.controller';
import { AmtsDcModule } from "../amts-dc/amts-dc.module";

@Module({
  imports: [
    AmtsDcModule,
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
