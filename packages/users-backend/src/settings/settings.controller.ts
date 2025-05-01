import { Body, Controller, Get, Patch } from "@nestjs/common";
import { SettingsService } from "./settings.service";
import { ManageSettingsPolicy } from "./policies/manage-settings.policy";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { CheckPolicies, ManageAllPolicy } from "../casl";
import { EventSettingsDto } from "./dto/event-settings.dto";

@CheckPolicies(new ManageAllPolicy())
@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
  ) {}

  @CheckPolicies(new ManageSettingsPolicy())
  @Get('events')
  @ApiOkResponse({
    type: EventSettingsDto,
  })
  getEventSettings(): Promise<EventSettingsDto> {
    return this.settingsService.getEventSettings();
  }

  @CheckPolicies(new ManageSettingsPolicy())
  @Patch('events')
  setEventSettings(
    @Body() events: EventSettingsDto,
  ) {
    return this.settingsService.setEventSettings(events);
  }
}
