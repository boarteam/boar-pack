import { ProColumns } from "@ant-design/pro-components";
import { ProDescriptionsItemProps } from "@ant-design/pro-descriptions";

export type TDescriptionSection<T> = {
  title: ProColumns<T>['title'] | null;
  // 'general' is a special value for the main section including only columns without children
  key: ProColumns<T>['dataIndex'] | 'general';
  columns: ProDescriptionsItemProps<T>[];
}

export function columnsToDescriptionItemProps<T>(
  columns: ProColumns<T>[],
  mainTitle: ProColumns<T>['title'] | null = null,
  key: ProColumns<T>['dataIndex'] | 'general' = 'general'
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
      result.push(...columnsToDescriptionItemProps(column.children, column.title, column.dataIndex));
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
