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

export type TUpdatedDiffResult = {
  id: string | number,
  diff: diff.Diff<any, any>[],
  [key: string]: any,
}

type TUpdatedResult = ({
  id: string | number,
  version: string | number,
  [key: string]: any,
})

export type TDiffResult<Entity> = {
  created: Entity[],
  updated: TUpdatedResult[],
  tableData: TUpdatedDiffResult[],
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

  const trueBooleanValues = [true, "TRUE", "True", "true", "1", "yes", "on"];

  const buildExportUrl = useCallback(() => {
    const params = {
      ...(lastQueryParams && {
        s: (lastQueryParams as any).s,
        sort: (lastQueryParams as any).sort?.[0],
      }),
      ...exportParams,
    } as Record<string, string | number | undefined>;

    const qp = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .reduce((acc, [k, v]) => {
        acc.append(k, String(v));
        return acc;
      }, new URLSearchParams());

    return exportUrl
      ? exportUrl + (qp.toString() ? `?${qp.toString()}` : '')
      : undefined;
  }, [exportUrl, exportParams, lastQueryParams]);

  const fetchExportCsvArrayBuffer = useCallback(async (): Promise<ArrayBuffer> => {
    const url = buildExportUrl();
    if (!url) throw new Error('Specify exportUrl!');

    const res = await fetch(url, {
      method: 'GET',
    });

    if (!res.ok) {
      throw new Error(`Can't get actual CSV data for comparing. HTTP ${res.status}`);
    }
    return await res.arrayBuffer();
  }, [buildExportUrl]);

  const normalizeRow = (row: any) => {
    const normalizedRow = { ...row };
    for (const key in normalizedRow) {
      if (normalizedRow[key] === null) {
        continue;
      }

      // Relational fields handling
      const relationalKey = key.replace('_id', '');
      if (relationalFields?.has(relationalKey)) {
        const relation = relationalFields.get(relationalKey);
        const id = Number(normalizedRow[key]);
        normalizedRow[relationalKey] = relation.data[id] || null;
        continue;
      }

      // Boolean values handling
      if (keyedColumns[key]?.valueType === "switch") {
        normalizedRow[key] = trueBooleanValues.includes(normalizedRow[key]);
        continue;
      }

      // Numeric values handling
      if (keyedColumns[key]?.valueType === "digit") {
        normalizedRow[key] = Number(normalizedRow[key]);
        continue;
      }

      // Empty values handling
      if (['', 'null'].includes(normalizedRow[key])) {
        normalizedRow[key] = null;
        continue;
      }

      // Text values handling
      // Text by default if not specified
      if (keyedColumns[key] && keyedColumns[key].valueType === undefined || 'text') {
        normalizedRow[key] = String(normalizedRow[key]);
      }
    }

    return normalizedRow;
  }

  const getRelationalValue = (relationField: {
    id: any;
    name?: string;
    description?: string;
  }) => {
    return relationField?.name || relationField?.description || relationField?.id;
  }

  const handleFileAsync = async (e: ChangeEvent<HTMLInputElement>) => {
    setIsLoadingImport(true);

    const fileAfter = e.target.files[0];

    if (!fileAfter) {
      throw new Error('Choose CSV with changes.');
    }

    console.time('fetch actual export from api');

    // File before now should be fetched from the same endpoint as the export button use
    const dataBefore = await fetchExportCsvArrayBuffer();

    console.timeEnd('fetch actual export from api');

    const dataAfter = await fileAfter.arrayBuffer();

    // Data is an ArrayBuffer
    const workbookBefore = XLSX.read(dataBefore);
    const workbookAfter = XLSX.read(dataAfter, {
      type: 'array',
      raw: true,
    });

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
    const newMap: { [key: string]: any } = {};

    const diffResult: TDiffResult<Entity> = {
      created: [],
      updated: [],
      tableData: [],
    };

    jsonAfter.map((row) => {
      const normalizedRow = normalizeRow(row);

      // New record
      if (!normalizedRow.id) {
        diffResult.created.push(normalizedRow);
        return;
      }

      // Existing record
      newMap[normalizedRow.id] = normalizedRow;
    });

    // Recognize added and changed records
    for (const id in newMap) {
      if (!oldMap[id]) {
        continue;
      }

      const differences = diff<any, any>(oldMap[id], newMap[id], {
        normalize: (currentPath, key, lhs, rhs) => {
          // We don't need to compare versions
          if (key === 'version') {
            return [true, true];
          }

          // We don't care about relational ids. Skip them
          if (key.endsWith('_id')) {
            return [true, true];
          }

          // If the key is a relational field (dictionary value), we need to compare only value fields
          if (relationalFields && relationalFields.has(key)) {
            return [
              getRelationalValue(lhs),
              getRelationalValue(rhs),
            ]
          }

          return [lhs, rhs];
        }
      });

      if (differences) {
        // console.log(differences);
        const changedFields = differences.map((diff) => diff.path?.[0]).filter((field: string | undefined) => field);
        const displayFields = changedRecordsColumnsConfig.map(column => column.dataIndex);

        const payload: TUpdatedResult = {
          id,
          version: newMap[id].version,
        };

        const tableData: TUpdatedDiffResult = {
          id,
          diff: differences,
        };

        columns.forEach((column) => {
          const key = String(column.dataIndex);
          const value = newMap[id][key] === undefined ? newMap[id][key + "_id"] : newMap[id][key];
          if (changedFields.includes(key)) {
            payload[key] = value;
          }

          if (displayFields.includes(key)) {
            tableData[key] = value;
          }
        })

        // Will be sent to the server
        diffResult.updated.push(payload);

        // Will be shown in the "changed values" tab
        diffResult.tableData.push(tableData);
      }
    }

    // Store this value in the state
    setDiffResult(diffResult);
    setIsLoadingImport(false);
  };

  const exportButton = <Tooltip title="Export">
    <Link to={buildExportUrl() ?? '#'} target={'_blank'}>
      <Button icon={<UploadOutlined />} />
    </Link>
  </Tooltip>;

  const importButton = <>
    <Tooltip title="Import changes CSV file">
      <Button
        loading={isLoadingImport}
        icon={<DownloadOutlined />}
        onClick={openFileDialog}
      />
    </Tooltip>

    <input
      type="file"
      ref={fileInputRef}
      style={{ display: 'none' }}
      accept=".csv"
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
