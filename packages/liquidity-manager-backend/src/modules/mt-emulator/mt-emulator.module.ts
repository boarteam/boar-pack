import { Module } from "@nestjs/common";
import { MtEmulatorController } from "./mt-emulator.controller";
import { MtEmulatorService } from "./mt-emulator.service";
import { MtEmulatorGateway } from "./mt-emulator.gateway";

@Module({
  imports: [],
  controllers: [MtEmulatorController],
  providers: [
    MtEmulatorService,
    MtEmulatorGateway,
  ],
  exports: []
})
export class MtEmulatorModule {}
