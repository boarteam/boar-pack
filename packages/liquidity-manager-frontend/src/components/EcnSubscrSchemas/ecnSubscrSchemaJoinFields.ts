export const ecnSubscrSchemaJoinFields = [
  {
    field: 'connectSchema',
    select: ['descr'],
  },
  {
    field: 'instrument',
    select: ['name', 'instrumentGroup'],
  },
  {
    field: 'instrument.instrumentGroup',
    select: ['name'],
  },
  {
    field: 'executionMode',
    select: ['name'],
  },
];
