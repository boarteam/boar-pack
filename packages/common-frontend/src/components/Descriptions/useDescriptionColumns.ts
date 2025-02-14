import { ProColumns } from "@ant-design/pro-components";
import { ProDescriptionsItemProps } from "@ant-design/pro-descriptions";

export type TDescriptionSection<T> = {
  title: ProColumns<T>['title'] | null;
  // 'general' is a special value for the main section including only columns without children
  key: string | 'general';
  columns: ProDescriptionsItemProps<T>[];
}

export function columnsToDescriptionItemProps<T>(
  columns: ProColumns<T>[],
  mainTitle: ProColumns<T>['title'] | null = null,
  key: string | 'general' = 'general'
): TDescriptionSection<T>[] {
  const baseSection: TDescriptionSection<T> = {
    title: mainTitle,
    key,
    columns: [],
  }
  const result: TDescriptionSection<T>[] = [baseSection];

  columns.forEach((column) => {
    if (column.valueType === 'option') {
      return;
    }

    if (column.children) {
      const dataIndex = String(Array.isArray(column.dataIndex) ? column.dataIndex[0] : column.dataIndex);
      result.push(...columnsToDescriptionItemProps(column.children, column.title, dataIndex));
    } else {
      const {
        children,
        ...rest
      } = column;
      // @ts-ignore-next-line
      baseSection.columns.push(rest as ProDescriptionsItemProps<T>);
    }
  });

  return result;
}
