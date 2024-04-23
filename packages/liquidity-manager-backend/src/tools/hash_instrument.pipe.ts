import { ArgumentMetadata, ConflictException, mixin, PipeTransform, Type } from '@nestjs/common';
import { ObjectLiteral, Repository } from 'typeorm';
import { memoize } from "lodash";
import { InjectRepository } from "@nestjs/typeorm";
import { AMTS_DB_NAME } from "../liquidity-app.config";
import { crc64 } from 'crc64-ecma';

export const CRC64HashPipe: <Entity extends ObjectLiteral>(Entity: Type<Entity>, baseColumn: keyof Entity, targetColumn: keyof Entity) => Type<PipeTransform> = memoize(
  createCRC64HashPipe,
);

function createCRC64HashPipe<EntityType extends ObjectLiteral>(Entity: Type<EntityType>, baseColumnName: keyof EntityType, targetColumnName: keyof EntityType): Type<PipeTransform> {
  class CRC64HashPipeMixin<T extends ObjectLiteral> implements PipeTransform {
    constructor(
      @InjectRepository(Entity, AMTS_DB_NAME)
      readonly repo: Repository<EntityType>,
    ) {
    }

    async transform(value: any, metadata: ArgumentMetadata) {
      const baseColumnValue = value[baseColumnName];
      if (baseColumnValue === undefined || baseColumnValue === null || baseColumnValue === '') {
        return value;
      }

      value[targetColumnName] = String(crc64(baseColumnValue));
      return value;
    }
  }

  return mixin(CRC64HashPipeMixin);
}
