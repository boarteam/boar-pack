import Descriptions from '../../Descriptions/Descriptions';
import { useEcnConnectSchemasColumns } from '../EcnConnectSchemas/useEcnConnectSchemasColumns';
import { EcnConnectSchema, EcnConnectSchemaCreateDto, EcnConnectSchemaUpdateDto } from '../../../tools/api';
import apiClient from '../../../tools/client/apiClient';
import { Button, Drawer } from 'antd';
import { pick } from 'lodash';
import React from "react";
import EcnSubscrSchemasTable from "./EcnSubscrSchemas/EcnSubscrSchemasTable";
import { DeleteOutlined } from '@ant-design/icons';
import { deleteEdgeConfirm } from '../ConnectionsGraph';
import { useAccess } from '@umijs/max';
import { useLiquidityManagerContext } from "../liquidityManagerContext";

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
  if (id === undefined) {
    return <></>;
  }

  const { canManageLiquidity } = useAccess() || {};
  const columns = useEcnConnectSchemasColumns(canManageLiquidity ?? false);
  const { worker } = useLiquidityManagerContext();

  if (!worker) {
    return <></>;
  }

  return (
    <Drawer
      title="Connection"
      open
      onClose={onClose}
      width='33%'
      extra={
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
      }
    >
      <Descriptions<EcnConnectSchema, EcnConnectSchemaCreateDto, EcnConnectSchemaUpdateDto, { id: number, worker: string }, number>
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
      <EcnSubscrSchemasTable
        connectSchemaId={id}
      />
    </Drawer>
  );
};
