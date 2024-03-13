import { SelectQueryBuilder } from 'typeorm';
import { VIRTUAL_COLUMN_KEY } from './virtual-column.decorator';

declare module 'typeorm' {
  interface SelectQueryBuilder<Entity> {
    // @ts-ignore
    executeEntitiesAndRawResults(): Promise<{ entities: Entity[]; raw: any[] }>;
  }
}

// @ts-ignore
const originExecute = SelectQueryBuilder.prototype.executeEntitiesAndRawResults;
// @ts-ignore
SelectQueryBuilder.prototype.executeEntitiesAndRawResults = async function (
  queryRunner,
) {
  // @ts-ignore
  const { entities, raw } = await originExecute.call(this, queryRunner);
  entities.forEach((entity, index) => {
    const metaInfo = Reflect.getMetadata(VIRTUAL_COLUMN_KEY, entity) ?? {};
    const item = raw[index];

    for (const [propertyKey, name] of Object.entries<string>(metaInfo)) {
      entity[propertyKey] = item[name];
    }
  });
  return { entities, raw };
};
