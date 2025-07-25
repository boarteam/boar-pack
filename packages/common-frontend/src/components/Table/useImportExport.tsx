import { Button, Tooltip } from 'antd';
import { DownloadOutlined, UploadOutlined } from "@ant-design/icons";
import { useRef, useState } from "react";
import { TGetAllParams } from "./tableTypes";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import diff from "deep-diff";

export function useImportExport<TPathParams = {}>({
  exportUrl,
  exportParams,
  onImport,
  importFields = {
    id: 'id',
    label: 'name',
    additional: [],
  },
}: {
  exportUrl?: string;
  exportParams?: {
    [key: string]: string | number
  }
  onImport?: (event: React.ChangeEvent<HTMLInputElement>) => Promise<any>;
  importFields?: {
    id: string,
    label: string,
    additional: string[],
  },
}) {
  const [isLoadingImport, setIsLoadingImport] = useState(false);
  const [lastQueryParams, setLastQueryParams] = useState<TGetAllParams & TPathParams>();

  const [diffResult, setDiffResult] = useState();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileAsync = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileBefore = e.target.files?.[0];
    const fileAfter = e.target.files?.[1];
    if (!fileBefore || !fileAfter) return;

    const dataBefore = await fileBefore.arrayBuffer();
    const dataAfter = await fileAfter.arrayBuffer();

    const workbookBefore = XLSX.read(dataBefore);
    const workbookAfter = XLSX.read(dataAfter);

    const jsonBefore: Array<Record<string, any>> = XLSX.utils
      .sheet_to_json(workbookBefore.Sheets[workbookBefore.SheetNames[0]]);
    const jsonAfter: Array<Record<string, any>> = XLSX.utils
      .sheet_to_json(workbookAfter.Sheets[workbookAfter.SheetNames[0]]);

    // Создаём Map из старых данных
    const oldMap = new Map<string, Record<string, any>>(
      jsonBefore
        .filter(row => row.id != null)
        .map(row => [String(row.id), row])
    );

    // Подготовка новой Map и массивов для diffs
    const newMap = new Map<string, Record<string, any>>();
    const created: Record<string, any>[] = [];
    const updated: { id: string; changes: any }[] = [];

    // Заполняем newMap и создаём записи без id сразу как созданные
    for (const row of jsonAfter) {
      const key = row.id != null ? String(row.id) : null;
      if (key === null) {
        created.push(row);
      } else {
        newMap.set(key, row);
      }
    }

    // Ищем созданные и изменённые
    for (const [id, newRow] of newMap.entries()) {
      const oldRow = oldMap.get(id);
      if (!oldRow) {
        // Новая запись
        created.push(newRow);
      } else {
        // Возможные изменения
        const differences = diff(oldRow, newRow);
        if (differences && differences.length > 0) {
          updated.push({ id, changes: differences });
        }
      }
    }

    const diffResult = { created, updated };
    setDiffResult(diffResult);

    console.log('Old Map:', oldMap);
    console.log('New Map:', newMap);
    console.log('Diff Result:', diffResult);
  };

  const onImportChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoadingImport(true);
    await onImport?.(event)
      .then((response) => {
        console.log(response);
      })
      .finally(() => {
        setIsLoadingImport(false);
      });
  }

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
    <Tooltip title="Import">
      <label htmlFor="import-input">
        <Button loading={isLoadingImport} icon={<UploadOutlined />} />
      </label>
    </Tooltip>
    <input
      type="file"
      id="import-input"
      style={{ display: "none" }}
      accept=".xlsx, .xls"
      onChange={onImportChange}
    />
  </>

  return {
    exportButton,
    importButton,
    setLastQueryParams
  };
}
