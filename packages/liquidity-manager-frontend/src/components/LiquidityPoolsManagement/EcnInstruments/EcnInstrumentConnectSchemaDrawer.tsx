import Descriptions from '../../Descriptions/Descriptions';
import { useEcnConnectSchemasColumns } from '../EcnConnectSchemas/useEcnConnectSchemasColumns';
import { EcnConnectSchema, EcnConnectSchemaCreateDto, EcnConnectSchemaUpdateDto, EcnSubscrSchema, EcnSubscrSchemaCreateDto, EcnSubscrSchemaUpdateDto } from '../../../tools/api';
import apiClient from '../../../tools/client/apiClient';
import { Button, Drawer } from 'antd';
import { pick } from 'lodash';
import React from "react";
import { DeleteOutlined } from '@ant-design/icons';
import { deleteEdgeConfirm } from '../ConnectionsGraph';
import { useAccess } from '@umijs/max';
import { ecnSubscriptionSchemaToDto } from '../EcnModules/EcnSubscrSchemas/EcnSubscrSchemasTable';
import { useEcnSubscrSchemaColumns } from '../EcnModules/EcnSubscrSchemas/useEcnSubscrSchemaColumns';
import { ecnSubscrSchemaJoinFields } from '../EcnModules/EcnSubscrSchemas/ecnSubscrSchemaJoinFields';

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


export function ecnConnectSchemaToDto<
  T extends Partial<EcnConnectSchema>,
  R extends (EcnConnectSchemaCreateDto | EcnConnectSchemaUpdateDto)
>(entity: T): R {
  return pick(entity, [
    'descr',
    'enabled'
  ]) as R;
}

export type TEcnConnectionSchemaWihSubscrEnabled = EcnConnectSchema & { subscrSchemaEnabled?: boolean };

export const EcnInstrumentConnectSchemaDrawer: React.FC<{
  id: EcnConnectSchema['id'] | undefined;
  instrumentHash: EcnSubscrSchema['instrumentHash'];
  onClose: () => void;
  onUpdate: (entity: Partial<TEcnConnectionSchemaWihSubscrEnabled> & { id: EcnConnectSchema['id'] }) => void,
  onDelete: (id: EcnConnectSchema['id']) => Promise<void>;
}> = ({ id, instrumentHash, onClose, onUpdate, onDelete }) => {
  if (id === undefined) {
    return <></>
  }

  const { canManageLiquidity } = useAccess() || {};
  const columns = useEcnConnectSchemasColumns(canManageLiquidity ?? false);
  const subscrSchemaColumns = useEcnSubscrSchemaColumns();

  return (
    <Drawer
      title="Connection Schema"
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
              }
            )
          }}
          danger
        >
          <DeleteOutlined />
        </Button>
      }
    >
      <Descriptions<EcnConnectSchema, EcnConnectSchemaCreateDto, EcnConnectSchemaUpdateDto, { id: number }, number>
        pathParams={{
          id,
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
      <Descriptions<EcnSubscrSchema, EcnSubscrSchemaCreateDto, EcnSubscrSchemaUpdateDto, {
        instrumentHash: string,
        connectSchemaId: number,
      }, number>
        mainTitle="Subscription Schema"
        pathParams={{
          instrumentHash,
          connectSchemaId: id,
        }}
        idColumnName="instrumentHash"
        getOne={params => apiClient.ecnSubscrSchemas.getOneBaseEcnSubscrSchemaControllerEcnSubscrSchema(params)}
        onUpdate={async params => {
          const entity = await apiClient.ecnSubscrSchemas.updateOneBaseEcnSubscrSchemaControllerEcnSubscrSchema(params);
          onUpdate({ id, subscrSchemaEnabled: Boolean(entity.enabled) });
          return entity;
        }}
        entityToUpdateDto={ecnSubscriptionSchemaToDto}
        columns={subscrSchemaColumns}
        canEdit={canManageLiquidity}
        params={{
          join: ecnSubscrSchemaJoinFields,
        }}
        column={2}
      />
    </Drawer>
  );
};
