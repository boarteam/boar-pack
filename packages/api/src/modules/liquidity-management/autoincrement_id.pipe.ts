import { ArgumentMetadata, ConflictException, mixin, PipeTransform, Type } from '@nestjs/common';
import { ObjectLiteral, Repository } from 'typeorm';
import { memoize } from "lodash";
import { InjectRepository } from "@nestjs/typeorm";
import { AMTS_DB_NAME } from "../amts-db/amts-db.config";

export const AutoincrementIdPipe: <Entity extends ObjectLiteral>(Entity: Type<Entity>) => Type<PipeTransform> = memoize(
  createAutoincrementIdPipe,
);

function createAutoincrementIdPipe<EntityType extends ObjectLiteral>(Entity: Type<EntityType>): Type<PipeTransform> {
  class AutoincrementIdPipeMixin<T extends ObjectLiteral> implements PipeTransform {
    constructor(
      @InjectRepository(Entity, AMTS_DB_NAME)
      readonly repo: Repository<EntityType>,
    ) {
    }

    async transform(value: any, metadata: ArgumentMetadata) {
      const id = value.id;
      if (id === undefined || id === null || id === '') {
        const result = await this.repo.createQueryBuilder('entity')
          .select('coalesce(max(entity.id), 0) + 1', 'nextId')
          .getRawOne<{ nextId: number }>();
        value.id = result?.nextId ?? 1;
      }

      return value;
    }
  }

  return mixin(AutoincrementIdPipeMixin);
}
