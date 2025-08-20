import { Button, Tooltip } from 'antd';
import { DownloadOutlined, UploadOutlined } from "@ant-design/icons";
import { ChangeEvent, useCallback, useRef, useState } from "react";
import { TGetAllParams } from "./tableTypes";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import diff from "deep-diff";
import { ProColumns } from "@ant-design/pro-components";
import { keyBy } from "lodash";
import { TRelationalFields } from "../ChangesModal";

type TImportedJSON<Entity> = (Entity & { id: string })[]

export type TUpdatedDiffResult<Entity> = {
  updated: (Entity & {
    id: string | number,
    diff: diff.Diff<any, any>[]
  }),
}

export type TDiffResult<Entity> = {
  created: Entity[],
  updated: TUpdatedDiffResult<Entity>[],
}

export function useImportExport<Entity, TPathParams = {}>({
  exportUrl,
  exportParams,
  columns,
  changedRecordsColumnsConfig,
  relationalFields,
}: {
  exportUrl?: string;
  exportParams?: {
    [key: string]: string | number
  },
  columns: ProColumns<Entity>[],
  changedRecordsColumnsConfig?: ProColumns<Entity>[],
  relationalFields?: TRelationalFields,
}) {
  const [isLoadingImport, setIsLoadingImport] = useState(false);
  const [lastQueryParams, setLastQueryParams] = useState<TGetAllParams & TPathParams>();
  const keyedColumns = keyBy(columns, 'dataIndex');

  const [diffResult, setDiffResult] = useState<TDiffResult<Entity>>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const openFileDialog = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  }, []);

  const trueBooleanValues = [true, "True", "true", "1", "yes", "on"];

  const normalizeRow = (row: any) => {
    const normalizedRow = { ...row };
    if (relationalFields) {
      for (const key in normalizedRow) {
        // Relational fields handling
        const relationalKey = key.replace('_id', '');
        if (relationalFields.has(relationalKey)) {
          const relation = relationalFields.get(relationalKey);
          const id = normalizedRow[key];
          normalizedRow[relationalKey] = relation.data[id] || null;
        }

        // Boolean values handling
        if (keyedColumns[key]?.valueType === "switch") {
          normalizedRow[key] = trueBooleanValues.includes(normalizedRow[key]);
        }
      }
    }

    return normalizedRow;
  }

  const handleFileAsync = async (e: ChangeEvent<HTMLInputElement>) => {
    setIsLoadingImport(true);

    const fileBefore = e.target.files[0];
    const fileAfter = e.target.files[1];

    const dataBefore = await fileBefore.arrayBuffer();
    const dataAfter = await fileAfter.arrayBuffer();

    // Data is an ArrayBuffer
    const workbookBefore = XLSX.read(dataBefore);
    const workbookAfter = XLSX.read(dataAfter);

    const jsonBefore: TImportedJSON<Entity> = XLSX.utils.sheet_to_json(workbookBefore.Sheets[workbookBefore.SheetNames[0]], {
      defval: null
    });
    const jsonAfter: TImportedJSON<Entity> = XLSX.utils.sheet_to_json(workbookAfter.Sheets[workbookAfter.SheetNames[0]], {
      defval: null
    });

    // TODO: Check JSON structure
    // ...

    const oldMap = Object.fromEntries(
      jsonBefore.map(
        (row) => {
          return [row.id, normalizeRow(row)]
        }
      )
    );
    const newMap = {};

    const diffResult: TDiffResult<Entity> = {
      created: [],
      updated: [],
    };

    jsonAfter.map((row) => {
      const normalizedRow = normalizeRow(row);

      // New record
      if (!normalizedRow.id) {
        diffResult.created.push(normalizedRow);
        return;
      }

      newMap[normalizedRow.id] = normalizedRow;
    });

    // Recognize added and changed records
    for (const id in newMap) {
      if (!oldMap[id]) {
        diffResult.created.push(newMap[id]);
      } else {
        const differences = diff(oldMap[id], newMap[id], {
          normalize: (currentPath, key, lhs, rhs) => {
            // If the key is a relational field, we need to compare the IDs
            if (relationalFields && relationalFields.has(key)) {
              return [true, true]
            }
          }
        });

        if (differences) {
          const changedFields = differences.map((diff) => diff.path?.[0]).filter((field: string | undefined) => field);
          const requiredFields = [
            ...changedFields,
            ...changedRecordsColumnsConfig.map(column => column.dataIndex),
          ];

          const fields = Object.fromEntries(
            columns
              .filter((column) => requiredFields.includes(column.dataIndex))
              .map((column) => {
                let value = newMap[id][column.dataIndex] || newMap[id][column.dataIndex + "_id"];

                return [column.dataIndex, value];
              }));

          diffResult.updated.push({
            id,
            ...fields,
            diff: differences,
          });
        }
      }
    }

    // Store this value in the state
    setDiffResult(diffResult);
    setIsLoadingImport(false);
  };

  const params = {
    ...(lastQueryParams && {
      s: lastQueryParams.s,
      sort: lastQueryParams.sort?.[0],
    }),
    ...exportParams
  }

  const url = exportUrl + (Object.keys(params).length ? '?' + new URLSearchParams(params).toString() : '');
  const exportButton = <Tooltip title="Export">
    <Link to={url} target={'_blank'}>
      <Button icon={<DownloadOutlined />} />
    </Link>
  </Tooltip>;

  const importButton = <>
    <Tooltip title="Import two CSV files (before & after)">
      <Button
        loading={isLoadingImport}
        icon={<UploadOutlined />}
        onClick={openFileDialog}
      />
    </Tooltip>

    <input
      type="file"
      ref={fileInputRef}
      style={{ display: 'none' }}
      accept=".csv"
      multiple
      onChange={handleFileAsync}
    />
  </>

  return {
    exportButton,
    importButton,
    setLastQueryParams,
    diffResult,
    setDiffResult,
  };
}
