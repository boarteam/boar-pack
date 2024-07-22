import { Tag, Input, InputNumber, Space, Button } from "antd";
import { ColumnFilterItem, FilterDropdownProps } from "antd/es/table/interface";
import { ReactNode } from "react";

export const booleanFilters: ColumnFilterItem[] = [
  { text: <Tag color='red'>Disabled</Tag>, value: 0 },
  { text: <Tag color='green'>Enabled</Tag>, value: 1 },
];

export function NumberFilterDropdown({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }: FilterDropdownProps) {
  return (
    <DynamicOptionsFilterDropdown confirm={confirm} clearFilters={clearFilters}>
      <InputNumber
        value={selectedKeys}
        onChange={(e) => setSelectedKeys(e.target.value)}
        onPressEnter={() => confirm()}
        style={{ margin: 4, width: 250 }}
        placeholder="Please Enter"
      />
    </DynamicOptionsFilterDropdown>
  )
}

export function StringFilterDropdown({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }: FilterDropdownProps) {
  return (
    <DynamicOptionsFilterDropdown confirm={confirm} clearFilters={clearFilters}>
      <Input
        value={selectedKeys}
        onChange={(e) => setSelectedKeys(e.target.value)}
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
            confirm({ closeDropdown: false });
          }}
          size="small"
        >
          Reset
        </Button>
        <Button
          type="primary"
          size="small"
          onClick={() => {
            confirm({ closeDropdown: false });
          }}
        >
          OK
        </Button>
      </Space>
    </div>
  )
};
