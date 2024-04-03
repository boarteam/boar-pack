import { ArgumentMetadata, ConflictException, mixin, PipeTransform, Type } from '@nestjs/common';
import { ObjectLiteral, Repository } from 'typeorm';
import { memoize } from "lodash";
import { InjectRepository } from "@nestjs/typeorm";
import { AMTS_DB_NAME } from "../liquidity-app.config";

type TAutoincrementIdPipeParams<Entity> = {
  Entity: Type<Entity>,
  idField?: string,
  uniqueFields?: (keyof Entity extends string ? keyof Entity : never)[],
}

export const AutoincrementIdPipe = memoize(createAutoincrementIdPipe);

function createAutoincrementIdPipe<EntityType extends ObjectLiteral>({
  Entity,
  idField = 'id',
  uniqueFields = [],
}: TAutoincrementIdPipeParams<EntityType>): Type<PipeTransform> {
  class AutoincrementIdPipeMixin<T extends ObjectLiteral> implements PipeTransform {
    constructor(
      @InjectRepository(Entity, AMTS_DB_NAME)
      readonly repo: Repository<EntityType>,
    ) {
    }

    async transform(value: any, metadata: ArgumentMetadata) {
      const id = value[idField];
      if (id === undefined || id === null || id === '') {
        const query = this.repo
          .createQueryBuilder('entity')
          .select(`coalesce(max(entity.${idField}), 0) + 1`, 'nextId');

        if (uniqueFields.length > 0) {
          uniqueFields.forEach((field) => {
            query.andWhere(`entity.${field} = :${field}`, { [field]: value[field] });
          });
        }

        const result = await query.getRawOne<{ nextId: number }>();
        value[idField] = result?.nextId ?? 1;
      }

      return value;
    }
  }

  return mixin(AutoincrementIdPipeMixin);
}
