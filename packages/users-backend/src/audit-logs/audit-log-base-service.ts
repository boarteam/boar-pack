import { CreateManyDto, CrudRequest, } from '@dataui/crud';
import { DeepPartial, EntityManager, ObjectLiteral, Repository, } from 'typeorm';
import { TypeOrmCrudService } from "@dataui/crud-typeorm";
import { Injectable } from "@nestjs/common";
import { AuditAction, AuditLog } from "./entities/audit-log.entity";
import { TUser } from "../users";
import { plainToClass } from 'class-transformer';

@Injectable()
export class AuditLogBaseService<T extends ObjectLiteral> extends TypeOrmCrudService<T> {

  public async createOne(req: CrudRequest<TUser>, dto: DeepPartial<T>): Promise<T> {
    const result = await super.createOne(req, dto);
    await this.createAuditLog({
      action: AuditAction.CREATE,
      userId: req.auth?.id,
      tableName: this.repo.metadata.tableName,
      newValues: result,
    });
    return result;
  }

  public async createMany(
    req: CrudRequest<TUser>,
    dto: CreateManyDto<DeepPartial<T>>,
  ): Promise<T[]> {
    const result = await super.createMany(req, dto);

    await this.createAuditLog(
      result.map(r => ({
        userId: req.auth?.id,
        tableName: this.repo.metadata.tableName,
        newValues: r,
      }))
    );

    return result;
  }

  public async updateOne(req: CrudRequest<TUser>, dto: DeepPartial<T>): Promise<T> {
    const { allowParamsOverride, returnShallow } = req.options.routes?.updateOneBase || {};
    const paramsFilters = this.getParamFilters(req.parsed);

    const found = await this.getOneOrFail(req, returnShallow);

    const toSave = !allowParamsOverride
      ? { ...found, ...dto, ...paramsFilters, ...req.parsed.authPersist }
      : { ...found, ...dto, ...req.parsed.authPersist };
    const updated = await this.repo.save(
      plainToClass(
        this.entityType,
        toSave,
        req.parsed.classTransformOptions,
      ) as unknown as DeepPartial<T>,
    );

    let result: Partial<T> | null = null;
    if (returnShallow) {
      result = updated;
    } else {
      req.parsed.paramsFilter.forEach((filter) => {
        filter.value = updated[filter.field];
      });

      result = await this.getOneOrFail(req);
    }

    await this.createAuditLog({
      action: AuditAction.UPDATE,
      userId: req.auth?.id,
      tableName: this.repo.metadata.tableName,
      oldValues: found,
      newValues: result,
    });

    return result as T;
  }

  /**
   * Delete one
   * @param req
   */
  public async deleteOne(req: CrudRequest<TUser>): Promise<void | T> {
    const { returnDeleted } = req.options.routes?.deleteOneBase || {};
    // disable cache while deleting
    req.options.query!.cache = false;
    const found = await this.getOneOrFail(req, returnDeleted);
    const toReturn = returnDeleted
      ? plainToClass(this.entityType, { ...found }, req.parsed.classTransformOptions)
      : undefined;
    const deleted =
      req.options.query!.softDelete === true
        ? await this.repo.softRemove(found as DeepPartial<T>)
        : await this.repo.remove(found);

    await this.createAuditLog({
      action: AuditAction.DELETE,
      userId: req.auth?.id,
      tableName: this.repo.metadata.tableName,
      oldValues: found,
    });

    return toReturn;
  }

  public createAuditLog(log: Partial<AuditLog> | Partial<AuditLog>[], manager?: EntityManager): Promise<AuditLog | AuditLog[]> {
    return (manager || this.repo.manager).getRepository(AuditLog).save(log as Partial<AuditLog>);
  }
}

