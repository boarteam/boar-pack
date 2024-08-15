import { Controller, UseFilters } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Crud, CrudController } from '@nestjsx/crud';
import { CheckPolicies } from "@jifeon/boar-pack-users-backend";
import { LiquidityManagersUsersService } from './liquidity-managers-users.service';
import { LiquidityManagersUser } from './entities/liquidity-managers-user.entity';
import { LiquidityManagersUserCreateDto } from './dto/liquidity-managers-user-create.dto';
import { LiquidityManagersUserUpdateDto } from "./dto/liquidity-managers-user-update.dto";
import { ManageLiquidityManagersPolicy, ViewLiquidityManagersPolicy } from "../liquidity-managers";
import { TypeOrmExceptionFilter } from "@jifeon/boar-pack-common-backend/src/tools";

@Crud({
  model: {
    type: LiquidityManagersUser,
  },
  params: {
    id: {
      field: 'id',
      type: 'uuid',
      primary: true,
    },
  },
  query: {
    alwaysPaginate: true,
    join: {
      user: {},
    },
  },
  routes: {
    only: ['getManyBase', 'createOneBase', 'updateOneBase', 'deleteOneBase'],
    getManyBase: {
      decorators: [
        CheckPolicies(new ViewLiquidityManagersPolicy()),
      ],
    },
  },
  dto: {
    create: LiquidityManagersUserCreateDto,
    update: LiquidityManagersUserUpdateDto,
  },
})
@CheckPolicies(new ManageLiquidityManagersPolicy())
@ApiTags('LiquidityManagersUsers')
@Controller('liquidity-managers-users')
@UseFilters(TypeOrmExceptionFilter)
export class LiquidityManagersUsersController implements CrudController<LiquidityManagersUser>{
  constructor(
    readonly service: LiquidityManagersUsersService,
  ) {}
}
