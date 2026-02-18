import { Controller, Req, UnauthorizedException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@dataui/crud';
import { CheckPolicies } from "../casl";
import { AuditLogsService } from './audit-logs.service';
import { AuditLog } from './entities/audit-log.entity';
import { ViewAuditLogsPolicy } from "./policies/view-audit-logs.policy";
import { Action, CaslAbilityFactory, Subjects } from "../casl";
import { Request } from "express";
import { TUser } from "../users";

@Crud({
  model: {
    type: AuditLog,
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
      user: {
        allow: ['id', 'name'],
      }
    }
  },
  routes: {
    only: ['getManyBase'],
  },
})
@CheckPolicies(new ViewAuditLogsPolicy())
@ApiTags('AuditLogs')
@Controller('audit-logs')
export class AuditLogsController implements CrudController<AuditLog>{
  constructor(
    readonly service: AuditLogsService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  get base(): CrudController<AuditLog> {
    return this;
  }

  @Override('getManyBase')
  async getMany(
    @Req() request: Request,
    @ParsedRequest() req: CrudRequest<TUser>,
  ) {
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException();
    }

    const ability = await this.caslAbilityFactory.createForUser(user);
    if (ability.cannot(Action.Manage, 'all')) {
      const tablesNames = this.service.repo.manager.connection.entityMetadatas
        .filter(meta => meta.target instanceof Function && ability.can(Action.Manage, meta.target as Subjects))
        .map(meta => meta.tableName);

      req.parsed.search = {
        $and: [
          req.parsed.search,
          { tableName: { $in: tablesNames } },
        ],
      }
    }

    return this.base.getManyBase!(req);
  }
}
