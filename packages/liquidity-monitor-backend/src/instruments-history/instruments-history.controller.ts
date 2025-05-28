import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InstrumentsHistoryService } from "./instruments-history.service";
import { CheckPolicies, ManageAllPolicy } from "@boarteam/boar-pack-users-backend";

@ApiTags('InstrumentsHistory')
@CheckPolicies(new ManageAllPolicy())
@Controller('instruments-history')
export class InstrumentsHistoryController {
  constructor(
    readonly service: InstrumentsHistoryService,
  ) {}
}
