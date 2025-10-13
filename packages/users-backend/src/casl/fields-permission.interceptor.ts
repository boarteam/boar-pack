// fields-permission.interceptor.ts
import { CallHandler, ExecutionContext, ForbiddenException, Injectable, NestInterceptor, } from '@nestjs/common';
import { permittedFieldsOf } from '@casl/ability/extra';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { Action } from "./action.enum";
import { Subjects } from "./casl-ability.factory";
import { PARSED_CRUD_REQUEST_KEY } from "@dataui/crud/lib/constants";

type Fields = string[] | undefined;

@Injectable()
export class FieldsPermissionInterceptor implements NestInterceptor {
  constructor(
    private readonly subject: Subjects,
    private readonly action: Action,
  ) {
  }

  private anyField = '*';

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const req = ctx.switchToHttp().getRequest<Request>();
    const ability = req.user?.ability;
    if (!ability) {
      throw new ForbiddenException('No ability found on user');
    }

    const permitted = permittedFieldsOf(ability, this.action, this.subject, {
      // how to read fields from each rule
      fieldsFrom: (rule) => rule.fields || [this.anyField],
    }) as string[];

    if (permitted.includes(this.anyField)) {
      // all fields are permitted
      return next.handle();
    }

    // @ts-ignore
    const crudReq = req[PARSED_CRUD_REQUEST_KEY];
    const requested = (crudReq?.parsed?.fields as Fields) ?? [];
    const finalFields =
      (requested && requested.length > 0)
        ? requested.filter((f) => permitted.includes(f))
        : permitted;

    if (!finalFields || finalFields.length === 0) {
      throw new ForbiddenException('No readable fields for this resource');
    }

    // enforce selection for Nestjsx/CRUD + TypeORM
    //    This makes CRUD build QB with SELECT only these columns.
    if (!crudReq.parsed) crudReq.parsed = {} as any;
    (crudReq.parsed as any).fields = finalFields;

    return next.handle();
  }
}
