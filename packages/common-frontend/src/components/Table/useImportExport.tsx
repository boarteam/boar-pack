import { Button, Tooltip } from 'antd';
import { DownloadOutlined, UploadOutlined } from "@ant-design/icons";
import { useState } from "react";
import { TGetAllParams } from "./tableTypes";

export function useImportExport<TPathParams = {}>({
                                                    onExport,
                                                    fileName = 'download',
                                                    onImport
                                                  }: {
  onExport?: ({}: TGetAllParams & TPathParams) => Promise<any>;
  fileName?: string;
  onImport?: (event: React.ChangeEvent<HTMLInputElement>) => Promise<any>;

}) {
  const [isLoadingImport, setIsLoadingImport] = useState(false);
  const [isLoadingExport, setIsLoadingExport] = useState(false);
  const [lastQueryParams, setLastQueryParams] = useState<TGetAllParams & TPathParams>();

  const onExportClick = async () => {
    setIsLoadingExport(true);
    await onExport?.(lastQueryParams)
      .then((blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${fileName}_${Math.round(Date.now() / 1000)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .finally(() => {
        setIsLoadingExport(false);
      });
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

  const exportButton = <Tooltip title="Export">
    <Button loading={isLoadingExport} icon={<DownloadOutlined/>} onClick={onExportClick}/>
  </Tooltip>;

  const importButton = <>
    <Tooltip title="Import">
      <label htmlFor="import-input">
        <Button loading={isLoadingImport} icon={<UploadOutlined/>}/>
      </label>
    </Tooltip>
    <input
      type="file"
      id="import-input"
      style={{display: "none"}}
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
