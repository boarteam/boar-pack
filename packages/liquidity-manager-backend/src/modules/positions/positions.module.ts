import { Module } from '@nestjs/common';
import { PositionsService } from './positions.service';
import { PositionsController } from './positions.controller';
import { AmtsDcModule } from "../amts-dc/amts-dc.module";
import { UsersInstModule } from "../users-inst/users-inst.module";

@Module({})
export class PositionsModule {
  static forRestApi() {
    return {
      module: PositionsModule,
      imports: [
        AmtsDcModule,
        UsersInstModule.forFeature(),
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
    };
  }
}
