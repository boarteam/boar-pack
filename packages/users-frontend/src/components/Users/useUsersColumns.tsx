import { Link, useIntl } from "@umijs/max";
import { ProColumns } from "@ant-design/pro-components";
import { EditOutlined, UserOutlined } from "@ant-design/icons";
import { Password, safetyRun } from "@boarteam/boar-pack-common-frontend";
import { useAccess, useModel } from "umi";
import { Tooltip } from "antd";
import { User } from "../../tools/api-client/generated";
import { useApiClient } from "../ApiClientContext";

export const useUsersColumns = ({
  userPageUrlPrefix = '/admin/users',
}: {
  userPageUrlPrefix?: string | null;
}): ProColumns<User>[] => {
  const apiClient = useApiClient();
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const { canManageAll } = useAccess() || {};

  const onLoginAsUser = (userId: string) => {
    safetyRun(apiClient.authentication.loginAsUser({
      userId,
    })
      .then(() => {
        window.location.href = '/';
      }));
  }

  const columns: ProColumns<User>[] = [
    {
      title: intl.formatMessage({ id: 'pages.users.name' }),
      dataIndex: 'name',
      width: '20%',
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
      render(text, record) {
        return userPageUrlPrefix ? <Link to={`${userPageUrlPrefix}/${record.id}`}>{text}</Link> : text;
      }
    },
    {
      title: intl.formatMessage({ id: 'pages.users.email' }),
      dataIndex: 'email',
      valueType: 'text',
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
      editable: (v, record) => record.id !== currentUser?.id,
    },
    {
      title: intl.formatMessage({ id: 'pages.users.password' }),
      dataIndex: 'pass',
      width: '20%',
      valueType: 'password',
      renderFormItem() {
        return <Password />;
      },
      fieldProps: {
        autoComplete: 'one-time-code', // disable browser autocomplete
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.users.role' }),
      dataIndex: 'role',
      width: '15%',
      valueType: 'select',
      valueEnum: {
        admin: {
          text: intl.formatMessage({ id: 'pages.users.roles.admin' }),
        },
        user: {
          text: intl.formatMessage({ id: 'pages.users.roles.user' }),
        },
      },
      formItemProps: {
        rules: [
          {
            required: true,
          }
        ]
      },
      editable: (v, record) => record.id !== currentUser?.id,
    },
  ];

  if (canManageAll) {
    columns.push({
      title: intl.formatMessage({ id: 'table.actions' }),
      valueType: 'option',
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record.id);
          }}
        >
          <EditOutlined />
        </a>,
        <Tooltip
          title={'Login as user'}
          key="loginAsUser"
        >
          <a
            onClick={() => {
              onLoginAsUser(record.id);
            }}
          >
            <UserOutlined />
          </a>
        </Tooltip>
      ],
    });
  }


  return columns;
};
