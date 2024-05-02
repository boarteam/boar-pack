import { Body, Controller, Post, UseFilters } from '@nestjs/common';
import { LiquidityManagersService } from './liquidity-managers.service';
import { Crud } from '@nestjsx/crud';
import { LiquidityManager } from './entities/liquidity-manager.entity';
import { LiquidityManagerCreateDto } from './dto/liquidity-manager-create.dto';
import { ApiCreatedResponse, ApiExtraModels, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { LiquidityManagerUpdateDto } from "./dto/liquidity-manager-update.dto";
import { ManageLiquidityManagersPolicy } from "./policies/manage-liquidity-managers.policy";
import { ViewLiquidityManagersPolicy } from "./policies/view-liquidity-managers.policy";
import { LiquidityManagersInterceptor } from './liquidity-managers.interceptor';
import { LiquidityManagerCheckDto, LiquidityManagerCheckResponseDto } from "./dto/liquidity-manager-check.dto";
import { CheckPolicies } from "@jifeon/boar-pack-users-backend";
import { TypeOrmExceptionFilter } from "@jifeon/boar-pack-common-backend/dist/tools";

@Crud({
  model: {
    type: LiquidityManager,
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
    exclude: ['pass'],
  },
  routes: {
    only: ['getManyBase', 'createOneBase', 'updateOneBase', 'deleteOneBase'],
    getManyBase: {
      decorators: [
        CheckPolicies(new ViewLiquidityManagersPolicy()),
      ],
    },
    createOneBase: {
      interceptors: [
        LiquidityManagersInterceptor,
      ],
    },
    updateOneBase: {
      interceptors: [
        LiquidityManagersInterceptor,
      ],
    }
  },
  dto: {
    create: LiquidityManagerCreateDto,
    update: LiquidityManagerUpdateDto,
  },
})
@CheckPolicies(new ManageLiquidityManagersPolicy())
@UseFilters(TypeOrmExceptionFilter)
@ApiTags('LiquidityManagers')
@ApiExtraModels(LiquidityManagerCheckResponseDto)
@Controller('liquidityManagers')
export class LiquidityManagersController {
  constructor(
    private readonly service: LiquidityManagersService,
  ) {}

  @Post('check')
  @CheckPolicies(new ViewLiquidityManagersPolicy())
  @ApiCreatedResponse({
    schema: {
      $ref: getSchemaPath(LiquidityManagerCheckResponseDto),
    }
  })
  checkConnection(
    @Body() checkDto: LiquidityManagerCheckDto,
  ): Promise<LiquidityManagerCheckResponseDto> {
    return this.service.checkConnection(checkDto);
  }
}
