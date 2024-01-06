import { Operators } from "@/components/Table/tableTools";

export const ecnSubscrSchemaSearchableColumns = [
  'descr',
  ['instrument', 'name'],
  ['executionMode', 'name'],
  'markupBid',
  'defaultMarkupBid',
  'markupAsk',
  'defaultMarkupAsk',
  'minVolume',
  'maxVolume',
  'volumeStep',
  'instrumentWeight',
  'descr',
].map(field => ({
  field,
  operator: Operators.containsLow,
}));
