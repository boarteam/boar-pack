import { Button, Popconfirm, Popover } from "antd";
import { LoadingOutlined, QuestionCircleTwoTone } from "@ant-design/icons";
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
    lastQueryParamsAndCount,
    onDelete,
  } : {
    selectedRecords: Entity[],
    lastQueryParamsAndCount: [TGetAllParams & Record<string, string | number>, number] | [],
    onDelete: () => Promise<void>
  }) => {
  const { styles } = useStyles();
  const [loading, setLoading] = useState(false);
  const recordsCount = selectedRecords.length ? selectedRecords.length : lastQueryParamsAndCount[1];

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
      <Button>
        {`Delete ${recordsCount} ${recordsCount === 1 ? 'Record' : 'Records'}`} {loading && <LoadingOutlined />}
      </Button>
    </Popconfirm>
    <Popover
      content={(
        <div style={{ width: '100%' }}>
          This includes records from ALL pages of the table.
        </div>
      )}
      title={'Delete All Records'}
      trigger={['hover', 'click']}
      zIndex={1080}
    >
      <QuestionCircleTwoTone />
    </Popover>
  </>);
};

export default BulkDeleteButton;
