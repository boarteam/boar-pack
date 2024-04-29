import React from "react";
import { InputNumberProps } from "antd/es/input-number";
import { InputNumber } from "antd";
import { isRecordNew } from "../Table";

export const NumberInputHandlingNewRecord: React.FC<InputNumberProps> = ({ value, onChange }) => {
  return <InputNumber
    value={isRecordNew({ id: value }) ? '' : value}
    onChange={onChange}
  />
}
