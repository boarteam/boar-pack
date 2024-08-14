import { Operators } from "@jifeon/boar-pack-common-frontend";

export const ecnSubscrSchemaSearchableColumns = [
  { field: 'descr', operator: Operators.containsLow },
  {
    field: 'connectSchema',
    searchField: 'connectSchema.id',
    filterField: 'connectSchema.id',
    operator: Operators.containsLow,
    filterOperator: Operators.in,
  },
  { 
    field: 'enabled', 
    operator: Operators.equals,
    filterOperator: Operators.in,
  },
  { 
    field: 'tradeEnabled', 
    operator: Operators.equals,
    filterOperator: Operators.in,
  },
  {
    field: 'instrument',
    searchField: 'instrument.name',
    filterField: 'instrument.instrumentHash',
    operator: Operators.containsLow,
    filterOperator: Operators.in,
  },
  {
    field: 'instrument.instrumentGroup.name',
    searchField: 'instrument.instrumentGroup.name',
    filterField: 'instrument.instrumentGroup.id',
    operator: Operators.containsLow,
    filterOperator: Operators.in,
  },
  { field: 'connectSchema.descr', operator: Operators.containsLow },
  {
    field: 'executionMode',
    searchField: 'executionMode.name',
    filterField: 'executionMode.id',
    operator: Operators.containsLow,
    filterOperator: Operators.in,
  },
  { 
    field: 'markupBid', 
    filterOperator: Operators.between,
    operator: Operators.containsLow,
  },
  { 
    field: 'defaultMarkupBid', 
    filterOperator: Operators.between,
    operator: Operators.containsLow,
  },
  { 
    field: 'markupAsk', 
    filterOperator: Operators.between,
    operator: Operators.containsLow,
  },
  { 
    field: 'defaultMarkupAsk', 
    filterOperator: Operators.between,
    operator: Operators.containsLow,
  },
  { 
    field: 'minVolume', 
    filterOperator: Operators.between,
    operator: Operators.containsLow,
  },
  { 
    field: 'maxVolume', 
    filterOperator: Operators.between,
    operator: Operators.containsLow,
  },
  { 
    field: 'volumeStep', 
    filterOperator: Operators.between,
    operator: Operators.containsLow,
  },
  { field: 'instrumentWeight', operator: Operators.containsLow },
  { field: 'descr', operator: Operators.containsLow },
];
