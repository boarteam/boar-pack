import { ColumnsState, ProColumns } from "@ant-design/pro-components";
import React, { useMemo, useState } from "react";
import { Select } from "antd";
import { ColumnStateType } from "@ant-design/pro-table/es/typing";
import { TIndexableRecord } from "./tableTools";
import QuestionMarkHint from "../QuestionMarkHint/QuestionMarkHint";
import { SettingOutlined } from "@ant-design/icons";

export type TColumnsSet<Entity> = {
  name: string,
  columns: (keyof Entity)[],
}

type TUseColumnsSetsParams<Entity> = {
  columns: ProColumns<Entity>[],
  columnsSets?: TColumnsSet<Entity>[],
  defaultColumnState?: string;
}

export type TColumnsStates = Record<string, ColumnsState>;

type TUseColumnsSetsResult<Entity> = {
  columnsSetSelect: () => React.ReactNode,
  chosenColumnsSet: TColumnsStates | undefined,
  setChosenColumnsSet: React.Dispatch<React.SetStateAction<TColumnsStates | undefined>>,
  setChosenColumnsSetByName: (value: string) => void,
  columnsState: ColumnStateType,
}

type TColumnsState = Partial<Record<string, ColumnsState>>;

function getColumnsStates<T>(
  columns: TIndexableRecord[],
  shownCols: Set<keyof T>,
  state: TColumnsState = {},
): {state: Record<string, ColumnsState>, someColumnsShown: boolean} {
  let someColumnsShown = false;
  columns.forEach(col => {
    const idx = Array.isArray(col.dataIndex) ? col.dataIndex.join(',') : col.dataIndex;
    let childrenColumnsShown = false;
    if ('children' in col && Array.isArray(col.children)) {
      const { someColumnsShown } = getColumnsStates(col.children, shownCols, state);
      if (someColumnsShown) {
        childrenColumnsShown = true;
      }
    }

    if (idx) {
      if (shownCols.has(idx as keyof T) || childrenColumnsShown) {
        state[idx as string] = { show: true };
        someColumnsShown = true;
      } else {
        state[idx as string] = { show: false };
      }
    }
  }, state);

  return { state, someColumnsShown };
}

export default function useColumnsSets<Entity>({
  columns,
  columnsSets,
  defaultColumnState,
}: TUseColumnsSetsParams<Entity>): TUseColumnsSetsResult<Entity> {
  const columnsSetsByName: Map<string, TColumnsStates> = useMemo(
    () => new Map<string, TColumnsStates>(
      columnsSets?.map(({
        name,
        columns: columnsSet
      }) => [
        name,
        getColumnsStates<Entity>(columns as TIndexableRecord[], new Set(columnsSet)).state,
      ])
    ), [columns]
  );

  const [chosenSetName, setChosenSetName] = useState<string | undefined>(
    defaultColumnState || columnsSets?.[0].name || undefined
  );
  const [chosenColumnsSet, setChosenColumnsSet] = useState<TColumnsStates | undefined>(
    columnsSetsByName.get(chosenSetName || '') || undefined
  );

  const setChosenColumnsSetByName = (value: string) => {
    setChosenSetName(value);
    setChosenColumnsSet(columnsSetsByName.get(value));
  }

  const options = Array.from(columnsSetsByName.keys()).map(name => ({
    value: name,
    label: name,
  }));

  const columnsSetSelect = () => columnsSetsByName.size > 1 ? <>
    <Select
      key="columnsSetSelect"
      style={{ width: 200 }}
      value={chosenSetName}
      onChange={(value: string) => setChosenColumnsSetByName(value)}
      options={options}
    />
    <QuestionMarkHint intlPrefix={'tables.columnsSetSelect'} values={{
      gearIcon: <SettingOutlined />,
    }} />
  </> : null;

  const columnsState = {
    value: chosenColumnsSet,
    // value contains only hidden columns and one which is just changed
    onChange: (value: TColumnsStates) => {
      const checkParentVisibility = (columns: TIndexableRecord[]) => {
        let someColumnsShown = false;

        columns.forEach(col => {
          const idx = Array.isArray(col.dataIndex) ? col.dataIndex.join(',') : col.dataIndex as string;
          if (idx && value[idx]?.show) {
            someColumnsShown = true;
          }

          if ('children' in col && Array.isArray(col.children)) {
            const someChildColumnsShown = checkParentVisibility(col.children);
            if (someChildColumnsShown) {
              value[idx] = { show: true };
            }
          }
        });

        return someColumnsShown;
      };
      checkParentVisibility(columns as TIndexableRecord[]);
      setChosenColumnsSet(value);
    },
  };

  return {
    columnsSetSelect,
    chosenColumnsSet,
    setChosenColumnsSet,
    setChosenColumnsSetByName,
    columnsState,
  }
}
