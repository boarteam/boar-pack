import { LogLevel } from "../entities/event-log.entity";

export class EventLogTimelineDto {
  time: string;
  records: number;
  logLevel: LogLevel;
  startTime: string;
  endTime: string;
}``
