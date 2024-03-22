import { Select } from "antd";
import React from "react";

export const MultiStringSelect: React.FC<{
  value?: string[];
  onChange?: (value: string[]) => void;
}> = ({ value, onChange }) => {
  return (
    <Select<string[]>
      dropdownStyle={{ minWidth: 200 }}
      allowClear={true}
      mode="tags"
      style={{ minWidth: 200 }}
      maxTagCount='responsive'
      value={value}
      onChange={onChange}
      notFoundContent='Enter manually'
    />
  )
}
