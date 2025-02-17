import { Popconfirm, Tooltip } from "antd";
import { DeleteOutlined, LoadingOutlined } from "@ant-design/icons";
import { createStyles } from "antd-style";
import { useState } from "react";
import { useIntl } from "react-intl";

const useStyles = createStyles(() => {
  return {
    popconfirm: {
      '.ant-popconfirm-description': {
        marginTop: '0 !important',
      },
    }
  }
})

const DeleteButton = (
  {
    onDelete,
  }: {
    onDelete: () => Promise<void>
  }) => {
  const {styles} = useStyles();
  const [loading, setLoading] = useState(false);
  const intl = useIntl();

  return (<a key="deleteButton">
      {!loading && <Popconfirm
        overlayClassName={styles.popconfirm}
        title={false}
        description={intl.formatMessage({id: "table.deletePopconfirmMessage"})}
        onConfirm={() => {
          setLoading(true);
          onDelete().finally(() => setLoading(false));
        }}>
        <Tooltip title={intl.formatMessage({id: "table.deleteText"})}>
          <DeleteOutlined/>
        </Tooltip>
      </Popconfirm>}
      {loading && <LoadingOutlined/>}
    </a>
  );
};
export default DeleteButton;
