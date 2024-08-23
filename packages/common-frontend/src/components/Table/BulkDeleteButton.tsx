import { Button, Popconfirm } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { TGetAllParams } from "./tableTypes";
import { createStyles } from "antd-style";
import { useState } from "react";

const useStyles = createStyles(() => {
  return {
    popconfirm: {
      '.ant-popconfirm-description': {
        marginTop: '0 !important',
      },
    }
  }
})

const BulkDeleteButton = <Entity extends Record<string | symbol, any>>(
  {
    selectedRecords,
    lastRequest,
    allSelected,
    onDelete,
  } : {
    selectedRecords: Entity[],
    allSelected: boolean,
    lastRequest: [TGetAllParams & Record<string, string | number>, any] | [],
    onDelete: () => Promise<void>
  }) => {
  const { styles } = useStyles();
  const [loading, setLoading] = useState(false);
  const recordsCount = allSelected ? lastRequest[1].total : selectedRecords.length;

  return (<>
    <Popconfirm
      overlayClassName={styles.popconfirm}
      title={false}
      description={`Are you sure you want to delete ${recordsCount} ${recordsCount === 1 ? 'record' : 'records'}?`}
      onConfirm={() => {
        setLoading(true);
        onDelete().finally(() => setLoading(false));
      }}
      okText="Yes"
      cancelText="No"
    >
      <Button
        disabled={recordsCount === 0}
      >
        {recordsCount > 0 ? `Delete ${recordsCount} ${recordsCount === 1 ? 'Record' : 'Records'}` : 'Bulk Delete'}
        {loading && <LoadingOutlined />}
      </Button>
    </Popconfirm>
  </>);
};

export default BulkDeleteButton;
