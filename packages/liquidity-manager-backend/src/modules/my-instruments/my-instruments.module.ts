import { Module } from "@nestjs/common";
import { MyInstrumentsController } from "./my-instruments.controller";
import { EcnInstrumentsModule } from "../ecn-instruments/ecn-instruments.module";

@Module({
  imports: [
    EcnInstrumentsModule,
  ],
  controllers: [
    MyInstrumentsController,
  ],
  providers: [],
  exports: [],
})
export class MyInstrumentsModule {}
