import { Body, Controller, Get, Patch } from "@nestjs/common";
import { SettingsService } from "./settings.service";
import { ManageSettingsPolicy } from "./policies/manage-settings.policy";
import { TelegramSettingsDto } from "./dto/telegram-settings.dto";
import { TelegramSettingsUpdateDto } from "./dto/telegram-settings-update.dto";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { CheckPolicies, ManageAllPolicy } from "../casl";

@CheckPolicies(new ManageAllPolicy())
@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
  ) {}

  @CheckPolicies(new ManageSettingsPolicy())
  @Get('telegram')
  @ApiOkResponse({
    type: TelegramSettingsDto,
  })
  getTelegramSettings(): Promise<TelegramSettingsDto> {
    return this.settingsService.getTelegramSettings();
  }

  @CheckPolicies(new ManageSettingsPolicy())
  @Patch('telegram')
  setTelegramSettings(
    @Body() telegram: TelegramSettingsUpdateDto,
  ) {
    return this.settingsService.setTelegramSettings(telegram);
  }
}
