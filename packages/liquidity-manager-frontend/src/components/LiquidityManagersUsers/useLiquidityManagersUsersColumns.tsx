import { ProColumns } from "@ant-design/pro-components";
import { LiquidityManagersUser } from "@@api/generated";
import { EditOutlined } from "@ant-design/icons";
import { useAccess } from "umi";
import { User } from "../../tools/api-client";
import apiClient from "../../tools/api-client/apiClient";
import { RelationSelect } from "@jifeon/boar-pack-common-frontend";

export const useLiquidityManagersUsersColumns = (): ProColumns<LiquidityManagersUser>[] => {
  const { canManageLiquidity } = useAccess() || {};

  const columns: ProColumns<LiquidityManagersUser>[] = [
    {
      title: 'User',
      dataIndex: 'user',
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
      render: (_, record) => record.user?.name,
      renderFormItem(schema, config) {
        return <RelationSelect
          selectedItem={config.record?.user}
          fetchItems={filter => apiClient.users.getManyBaseUsersControllerUser({
            filter
          })}
        />;
      }
    },
    {
      title: 'Role',
      dataIndex: 'role',
      valueType: 'select',
      valueEnum: {
        [LiquidityManagersUser.role.VIEWER]: {
          text: 'Viewer',
        },
        [LiquidityManagersUser.role.MANAGER]: {
          text: 'Manager',
        },
      },
      formItemProps: {
        rules: [
          {
            required: true,
          }
        ]
      },
    }
  ];

  if (canManageLiquidity) {
    columns.push({
      title: 'Actions',
      valueType: 'option',
      width: '3%',
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
