import { ProColumns } from "@ant-design/pro-components";
import { useIntl } from "@umijs/max";
import { EditOutlined } from "@ant-design/icons";
import { UsersSubAccountInst } from "@@api/generated";
import { useAccess } from "umi";
import { useLiquidityManagerContext } from "../../../tools";

export const useUsersSubAccountsInstColumns = (canManage?: boolean): ProColumns<UsersSubAccountInst>[] => {
  const intl = useIntl();
  const { liquidityManager } = useLiquidityManagerContext();
  const { canManageLiquidity } = useAccess() || {};
  const canEdit = canManageLiquidity(liquidityManager) || canManage;

  const columns: ProColumns<UsersSubAccountInst>[] = [
    {
      title: intl.formatMessage({ id: 'pages.subAccounts.subAccountId' }),
      dataIndex: 'subAccountId',
      sorter: true,
      editable: false,
      copyable: true,
      width: '150px',
    },
    {
      title: intl.formatMessage({ id: 'pages.subAccounts.descr' }),
      dataIndex: 'descr',
      sorter: true,
      formItemProps: {
        rules: [
          {
            required: true,
          }
        ]
      },
      fieldProps: {
        autoComplete: 'one-time-code', // disable browser autocomplete
      },
    },
  ];

  if (canEdit) {
    columns.push({
      title: intl.formatMessage({ id: 'table.actions' }),
      valueType: 'option',
      width: '50px',
      fixed: 'right',
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record.id);
          }}
        >
          <EditOutlined />
        </a>,
      ],
    });
  }

  return columns;
};
