export const subloginsSettingsJoinFields = [
  {
    field: 'instrumentRel',
    select: ['name', 'priceDigits', 'instrumentGroup'],
  },
  {
    field: 'instrumentRel.instrumentGroup',
    select: ['name'],
  },
  {
    field: 'hedgeCurrency',
    select: ['name'],
  }
];
