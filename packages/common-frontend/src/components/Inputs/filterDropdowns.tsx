import { Tag, Input, InputNumber, Space, Button, Switch, Descriptions, Checkbox, Typography } from "antd";
import { ColumnFilterItem, FilterDropdownProps } from "antd/es/table/interface";
import { ReactNode, useEffect, useState } from "react";

const { Text } = Typography;

export const booleanFilters: ColumnFilterItem[] = [
  { text: <Tag color='red'>Disabled</Tag>, value: 0 },
  { text: <Tag color='green'>Enabled</Tag>, value: 1 },
];

export function NumberFilterDropdown({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }: FilterDropdownProps) {
  return (
    <DynamicOptionsFilterDropdown confirm={confirm} clearFilters={clearFilters}>
      <InputNumber
        value={selectedKeys.length ? Number(selectedKeys[0]) : undefined}
        onChange={(value) => setSelectedKeys(value === undefined ? [] : [value])}
        onPressEnter={() => confirm()}
        step={1}
        style={{ margin: 4, width: 250 }}
        placeholder="Please Enter"
      />
    </DynamicOptionsFilterDropdown>
  )
}

export function SwitchFilterDropdown({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }: FilterDropdownProps) {
  return (
    <DynamicOptionsFilterDropdown confirm={confirm} clearFilters={clearFilters}>
      <Descriptions
        style={{ margin: '8px 16px', width: 200 }}
        items={[
          {
            label: 'Only filled values',
            children: <Switch
              checked={selectedKeys.length ? Boolean(selectedKeys[0]) : undefined}
              onChange={(value) => setSelectedKeys([value as any])}
            />,
            style: { padding: 0 },
            contentStyle: { justifyContent: 'flex-end' },
          }
        ]}
      />
    </DynamicOptionsFilterDropdown>
  )
}

export function CheckboxFilterDropdown({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }: FilterDropdownProps) {
  return (
    <DynamicOptionsFilterDropdown confirm={confirm} clearFilters={clearFilters}>
      <Checkbox
        checked={selectedKeys.length ? Boolean(selectedKeys[0]) : undefined}
        onChange={(event) => setSelectedKeys([event.target.checked as any])}
        indeterminate={selectedKeys.length === 0}
        style={{ margin: '8px 16px', width: 250 }}
      >
        {selectedKeys.length ? (selectedKeys[0] ? 'Will show only filled values' : 'Will show only empty values') : <Text type="secondary">Click to filter</Text>}
      </Checkbox>
    </DynamicOptionsFilterDropdown>
  )
}

export function NumberRangeFilterDropdown({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }: FilterDropdownProps) {
  const [range, updateRange] = useState<[number, number] | undefined>(selectedKeys);

  useEffect(() => {
    updateRange(selectedKeys);
  }, [selectedKeys]);

  useEffect(() => {
    setSelectedKeys(range);
  }, [range]);

  return (
    <DynamicOptionsFilterDropdown confirm={confirm} clearFilters={clearFilters}>
      <InputNumber
        value={range?.[0]}
        onChange={value => updateRange(prev => ([value, prev[1]]))}
        onPressEnter={() => confirm()}
        step={1}
        style={{ margin: 4, width: 250 }}
        placeholder="From"
      />
      <InputNumber
        value={range?.[1]}
        onChange={value => updateRange(prev => ([prev[0], value]))}
        onPressEnter={() => confirm()}
        step={1}
        style={{ margin: 4, width: 250 }}
        placeholder="To"
      />
    </DynamicOptionsFilterDropdown>
  )
}

export function StringFilterDropdown({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }: FilterDropdownProps) {
  return (
    <DynamicOptionsFilterDropdown confirm={confirm} clearFilters={clearFilters}>
      <Input
        value={selectedKeys.length ? String(selectedKeys[0]) : undefined}
        onChange={(event) => setSelectedKeys(event.target.value === undefined ? [] : [event.target.value])}
        onPressEnter={() => confirm()}
        style={{ margin: 4, width: 250 }}
        placeholder="Please Enter"
      />
    </DynamicOptionsFilterDropdown>
  )
}

export const DynamicOptionsFilterDropdown = ({
  children,
  confirm,
  clearFilters,
}: Partial<FilterDropdownProps> & { children: ReactNode}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }} onKeyDown={(e) => e.stopPropagation()}>
      {children}
      <Space className="ant-table-filter-dropdown-btns">
        <Button
          type="link"
          onClick={() => {
            clearFilters();
            confirm();
          }}
          size="small"
        >
          Reset
        </Button>
        <Button
          type="primary"
          size="small"
          onClick={() => {
            confirm();
          }}
        >
          OK
        </Button>
      </Space>
    </div>
  )
};
