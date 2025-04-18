import { Controller, Post } from "@nestjs/common";
import { TelegrafService } from "./telegraf.service";
import { ApiTags } from "@nestjs/swagger";
import { ManageSettingsPolicy } from "../settings/policies/manage-settings.policy";
import { CheckPolicies, ManageAllPolicy } from "../casl";

@CheckPolicies(new ManageAllPolicy())
@ApiTags('Telegraf')
@Controller('telegraf')
export class TelegrafController {
  constructor(
    private readonly telegrafService: TelegrafService,
  ) {
  }

  @CheckPolicies(new ManageSettingsPolicy())
  @Post('test')
  async testTelegraf() {
    return await this.telegrafService.test();
  }
}
