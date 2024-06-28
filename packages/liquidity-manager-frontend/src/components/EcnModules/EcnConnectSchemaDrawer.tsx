import { useEcnConnectSchemasColumns } from '../EcnConnectSchemas/useEcnConnectSchemasColumns';
import { EcnConnectSchema, EcnConnectSchemaCreateDto, EcnConnectSchemaUpdateDto } from '@@api/generated';
import apiClient from '@@api/apiClient';
import { Button, Drawer } from 'antd';
import { pick } from 'lodash';
import React, { useState } from "react";
import EcnSubscrSchemasOnConnectionTable from "../EcnSubscrSchemas/EcnSubscrSchemasOnConnectionTable";
import { DeleteOutlined } from '@ant-design/icons';
import { deleteEdgeConfirm } from '../Graph';
import { useAccess } from '@umijs/max';
import { useLiquidityManagerContext } from "../../tools/liquidityManagerContext";
import { Descriptions } from "@jifeon/boar-pack-common-frontend";

export const ecnConnectSchemaJoinFields = [
  {
    field: 'fromModule',
    select: ['name'],
  },
  {
    field: 'toModule',
    select: ['name'],
  },
];


export function ecnConnectSchemaToDto<T extends Partial<EcnConnectSchema>,
  R extends (EcnConnectSchemaCreateDto | EcnConnectSchemaUpdateDto)>(entity: T): R {
  return pick(entity, [
    'descr',
    'enabled'
  ]) as R;
}

export const EcnConnectSchemaDrawer: React.FC<{
  id: EcnConnectSchema['id'] | undefined;
  onClose: () => void;
  onUpdate: (entity: EcnConnectSchema) => void,
  onDelete: (id: EcnConnectSchema['id']) => Promise<void>;
}> = ({ id, onClose, onUpdate, onDelete }) => {
  const { canManageLiquidity } = useAccess() || {};
  const columns = useEcnConnectSchemasColumns(canManageLiquidity ?? false);
  const { worker } = useLiquidityManagerContext();

  const [connectSchemaName, setConnectSchemaName] = useState('Connection');

  if (!worker || id === undefined) {
    return <></>;
  }

  return (
    <Drawer
      title={connectSchemaName}
      open
      onClose={onClose}
      width='33%'
      extra={
        canManageLiquidity && (
          <Button
            onClick={async () => {
              await deleteEdgeConfirm(
                id,
                async () => {
                  await onDelete(id);
                  onClose();
                },
                worker,
              )
            }}
            danger
          >
            <DeleteOutlined />
          </Button>
        )
      }
    >
      <Descriptions<EcnConnectSchema, EcnConnectSchemaCreateDto, EcnConnectSchemaUpdateDto, { id: number, worker: string }>
        onEntityChange={connectSchema => {
          setConnectSchemaName(connectSchema?.descr ? `Connection ${connectSchema.descr}` : 'Connection');
        }}
        pathParams={{
          id,
          worker,
        }}
        idColumnName='id'
        getOne={params => apiClient.ecnConnectSchemas.getOneBaseEcnConnectSchemaControllerEcnConnectSchema(params)}
        onUpdate={async params => {
          const entity = await apiClient.ecnConnectSchemas.updateOneBaseEcnConnectSchemaControllerEcnConnectSchema(params);
          onUpdate(entity);
          return entity;
        }}
        onDelete={params => apiClient.ecnConnectSchemas.deleteOneBaseEcnConnectSchemaControllerEcnConnectSchema(params)}
        entityToUpdateDto={ecnConnectSchemaToDto}
        columns={columns}
        column={1}
        canEdit={canManageLiquidity}
        params={{
          join: ecnConnectSchemaJoinFields,
        }}
      />
      <EcnSubscrSchemasOnConnectionTable
        connectSchemaId={id}
      />
    </Drawer>
  );
};
