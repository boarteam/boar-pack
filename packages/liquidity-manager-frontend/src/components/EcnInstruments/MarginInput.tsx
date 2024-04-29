import { InputNumber } from "antd";
import React from "react";
import { InputNumberProps } from "antd/lib";
import { EcnInstrument } from "@api/generated";

type MarginInputProps = InputNumberProps & {
  instrument: EcnInstrument;
};

export function dividerToMargin(record: Pick<EcnInstrument, 'marginDivider' | 'marginMode'>): number {
  const divider = Number(record.marginDivider);
  if (isNaN(divider) || divider === 0) return 0;
  return (record.marginMode.name === 'MARGIN_CALC_FOREX' ? 1 : 100) / divider;
}

export function marginToDivider(record: Pick<EcnInstrument, 'marginDivider' | 'marginMode'>, margin: number): number {
  if (margin === 0) return 0;
  return (record.marginMode.name === 'MARGIN_CALC_FOREX' ? 1 : 100) / margin;
}

export const MarginInput: React.FC<MarginInputProps> = ({
  value,
  onChange,
  instrument,
  ...props
}) => {
  return (
    <InputNumber
      value={dividerToMargin(instrument)}
      onChange={(value) => {
        const v = Number(value);
        onChange?.(String(isFinite(v) && marginToDivider(instrument, v) || 0));
      }}
      {...props}
    />
  );
}
