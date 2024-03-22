// antd switch but not for boolean, for numbers 0 and 1
import { Switch } from "antd";
import React from "react";
import { SwitchProps } from "antd/es/switch";

interface NumberSwitcherProps extends Omit<SwitchProps, 'value' | 'onChange'> {
  value?: number;
  onChange?: (value?: number) => void;
}

export const NumberSwitch: React.FC<NumberSwitcherProps> = ({
  value,
  onChange,
  ...props
}) => {
  return (
    <Switch
      checkedChildren="1"
      unCheckedChildren="0"
      checked={value === 1}
      onChange={(checked) => {
        onChange?.(checked ? 1 : 0);
      }}
      {...props}
    />
  );
}
