import { ProFormSelect, ProFormSelectProps } from "@ant-design/pro-components";
import { useState } from "react";
import { useCreation } from "../Table";
import { Space } from "antd";

type RelationSelectProps<T, CreateDto = T> = ProFormSelectProps & {
  selectedItem: T | null | undefined,
  onChange?: (type: T | null) => void,
  filter?: string[],
  fetchItems: (filter: string[], keyword?: string) => Promise<{ data: T[] }>,
  fieldNames?: {
    value: string,
    label: string,
  },
  onCreate?: ({}: { requestBody: CreateDto }) => Promise<T>,
  creationColumns?: any[], // TODO: any specified in the createEntityModal. Need to fix it in the both places
  idColumnName?: string & keyof T | (string & keyof T)[],
  createPopupTitle?: string,
};

export const RelationSelect = function <T, CreateDto = T>({
  selectedItem,
  onCreate,
  creationColumns,
  // @ts-ignore
  idColumnName = 'id',
  createPopupTitle = 'Add new record',
  onChange,
  filter = [],
  fetchItems,
  fieldNames = {
    value: 'id',
    label: 'name',
  },
  ...rest
}: RelationSelectProps<T, CreateDto>) {
  const { value: valueKey, label: labelKey } = fieldNames;
  const [value, setValue] = useState(selectedItem ? {
    label: selectedItem[labelKey as keyof T],
    value: selectedItem[valueKey as keyof T],
  } : undefined);

  const {
    creationModal,
    createButton,
  } = useCreation<T, CreateDto>({
    onCreate,
    columns: creationColumns,
    popupCreation: !!onCreate,
    createNewDefaultParams: {},
    createButtonSize: 'small',
    pathParams: {},
    entityToCreateDto: (entity: T) => entity as unknown as CreateDto,
    title: createPopupTitle,
    idColumnName
  });

  const request = async ({ keyWords: keyword }: { keyWords: string }) => {
    const reqFilter = [...filter];
    if (keyword) {
      reqFilter.push(labelKey + '||$contL||' + keyword);
    }
    const resp = await fetchItems(reqFilter, keyword);
    return resp.data;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <ProFormSelect.SearchSelect
        showSearch
        mode={'single'}
        request={request}
        className='relational-select'
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
          dropdownRender: (menu) => (
            <>
              {menu}
              {onCreate && (
                <Space style={{ padding: '0 8px 4px', display: 'flex', justifyContent: 'center' }}>
                  {createButton}
                </Space>
              )}
            </>
          ),
        }}
        {...rest}
      />
      {creationModal}
    </div>
  );
}
