import { Badge, Button, message, Modal, Tabs } from "antd";
import { ProColumns } from "@ant-design/pro-components";
import { createStyles } from "antd-style";
import { useEffect, useState } from "react";
import ConflictsTab from "./ConflictsTab";
import ErrorsTab from "./ErrorsTab";
import ResultsTab from "./ResultsTab";
import NewRecordsTab from "./NewRecordsTab";
import ChangesTab from "./ChangesTab";
import { TDiffResult } from "../Table/useImportExport";
import { CancelablePromise } from "@boarteam/boar-pack-users-frontend/dist/src/tools/api-client";

enum ModalTabs {
  changes = "changes",
  newRecords = "newRecords",
  errors = "errors",
  results = "results",
  conflicts = "conflicts",
}

export type TServerErrorItem = { field: string; message: string };

export type TRelationalFields = Map<string, {
  key: string,
  data: {
    [key: string]: any,
  }
}>

export type TImportConflict = {
  id: number;
  version: number;
  fields: Array<{
    field: string;
    current_value: any;
    imported_value: any;
  }>;
}

export type TImportResponse = {
  errors?: Array<TServerErrorItem>,
  conflicts?: Array<TImportConflict>,
  created_count: number,
  updated_count: number
}

const useStyles = createStyles(() => {
  return {
    changesModal: {
      ".ant-modal-content": {
        width: 800,
      },
      ".ant-table-content": {
        overflowX: "auto",
      },
      "ul": {
        maxHeight: 500,
        overflowY: "auto",
      },
    },
  };
});

export function ChangesModal<
  Entity,
  ImportRequestParams,
>({
  onClose,
  onCommit,
  changes,
  relationalFields,
  originRecordsColumnsConfig,
  changedRecordsColumnsConfig,
  createdRecordsColumnsConfig,
}: {
  onCommit: (params: ImportRequestParams) => CancelablePromise<TImportResponse>,
  onClose: () => void;
  changes?: TDiffResult<Entity>,
  relationalFields?: TRelationalFields,
  originRecordsColumnsConfig: ProColumns<Entity>[],
  changedRecordsColumnsConfig: ProColumns<Entity>[];
  createdRecordsColumnsConfig: ProColumns<Entity>[];
}) {
  if (!changes) return null;

  const { styles } = useStyles();
  const [activeTab, setActiveTab] = useState<string>(ModalTabs.changes);
  const { created, updated, tableData } = changes;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [importResponse, setImportResponse] = useState<TImportResponse>();
  const [serverErrors, setServerErrors] = useState<TServerErrorItem[]>([]);
  const [resolvedData, setResolvedData] = useState<Entity[]>();

  useEffect(() => {
    if (serverErrors.length > 0) {
      setActiveTab(ModalTabs.errors);
    }
  }, [serverErrors.length]);

  const handleCommitClick = async () => {
    // TODO: Client validation
    // ...
    setServerErrors([]);
    setIsLoading(true);

    const modifiedSource = (resolvedData && resolvedData.length > 0)
      ? resolvedData
      : updated;

    const payload: any = {
      new: created,
      modified: modifiedSource,
    };

    onCommit(payload).then((res) => {
      setImportResponse(res);

      // Check conflicts
      if (res.conflicts?.length) {
        setActiveTab(ModalTabs.conflicts);
        message.error("There are conflicts in the import. Please resolve them.");
        return;
      }

      setActiveTab(ModalTabs.results);
    }).catch((err) => {
      // TODO: Simplify
      const status = err?.status || err?.statusCode || err?.response?.status;
      const payload = err?.body || err?.response?.data || err?.data || err;

      if ((status === 400 || payload?.statusCode === 400) && Array.isArray(payload?.errors)) {
        setServerErrors(payload.errors);
        message.error(payload.message || "Validation error");
        return;
      }

      console.error("Commit failed:", err);
      message.error("Unexpected error while committing changes");
    }).finally(() => {
      setIsLoading(false);
    });
  };

  const tabList = [
    {
      key: ModalTabs.changes,
      tab: "Changed values",
      disabled: tableData.length === 0,
      label: tableData.length ? (
        <Badge
          size="small"
          color="blue"
          count={tableData.length}
        >
          Changed Values
        </Badge>
      ) : "Changed Values",
      children: <ChangesTab
        changedRecordsColumnsConfig={changedRecordsColumnsConfig}
        updated={tableData}
      />,
    },
    {
      key: ModalTabs.newRecords,
      tab: "New records",
      disabled: created.length === 0,
      label: created.length ? (
        <Badge
          size="small"
          color="blue"
          count={created.length}
        >
          New Records
        </Badge>
      ) : "New Records",
      children: <NewRecordsTab
        createdRecordsColumnsConfig={createdRecordsColumnsConfig}
        created={created}
      />,
    },
    {
      key: ModalTabs.errors,
      tab: "Import errors",
      disabled: serverErrors.length === 0,
      label: serverErrors.length ? (
        <Badge size="small" count={serverErrors.length}>
          Errors
        </Badge>
      ) : "Errors",
      children: <ErrorsTab serverErrors={serverErrors} />,
    },
    {
      key: ModalTabs.conflicts,
      tab: "Import conflicts",
      disabled: !importResponse || importResponse.conflicts?.length === 0,
      label: importResponse?.conflicts?.length ? (
        <Badge size="small" count={importResponse.conflicts.length}>
          Conflicts
        </Badge>
      ) : "Conflicts",
      children: <ConflictsTab<Entity>
        conflicts={importResponse?.conflicts}
        setResolvedData={setResolvedData}
        relationalFields={relationalFields}
        originColumns={originRecordsColumnsConfig}
      />,
    },
    {
      key: ModalTabs.results,
      tab: "Import results",
      disabled: !importResponse || !!importResponse.conflicts?.length,
      label: "Results",
      children: <ResultsTab importStatistic={
        {
          created: importResponse?.created_count || 0,
          updated: importResponse?.updated_count || 0,
        }
      } />,
    },
  ];

  return (
    <Modal
      title="Preview changes"
      open={true}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>Close</Button>,
        <Button
          loading={isLoading}
          type="primary"
          key="approve"
          onClick={handleCommitClick}
          disabled={
          importResponse?.conflicts?.length === 0
            || serverErrors.length > 0
            || updated.length === 0 && created.length === 0
        }
        >
          Commit
        </Button>,
      ]}
      className={styles.changesModal}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        defaultActiveKey="1"
        items={tabList}
      />
    </Modal>
  );
}
