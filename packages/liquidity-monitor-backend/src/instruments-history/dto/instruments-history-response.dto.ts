class InstrumentsHistoryDto {
  symbolName: string;
  groupName: string;
  platformName: string;
  availabilityPercent: number;
  scheduledOffQuotesDuration: string; // Format: hh:mm
  downtimeDuration: string; // Format: hh:mm
  incidentsCount: number;
  maxIncidentDuration: string; // Format: hh:mm
  meanIncidentDuration: string; // Format: hh:mm
  reason: string; // Format: tid down - hh:mm, platform down - hh:mm, ...
}

export class InstrumentsHistoryResponseDto {
  data: InstrumentsHistoryDto[];
}
