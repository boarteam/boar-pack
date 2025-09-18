import { CreateManyDto, CrudRequest, } from '@dataui/crud';
import { DeepPartial, ObjectLiteral, Repository, } from 'typeorm';
import { TypeOrmCrudService } from "@dataui/crud-typeorm";
import { Injectable } from "@nestjs/common";
import { AuditAction, AuditLog } from "./entities/audit-log.entity";
import { TUser } from "../users";
import { plainToClass } from 'class-transformer';

@Injectable()
export class AuditLogBaseService<T extends ObjectLiteral> extends TypeOrmCrudService<T> {

  public async createOne(req: CrudRequest<TUser>, dto: DeepPartial<T>): Promise<T> {
    const result = await super.createOne(req, dto);
    await this.repo.manager.getRepository(AuditLog).save({
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

    await this.repo.manager.getRepository(AuditLog).save(
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

    await this.repo.manager.getRepository(AuditLog).save({
      action: AuditAction.UPDATE,
      userId: req.auth?.id,
      tableName: this.repo.metadata.tableName,
      oldValues: found,
      newValues: result,
    });

    return result as T;
  }

  // TODO: implement

  // /**
  //  * Recover one
  //  * @param req
  //  * @param dto
  //  */
  // public async recoverOne(req: CrudRequest): Promise<T> {
  //   // disable cache while recovering
  //   req.options.query.cache = false;
  //   const found = await this.getOneOrFail(req, false, true);
  //   return this.repo.recover(found as DeepPartial<T>);
  // }
  //
  // /**
  //  * Replace one
  //  * @param req
  //  * @param dto
  //  */
  // public async replaceOne(req: CrudRequest, dto: DeepPartial<T>): Promise<T> {
  //   const { allowParamsOverride, returnShallow } = req.options.routes.replaceOneBase;
  //   const paramsFilters = this.getParamFilters(req.parsed);
  //   // disable cache while replacing
  //   req.options.query.cache = false;
  //   const [_, found] = await oO(this.getOneOrFail(req, returnShallow));
  //   const toSave = !allowParamsOverride
  //     ? { ...(found || {}), ...dto, ...paramsFilters, ...req.parsed.authPersist }
  //     : {
  //       ...(found || /* istanbul ignore next */ {}),
  //       ...paramsFilters,
  //       ...dto,
  //       ...req.parsed.authPersist,
  //     };
  //   const replaced = await this.repo.save(
  //     plainToClass(
  //       this.entityType,
  //       toSave,
  //       req.parsed.classTransformOptions,
  //     ) as unknown as DeepPartial<T>,
  //   );
  //
  //   if (returnShallow) {
  //     return replaced;
  //   } else {
  //     const primaryParams = this.getPrimaryParams(req.options);
  //
  //     /* istanbul ignore if */
  //     if (!primaryParams.length) {
  //       return replaced;
  //     }
  //
  //     req.parsed.search = primaryParams.reduce(
  //       (acc, p) => ({ ...acc, [p]: replaced[p] }),
  //       {},
  //     );
  //     return this.getOneOrFail(req);
  //   }
  // }
  //
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

    await this.repo.manager.getRepository(AuditLog).save({
      action: AuditAction.DELETE,
      userId: req.auth?.id,
      tableName: this.repo.metadata.tableName,
      oldValues: found,
    });

    return toReturn;
  }
}
