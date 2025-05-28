import { Module } from "@nestjs/common";
import { InstrumentsHistoryService } from "./instruments-history.service";
import { InstrumentsHistoryController } from "./instruments-history.controller";

@Module({})
export class InstrumentsHistoryModule {
  static forRoot() {
    return {
      module: InstrumentsHistoryModule,
      imports: [

      ],
      controllers: [
        InstrumentsHistoryController
      ],
      providers: [
        InstrumentsHistoryService,
      ],
      exports: [
        InstrumentsHistoryService,
      ],
    };
  }
}
