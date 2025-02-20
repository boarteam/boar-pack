import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Crud, CrudController } from '@dataui/crud';
import { TokensService } from './tokens.service';
import { Token } from './entities/token.entity';
import { TokenUpdateDto } from "./dto/token-update.dto";
import { ManageTokensPolicy } from "./policies/manage-tokens.policy";
import { ViewTokensPolicy } from "./policies/view-tokens.policy";
import { CheckPolicies } from "../casl";

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
    exclude: ['hash'],
  },
  routes: {
    only: ['getManyBase', 'updateOneBase', 'deleteOneBase'],
    getManyBase: {
      decorators: [
        CheckPolicies(new ViewTokensPolicy()),
      ],
    },
  },
  dto: {
    update: TokenUpdateDto,
  },
})
@CheckPolicies(new ManageTokensPolicy())
@ApiTags('Tokens')
@Controller('tokens')
export class TokensController implements CrudController<Token> {
  constructor(
    readonly service: TokensService,
  ) {}
}
