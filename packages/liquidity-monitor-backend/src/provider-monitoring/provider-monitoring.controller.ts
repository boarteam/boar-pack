import { Controller, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProviderMonitoringService } from "./provider-monitoring.service";
import { CheckPolicies } from "@boarteam/boar-pack-users-backend";
import { ManageAllPolicy } from "./policies/manage-all.policy";

@ApiTags('ProviderMonitoring')
@CheckPolicies(new ManageAllPolicy())
@Controller('provider-monitoring')
export class ProviderMonitoringController {
  constructor(
    readonly service: ProviderMonitoringService,
  ) {}

  @Patch('toggle')
  async toggleMonitoring(): Promise<void> {
    return this.service.toggleMonitoring();
  }
}
