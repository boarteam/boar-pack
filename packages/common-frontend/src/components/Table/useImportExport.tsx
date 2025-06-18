import { Button, Tooltip } from 'antd';
import { DownloadOutlined, UploadOutlined } from "@ant-design/icons";
import { useState } from "react";
import { TGetAllParams } from "./tableTypes";
import { Link } from "react-router-dom";

export function useImportExport<TPathParams = {}>({
  exportUrl,
  exportParams,
  onImport
}: {
  exportUrl?: string;
  exportParams?: {
    [key: string]: string | number
  }
  onImport?: (event: React.ChangeEvent<HTMLInputElement>) => Promise<any>;
}) {
  const [isLoadingImport, setIsLoadingImport] = useState(false);
  const [lastQueryParams, setLastQueryParams] = useState<TGetAllParams & TPathParams>();

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
      <Button icon={<DownloadOutlined />}/>
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
