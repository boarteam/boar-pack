import { Crud, CrudAuth, CrudController, type CrudRequest, Override, ParsedRequest, } from '@dataui/crud';
import { TUser, User } from './entities/user.entity';
import { Controller, Req } from '@nestjs/common';
import type { Request } from 'express';
import { UsersService } from './users.service';
import { CaslAbilityFactory } from '../casl';
import { SkipPoliciesGuard } from '../casl';
import { ApiTags } from '@nestjs/swagger';
import { TUsersConfig, UsersConfigService } from "./users.config";

@Crud({
  model: {
    type: User,
  },
  routes: {
    only: ['getOneBase'],
  },
  params: {
    id: {
      primary: true,
      disabled: true,
    },
  },
  query: {
    exclude: ['pass'],
  },
})
@CrudAuth({
  property: 'user',
  filter: (user: TUser) => ({
    id: user.id,
  }),
})
@SkipPoliciesGuard()
@ApiTags('Users')
@Controller('me')
export class MeController implements CrudController<User> {
  private config: TUsersConfig;
  constructor(
    public service: UsersService,
    private caslAbilityFactory: CaslAbilityFactory,
    private usersConfig: UsersConfigService,
  ) {
    this.config = this.usersConfig.config;
  }

  get base(): CrudController<User> {
    return this;
  }

  @Override()
  async getOne(
    @ParsedRequest() req: CrudRequest,
    @Req() originReq: Request,
  ): Promise<User> {
    const user = await this.base.getOneBase!(req);
    const ability = await this.caslAbilityFactory.createForUser(user);
    user.policies = this.caslAbilityFactory.packAbility(ability);
    user.experimentalFeatures = this.config.experimentalFeatures;

    return user;
  }
}
