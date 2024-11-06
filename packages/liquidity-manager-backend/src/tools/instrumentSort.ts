import { ObjectLiteral } from 'typeorm';
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder';

export function updateBuilderSort<T extends ObjectLiteral>(
    builder: SelectQueryBuilder<T>, 
    many: boolean, 
    orderBysInstName: string, 
    caseSelectInstName: string,
) {
  if (!many) {
    return builder;
  }

  builder.addSelect(`
    CASE 
      WHEN ${caseSelectInstName} LIKE "[%" THEN 1 
      WHEN ${caseSelectInstName} LIKE "@%" THEN 2 
      WHEN ${caseSelectInstName} LIKE "#%" THEN 3 
      ELSE 4 
    END
  `, 'inst_custom_order');

  // We do not use addOrderBy because it does not allow to set object literal. So this won't work:
  // builder.orderBy(our case);
  // builder.addOrderBy(parsed, options.query);
  // So we have to set it directly.
  const orderBys = builder.expressionMap.orderBys;
  builder.expressionMap.orderBys = {
    ['inst_custom_order']: orderBys[orderBysInstName] ?? 'ASC',
    ...orderBys,
  };

  return builder;
}
