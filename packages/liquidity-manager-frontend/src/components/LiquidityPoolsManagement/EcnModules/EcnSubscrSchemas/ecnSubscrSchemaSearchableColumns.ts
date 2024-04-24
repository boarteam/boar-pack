import { Operators } from "@/components/Table/tableTools";

export const ecnSubscrSchemaSearchableColumns = [
  { field: 'descr', operator: Operators.containsLow },
  { field: 'connectSchemaId', operator: Operators.equals },
  { field: ['instrument', 'name'], operator: Operators.containsLow },
  { field: ['executionMode', 'name'], operator: Operators.containsLow },
  { field: 'markupBid', operator: Operators.containsLow },
  { field: 'defaultMarkupBid', operator: Operators.containsLow },
  { field: 'markupAsk', operator: Operators.containsLow },
  { field: 'defaultMarkupAsk', operator: Operators.containsLow },
  { field: 'minVolume', operator: Operators.containsLow },
  { field: 'maxVolume', operator: Operators.containsLow },
  { field: 'volumeStep', operator: Operators.containsLow },
  { field: 'instrumentWeight', operator: Operators.containsLow },
  { field: 'descr', operator: Operators.containsLow },
];
