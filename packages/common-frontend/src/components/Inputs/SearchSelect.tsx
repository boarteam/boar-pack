import { useState, useEffect } from "react";
import { SearchOutlined } from "@ant-design/icons";
import { Checkbox, Empty, Input, Menu } from "antd";
import { FilterDropdownProps } from "antd/es/table/interface";

export const SearchSelect = function<T>({
  selectedKeys,
  setSelectedKeys,
  filter = [],
  limit = 7,
  fetchItems,
  fieldNames = {
    value: 'id',
    label: 'name',
  },
}: Pick<FilterDropdownProps, 'selectedKeys' | 'setSelectedKeys'> & {
  filter?: string[],
  limit?: number,
  fetchItems: (filter: string[], limit?: number, keyword?: string) => Promise<{ data: T[] }>,
  fieldNames?: {
    value: string,
    label: string,
  },
}) {
  const { value: valueKey, label: labelKey } = fieldNames;

  const [availableItems, setAvailableItems] = useState<T[]>([]);
  const request = async (keyword: string) => {
    const reqFilter = [...filter];
    if (keyword) {
      reqFilter.push(labelKey + '||$contL||' + keyword);
    }

    const resp = await fetchItems(reqFilter, limit, keyword);
    setAvailableItems(resp.data);
  }

  useEffect(() => {
    request('');
  }, []);

  return (
    <>
      <div className={`ant-table-filter-dropdown-search`}>
        <Input
          prefix={<SearchOutlined />}
          placeholder={'Search in filters'}
          onChange={e => request(e.target.value)}
          className={`ant-table-filter-dropdown-search-input`}
        />
      </div>
      {
        availableItems.length === 0 
          ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={'Not Found'}
              imageStyle={{
                height: 24,
              }}
              style={{
                margin: 0,
                padding: '16px 0',
              }}
            />
          )
          : (
              <Menu
                selectable
                multiple
                prefixCls={`ant-dropdown-menu`}
                className={'ant-dropdown-menu'}
                onSelect={({ key }) => setSelectedKeys([...selectedKeys, key])}
                onDeselect={({ key }) => setSelectedKeys(selectedKeys.filter(selectedKey => selectedKey !== key))}
                // @ts-ignore
                selectedKeys={selectedKeys}
                items={availableItems.map(item => (
                  {
                    key: String(item?.[valueKey as keyof T]),
                    label: (
                      <>
                        <Checkbox checked={selectedKeys?.includes(String(item?.[valueKey as keyof T]))} />
                        <span>{String(item?.[labelKey as keyof T])}</span>
                      </>
                    ),
                  }
                ))}
              />
            )
      }
    </>
  );
}
