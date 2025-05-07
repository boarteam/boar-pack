import { Module } from '@nestjs/common';
import { ScheduleModule as NestScheduleModule } from "@nestjs/schedule";
import ScheduleService from "./schedule.service";

@Module({
  imports: [
    NestScheduleModule.forRoot(),
  ],
  providers: [
    ScheduleService
  ],
  exports: [
    ScheduleService,
  ],
})
export class ScheduleModule {
  constructor() {}
}
