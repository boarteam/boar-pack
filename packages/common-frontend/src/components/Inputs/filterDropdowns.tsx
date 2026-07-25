import {
  Tag,
  Input,
  InputNumber,
  Space,
  Button,
  Switch,
  Descriptions,
  Checkbox,
  Typography,
} from 'antd';
import { ColumnFilterItem, FilterDropdownProps } from 'antd/es/table/interface';
import { ReactNode, useEffect, useState } from 'react';

const { Text } = Typography;

export const booleanFilters: ColumnFilterItem[] = [
  { text: <Tag color="red">Disabled</Tag>, value: 0 },
  { text: <Tag color="green">Enabled</Tag>, value: 1 },
];

export function NumberFilterDropdown({
  setSelectedKeys,
  selectedKeys,
  confirm,
  clearFilters,
  close,
}: FilterDropdownProps) {
  return (
    <DynamicOptionsFilterDropdown confirm={confirm} clearFilters={clearFilters}>
      <InputNumber
        value={selectedKeys.length ? Number(selectedKeys[0]) : undefined}
        // antd reports a cleared InputNumber as null, which has to clear the filter as well
        onChange={(value) => setSelectedKeys(value === null || value === undefined ? [] : [value])}
        onPressEnter={() => confirm()}
        step={1}
        style={{ margin: 4, width: 250 }}
        placeholder="Please Enter"
      />
    </DynamicOptionsFilterDropdown>
  );
}

export function SwitchFilterDropdown({
  setSelectedKeys,
  selectedKeys,
  confirm,
  clearFilters,
  close,
}: FilterDropdownProps) {
  return (
    <DynamicOptionsFilterDropdown confirm={confirm} clearFilters={clearFilters}>
      <Descriptions
        style={{ margin: '8px 16px', width: 200 }}
        items={[
          {
            label: 'Only filled values',
            children: (
              <Switch
                checked={selectedKeys.length ? Boolean(selectedKeys[0]) : undefined}
                onChange={(value) => setSelectedKeys([Number(value)])}
              />
            ),
            style: { padding: 0 },
            contentStyle: { justifyContent: 'flex-end' },
          },
        ]}
      />
    </DynamicOptionsFilterDropdown>
  );
}

export function CheckboxFilterDropdown({
  setSelectedKeys,
  selectedKeys,
  confirm,
  clearFilters,
  close,
}: FilterDropdownProps) {
  return (
    <DynamicOptionsFilterDropdown confirm={confirm} clearFilters={clearFilters}>
      <Checkbox
        checked={selectedKeys.length ? Boolean(selectedKeys[0]) : undefined}
        onChange={(event) => setSelectedKeys([Number(event.target.checked)])}
        indeterminate={selectedKeys.length === 0}
        style={{ margin: '8px 16px', width: 250 }}
      >
        {selectedKeys.length ? (
          selectedKeys[0] ? (
            'Will show only filled values'
          ) : (
            'Will show only empty values'
          )
        ) : (
          <Text type="secondary">Click to filter</Text>
        )}
      </Checkbox>
    </DynamicOptionsFilterDropdown>
  );
}

/**
 * A bound left empty stays undefined — getFiltersSearch turns a range with one open end
 * into $gte / $lte.
 */
type TNumberRange = [number | undefined, number | undefined];

const EMPTY_NUMBER_RANGE: TNumberRange = [undefined, undefined];

const toBound = (key: React.Key | undefined): number | undefined =>
  key === undefined || key === '' ? undefined : Number(key);

const toNumberRange = (keys: React.Key[]): TNumberRange | undefined =>
  keys.length >= 2 ? [toBound(keys[0]), toBound(keys[1])] : undefined;

export function NumberRangeFilterDropdown({
  setSelectedKeys,
  selectedKeys,
  confirm,
  clearFilters,
  close,
}: FilterDropdownProps) {
  const [range, updateRange] = useState<TNumberRange | undefined>(toNumberRange(selectedKeys));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- antd owns the filter state: when the table resets or restores its filters the dropdown has to adopt the new keys, and the inputs stay editable in between, so the range cannot be derived during render
    updateRange(toNumberRange(selectedKeys));
  }, [selectedKeys]);

  useEffect(() => {
    // an open end is passed on as undefined, which React.Key does not describe
    setSelectedKeys((range ?? []) as React.Key[]);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- antd rebuilds setSelectedKeys on every render of the dropdown, so depending on it would push the range back into the table on every render and re-render it in a loop
  }, [range]);

  return (
    <DynamicOptionsFilterDropdown confirm={confirm} clearFilters={clearFilters}>
      <InputNumber
        value={range?.[0]}
        onChange={(value) => updateRange(([, to] = EMPTY_NUMBER_RANGE) => [value ?? undefined, to])}
        onPressEnter={() => confirm()}
        step={1}
        style={{ margin: 4, width: 250 }}
        placeholder="From"
      />
      <InputNumber
        value={range?.[1]}
        onChange={(value) =>
          updateRange(([from] = EMPTY_NUMBER_RANGE) => [from, value ?? undefined])
        }
        onPressEnter={() => confirm()}
        step={1}
        style={{ margin: 4, width: 250 }}
        placeholder="To"
      />
    </DynamicOptionsFilterDropdown>
  );
}

export function StringFilterDropdown({
  setSelectedKeys,
  selectedKeys,
  confirm,
  clearFilters,
  close,
}: FilterDropdownProps) {
  return (
    <DynamicOptionsFilterDropdown confirm={confirm} clearFilters={clearFilters}>
      <Input
        value={selectedKeys.length ? String(selectedKeys[0]) : undefined}
        onChange={(event) =>
          setSelectedKeys(event.target.value === undefined ? [] : [event.target.value])
        }
        onPressEnter={() => confirm()}
        style={{ margin: 4, width: 250 }}
        placeholder="Please Enter"
      />
    </DynamicOptionsFilterDropdown>
  );
}

export const DynamicOptionsFilterDropdown = ({
  children,
  confirm,
  clearFilters,
}: Partial<FilterDropdownProps> & { children: ReactNode }) => {
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column' }}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {children}
      <Space className="ant-table-filter-dropdown-btns">
        <Button
          type="link"
          onClick={() => {
            // antd always provides confirm/clearFilters to filterDropdown renderers;
            // the props are Partial only to make children the sole required prop
            clearFilters!();
            confirm!();
          }}
          size="small"
        >
          Reset
        </Button>
        <Button
          type="primary"
          size="small"
          onClick={() => {
            confirm!();
          }}
        >
          OK
        </Button>
      </Space>
    </div>
  );
};
