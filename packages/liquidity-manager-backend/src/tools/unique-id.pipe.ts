import { ArgumentMetadata, ConflictException, mixin, PipeTransform, Type } from '@nestjs/common';
import { ObjectLiteral, Repository } from 'typeorm';
import { memoize } from "lodash";
import { InjectRepository } from "@nestjs/typeorm";
import { AMTS_DB_NAME } from '../modules/liquidity-app/liquidity-app.config';

export const UniqueIdPipe: <Entity extends ObjectLiteral>(Entity: Type<Entity>) => Type<PipeTransform> = memoize(
  createUniqueIdPipe,
);

function createUniqueIdPipe<EntityType extends ObjectLiteral>(Entity: Type<EntityType>): Type<PipeTransform> {
  class UniqueIdPipeMixin<T extends ObjectLiteral> implements PipeTransform {
    constructor(
      @InjectRepository(Entity, AMTS_DB_NAME)
      readonly repo: Repository<EntityType>,
    ) {}

    async transform(value: any, metadata: ArgumentMetadata) {
      if (value && value.id) {
        const id = value.id;
        const entityExists = await this.repo.count({ where: { id } });
        if (entityExists) {
          throw new ConflictException(`Entity with id ${id} already exists`);
        }
      }

      return value;
    }
  }

  return mixin(UniqueIdPipeMixin);
}
