import { ProFormSelectProps } from "@ant-design/pro-form/lib/components/Select";
import { useState, useEffect } from "react";
import { ProFormSelect } from "@ant-design/pro-form";

type RelationSelectProps<T> = ProFormSelectProps & {
  selectedItem: T | null | undefined,
  onChange?: (type: T | null) => void,
  filter?: string[],
  fetchItems: (filter: string[], keyword?: string) => Promise<{data: T[]}>,
  fieldNames?: {
    value: string,
    label: string,
  },
};

export const RelationSelect = function<T>({
  selectedItem,
  onChange,
  filter = [],
  fetchItems,
  fieldNames = {
    value: 'id',
    label: 'name',
  },
  ...rest
}: RelationSelectProps<T>) {
  const { value: valueKey, label: labelKey } = fieldNames;
  const [value, setValue] = useState(selectedItem ? {
    label: selectedItem[labelKey as keyof T],
    value: selectedItem[valueKey as keyof T],
  } : undefined);

  const request = async ({ keyWords: keyword }: { keyWords: string }) => {
    const reqFilter = [...filter];
    if (keyword) {
      reqFilter.push(labelKey + '||$contL||' + keyword);
    }
    const resp = await fetchItems(reqFilter, keyword);
    return resp.data;
  }

  return (
    <ProFormSelect.SearchSelect
      showSearch
      mode={'single'}
      request={request}
      formItemProps={{
        // correct color for invalid relational fields (#64)
        // @ts-ignore-next-line
        validateStatus: rest['aria-invalid'] === 'true' ? 'error' : 'success',
        style: {
          margin: 0,
          display: 'inline-block',
        }
      }}
      style={{ minWidth: 160 }}
      placeholder='Please choose'
      fieldProps={{
        fieldNames: {
          value: valueKey,
          label: labelKey,
        },
        value,
        onChange(value, row) {
          setValue(value);
          onChange?.(row ? value : null);
        },
      }}
      {...rest}
    />
  );
}

export type RelationsSelectProps<T> = ProFormSelectProps & {
  selectedItems: T[],
  onChange?: (type: T[]) => void,
  filter?: string[],
  fetchItems: (filter: string[], keyword?: string) => Promise<{data: T[]}>,
  fieldNames?: {
    value: string,
    label: string,
  },
};

export const RelationsSelect = function<T>({
  selectedItems,
  onChange,
  filter = [],
  fetchItems,
  fieldNames = {
    value: 'id',
    label: 'name',
  },
  ...rest
}: RelationsSelectProps<T>) {
  const { value: valueKey, label: labelKey } = fieldNames;
  const [value, setValue] = useState(selectedItems.map(item => ({
    label: item[labelKey as keyof T],
    value: item[valueKey as keyof T],
  })));

  useEffect(() => {
    if (!selectedItems.length) {
      setValue([]);
    }
  }, [selectedItems.length])

  const request = async ({ keyWords: keyword }: { keyWords: string }) => {
    const reqFilter = [...filter];
    if (keyword) {
      reqFilter.push(labelKey + '||$contL||' + keyword);
    }
    const resp = await fetchItems(reqFilter, keyword);
    return resp.data;
  }

  return (
    <ProFormSelect.SearchSelect
      showSearch
      mode='multiple'
      request={request}
      formItemProps={{
        style: {
          margin: 0,
          display: 'inline-block',
        }
      }}
      style={{ minWidth: 160 }}
      placeholder='Please choose'
      fieldProps={{
        fieldNames: {
          value: valueKey,
          label: labelKey,
        },
        value,
        onChange(value, row) {
          setValue(value);
          onChange?.(row ? value : null);
        },
      }}
      {...rest}
    />
  );
}
