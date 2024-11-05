import { ObjectLiteral } from 'typeorm';

export function getCustomInstrumentSort(
  originalSort: ObjectLiteral,
  instrumentPath: string,
  finalInstrumentPath?: string,
): ObjectLiteral {
  const sql = `
    CASE 
      WHEN ${finalInstrumentPath ?? instrumentPath} LIKE "[%" THEN 1 
      WHEN ${finalInstrumentPath ?? instrumentPath} LIKE "@%" THEN 2 
      WHEN ${finalInstrumentPath ?? instrumentPath} LIKE "#%" THEN 3 
      ELSE 4 
    END
  `;

  return {
    [sql]: originalSort[instrumentPath] ?? 'ASC',
    ...originalSort,
  };
}
