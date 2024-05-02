import { ProColumns } from "@ant-design/pro-components";
import { ProDescriptionsItemProps } from "@ant-design/pro-descriptions";

export type TDescriptionSection<T> = {
  title: ProColumns<T>['title'] | null;
  columns: ProDescriptionsItemProps<T>[];
}

export function columnsToDescriptionItemProps<T>(
  columns: ProColumns<T>[],
  mainTitle: ProColumns<T>['title'] | null = null,
): TDescriptionSection<T>[] {
  const baseSection: TDescriptionSection<T> = {
    title: mainTitle,
    columns: [],
  }
  const result: TDescriptionSection<T>[] = [baseSection];

  columns.forEach((column) => {
    if (column.valueType === 'option') {
      return;
    }

    if (column.children) {
      result.push(...columnsToDescriptionItemProps(column.children, column.title));
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
