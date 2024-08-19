import { useEcnConnectSchemasColumns } from '../EcnConnectSchemas/useEcnConnectSchemasColumns';
import {
  EcnConnectSchema,
  EcnConnectSchemaCreateDto,
  EcnConnectSchemaUpdateDto,
  EcnSubscrSchema,
  EcnSubscrSchemaCreateDto,
  EcnSubscrSchemaUpdateDto
} from '@@api/generated';
import apiClient from '@@api/apiClient';
import { Button, Drawer } from 'antd';
import { pick } from 'lodash';
import React, { useState } from "react";
import { DeleteOutlined } from '@ant-design/icons';
import { deleteEdgeConfirm } from '../Graph';
import { useAccess } from '@umijs/max';
import { ecnSubscriptionSchemaToDto } from '../EcnSubscrSchemas/EcnSubscrSchemasTable';
import { useEcnSubscrSchemaColumns } from '../EcnSubscrSchemas/useEcnSubscrSchemaColumns';
import { ecnSubscrSchemaJoinFields } from '../EcnSubscrSchemas/ecnSubscrSchemaJoinFields';
import { useLiquidityManagerContext } from "../../tools/liquidityManagerContext";
import { Descriptions } from '@jifeon/boar-pack-common-frontend';

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

export type TEcnConnectionSchemaWihSubscrEnabled = EcnConnectSchema & { subscrSchemaEnabled?: boolean };

export const EcnInstrumentConnectSchemaDrawer: React.FC<{
  id: EcnConnectSchema['id'] | undefined;
  instrumentHash: EcnSubscrSchema['instrumentHash'];
  onClose: () => void;
  onUpdate: (entity: Partial<TEcnConnectionSchemaWihSubscrEnabled> & { id: EcnConnectSchema['id'] }) => void,
  onDelete: (id: EcnConnectSchema['id']) => Promise<void>;
}> = ({ id, instrumentHash, onClose, onUpdate, onDelete }) => {
  const { worker, liquidityManager } = useLiquidityManagerContext();
  const { canManageLiquidity } = useAccess() || {};
  const canEdit = canManageLiquidity(liquidityManager);
  const columns = useEcnConnectSchemasColumns(canEdit);
  const subscrSchemaColumns = useEcnSubscrSchemaColumns();

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
        canEdit && (
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
      <Descriptions<EcnConnectSchema, EcnConnectSchemaCreateDto, EcnConnectSchemaUpdateDto, {
        id: number,
        worker: string
      }>
        onEntityChange={(connectSchema: EcnConnectSchema) => {
          setConnectSchemaName(connectSchema?.descr ? `Connection ${connectSchema.descr}` : 'Connection')
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
        canEdit={canEdit}
        params={{
          join: ecnConnectSchemaJoinFields,
        }}
      />
      <Descriptions<EcnSubscrSchema, EcnSubscrSchemaCreateDto, EcnSubscrSchemaUpdateDto, {
        instrumentHash: string,
        connectSchemaId: number,
        worker: string,
      }>
        mainTitle="Subscription Schema"
        pathParams={{
          worker,
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
        canEdit={canEdit}
        params={{
          join: ecnSubscrSchemaJoinFields,
        }}
        column={2}
      />
    </Drawer>
  );
};
