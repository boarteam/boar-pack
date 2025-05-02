import { Body, Controller, Get, Patch, Post } from "@nestjs/common";
import { TelegrafService } from "./telegraf.service";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { ManageSettingsPolicy } from "../settings/policies/manage-settings.policy";
import { CheckPolicies, ManageAllPolicy } from "../casl";
import { TelegramSettingsDto } from "./dto/telegram-settings.dto";
import { TelegramSettingsUpdateDto } from "./dto/telegram-settings-update.dto";

@CheckPolicies(new ManageAllPolicy())
@ApiTags('Telegraf')
@Controller('telegraf')
export class TelegrafController {
  constructor(
    private readonly telegrafService: TelegrafService,
  ) {
  }

  @CheckPolicies(new ManageSettingsPolicy())
  @Get('telegram')
  @ApiOkResponse({
    type: TelegramSettingsDto,
  })
  getTelegramSettings(): Promise<TelegramSettingsDto> {
    return this.telegrafService.getTelegramSettings();
  }

  @CheckPolicies(new ManageSettingsPolicy())
  @Patch('telegram')
  setTelegramSettings(
    @Body() telegram: TelegramSettingsUpdateDto,
  ) {
    return this.telegrafService.setTelegramSettings(telegram);
  }

  @CheckPolicies(new ManageSettingsPolicy())
  @Post('test')
  async testTelegraf() {
    return await this.telegrafService.test();
  }
}
