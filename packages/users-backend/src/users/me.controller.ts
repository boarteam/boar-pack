import { Crud, CrudAuth, CrudController, CrudRequest, Override, ParsedRequest, } from '@nestjsx/crud';
import { TUser, User } from './entities/user.entity';
import { Controller, Req } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { SkipPoliciesGuard } from '../casl/policies.guard';
import { ApiTags } from '@nestjs/swagger';

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
  constructor(
    public service: UsersService,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

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

    return user;
  }
}
