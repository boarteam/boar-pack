import { Body, Controller, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Crud, CrudAuth, CrudController, type CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
import { TokensService } from './tokens.service';
import { Token } from './entities/token.entity';
import { ManageMyTokensPolicy } from "./policies/manage-my-tokens.policy";
import { TUser } from "../users";
import { CheckPolicies } from "../casl";
import { TokenUpdateDto } from "./dto/token-update.dto";
import { TokenCreateDto } from "./dto/token-create.dto";
import { Request } from "express";
import { BcryptService } from "../bcrypt";
import { randomBytes } from 'crypto';
import { TokenWithValueDto } from "./dto/token-with-value.dto";

@Crud({
  model: {
    type: Token,
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
    join: {},
    exclude: ['hash'],
  },
  routes: {
    only: ['getManyBase', 'createOneBase', 'updateOneBase', 'deleteOneBase'],
  },
  dto: {
    create: TokenCreateDto,
    update: TokenUpdateDto,
  },
})
@CrudAuth({
  property: 'user',
  filter: (user: TUser) => ({
    userId: user.id,
  }),
  persist: (user: TUser) => ({
    userId: user.id,
  }),
})
@CheckPolicies(new ManageMyTokensPolicy())
@ApiTags('Tokens')
@Controller('my/tokens')
export class MyTokensController implements CrudController<Token>{
  constructor(
    readonly service: TokensService,
    readonly bcryptService: BcryptService,
  ) {}

  get base(): CrudController<Token> {
    return this;
  }

  @Override()
  async createOne(
    @ParsedRequest() req: CrudRequest,
    @Req() originReq: Request,
    @Body() dto: TokenCreateDto,
  ): Promise<TokenWithValueDto> {
    const rawValue = randomBytes(32).toString('hex');
    const hashedValue = await this.bcryptService.hashPassword(rawValue);
    const tokenData: Partial<Token> = {
      userId: originReq.user!.id,
      name: dto.name,
      hash: hashedValue,
    }
    const token = await this.base.createOneBase!(req, tokenData as Token);

    return {
      ...token,
      value: `${token.id}.${rawValue}`,
    }
  }
}
