import React, { useState } from "react";
import { User, UserCreateDto } from "@@api/generated";
import { Alert, Card, Switch, Table, Typography, Space } from "antd";
import apiClient from "@@api/apiClient";
import { useAccess } from "umi";

const { Title } = Typography;

export type PermissionItemConfig = {
  key: string;
  title: string;
  icon?: React.ReactNode;
};

export type PermissionGroupConfig = {
  title: string;
  icon?: React.ReactNode;
  permissions: PermissionItemConfig[];
};

export type PermissionsConfig = Array<PermissionItemConfig | PermissionGroupConfig>;

interface PermissionsListProps {
  user: User;
  permissionsConfig: PermissionsConfig;
}

export const PermissionsList: React.FC<PermissionsListProps> = ({
  user,
  permissionsConfig,
}) => {
  const [permissionsSet, setPermissionsSet] = useState<Set<string>>(
    new Set(user.permissions as string[])
  );
  const [loading, setLoading] = useState(false);
  const { canManageAll } = useAccess() || {};

  const togglePermission = (permission: string) => {
    setLoading(true);
    const newPermissionsSet = new Set(permissionsSet);
    if (permissionsSet.has(permission)) {
      newPermissionsSet.delete(permission);
    } else {
      newPermissionsSet.add(permission);
    }
    setPermissionsSet(newPermissionsSet);
    apiClient.users
      .updateOneBaseUsersControllerUser({
        id: user.id,
        requestBody: {
          permissions: Array.from(newPermissionsSet),
        }
      })
      .then((user) => {
        setPermissionsSet(new Set(user.permissions as string[]));
      })
      .catch(e => {
        console.error(e);
        setPermissionsSet(permissionsSet);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const renderSwitch = (permission: string) => {
    const disabledSwitch = user.role === UserCreateDto.role.ADMIN || !canManageAll;
    const isGranted = user.role === UserCreateDto.role.ADMIN || permissionsSet.has(permission);

    return (
      <Switch
        checked={isGranted}
        onChange={() => togglePermission(permission)}
        disabled={disabledSwitch}
      />
    );
  }

  const buildTableDataSource = () => {
    return permissionsConfig.map((item, index) => {
      if ('permissions' in item) {
        // It's a group with children
        return {
          key: `group-${index}`,
          permission: <Space>{item.icon}<strong>{item.title}</strong></Space>,
          children: item.permissions.map(childItem => ({
            key: childItem.key,
            permission: childItem.title,
            granted: renderSwitch(childItem.key)
          }))
        };
      } else {
        // It's an individual permission
        return {
          key: item.key,
          permission: item.icon
            ? <Space>{item.icon}<strong>{item.title}</strong></Space>
            : item.title,
          granted: renderSwitch(item.key)
        };
      }
    });
  };

  return (
    <Card>
      <Title level={5}>Permissions for {user.name}</Title>
      {user.role === UserCreateDto.role.ADMIN && (
        <Alert
          message="Admin can perform any action, in order to change permissions, change user role."
          type="info"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      ) || null}
      <Table
        loading={loading}
        expandable={{
          defaultExpandAllRows: true,
          expandIcon: () => null,
        }}
        size="small"
        showHeader={false}
        columns={[
          {
            title: 'Permission',
            dataIndex: 'permission',
            width: '400px',
          },
          {
            title: 'Granted',
            dataIndex: 'granted',
          }
        ]}
        dataSource={buildTableDataSource()}
        pagination={false}
      />
    </Card>
  );
};
