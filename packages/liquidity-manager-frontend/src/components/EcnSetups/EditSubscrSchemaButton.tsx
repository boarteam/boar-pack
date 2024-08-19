import {
  EcnConnectSchema,
  EcnConnectSchemaCreateDto,
  EcnConnectSchemaUpdateDto,
  EcnInstrument,
  EcnInstrumentCreateDto,
  EcnInstrumentUpdateDto,
  EcnSubscrSchema,
  EcnSubscrSchemaCreateDto,
  EcnSubscrSchemaUpdateDto
} from '@@api/generated';
import apiClient from '@@api/apiClient';
import { Button, Card, Drawer, Flex, Modal } from 'antd';
import React, { useState } from "react";
import { DeleteOutlined, EditOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { useAccess } from '@umijs/max';
import { useLiquidityManagerContext } from '../../tools';
import { useEcnSubscrSchemaColumns } from '../EcnSubscrSchemas/useEcnSubscrSchemaColumns';
import { useEcnConnectSchemasColumns } from "../EcnConnectSchemas/useEcnConnectSchemasColumns";
import { useEcnInstrumentsColumns } from "../EcnInstruments/useEcnInstrumentsColumns";
import { ecnInstrumentJoinFields } from "../EcnInstruments/ecnInstrumentJoinFields";
import { ecnInstrumentToDto } from "../EcnInstruments/EcnInstrumentsTable";
import { ecnSubscrSchemaJoinFields } from "../EcnSubscrSchemas/ecnSubscrSchemaJoinFields";
import { ecnSubscriptionSchemaToDto } from "../EcnSubscrSchemas/EcnSubscrSchemasTable";
import { Descriptions, withNumericId } from '@jifeon/boar-pack-common-frontend';
import { ecnConnectSchemaJoinFields, ecnConnectSchemaToDto } from "../EcnModules/EcnConnectSchemaDrawer";

export const deleteSubscrConfirm = (onOk: () => Promise<void>) => {
  Modal.confirm({
    title: 'Delete this Subscription Schema?',
    icon: <ExclamationCircleFilled />,
    content: 'Are you sure you want to delete this Subscription Schema?',
    onOk,
  });
}

const DeleteSubscrSchemaButton: React.FC<{
  instrumentHash: EcnSubscrSchema['instrumentHash'];
  connectSchemaId: EcnSubscrSchema['connectSchemaId'];
  onDelete: () => Promise<void>;
}> = ({ instrumentHash, connectSchemaId, onDelete }) => {
  const { worker, liquidityManager } = useLiquidityManagerContext();
  const { canManageLiquidity } = useAccess() || {};
  const canEdit = canManageLiquidity(liquidityManager);

  if (!worker || !canEdit) {
    return <></>;
  }

  return (
    <Button
      danger
      onClick={async () => {
        deleteSubscrConfirm(async () => {
          await apiClient.ecnSubscrSchemas.deleteOneBaseEcnSubscrSchemaControllerEcnSubscrSchema({
            instrumentHash,
            connectSchemaId,
            // we check for null above
            worker: worker!,
          });

          await onDelete();
        })
      }}
    >
      <DeleteOutlined />
    </Button>
  )
}

const SubscrSchemaDrawer: React.FC<{
  instrumentHash: EcnSubscrSchema['instrumentHash'];
  connectSchemaId: EcnSubscrSchema['connectSchemaId'];
  onUpdate: () => Promise<void>,
  onDelete: () => Promise<void>;
  onClose: () => void;
}> = ({ instrumentHash, connectSchemaId, onUpdate, onDelete, onClose }) => {
  const { worker, liquidityManager } = useLiquidityManagerContext();
  const { canManageLiquidity } = useAccess() || {};
  const subscrColumns = useEcnSubscrSchemaColumns();
  const canEdit = canManageLiquidity(liquidityManager);
  const connectSchemaColumns = useEcnConnectSchemasColumns(canEdit);
  const instrumentColumns = useEcnInstrumentsColumns();

  if (!worker || !canEdit) {
    return <></>;
  }

  return (
    <Drawer
      open
      title="Subscription Schema"
      onClose={onClose}
      width='33%'
      extra={
        canEdit && (
          <DeleteSubscrSchemaButton
            instrumentHash={instrumentHash}
            connectSchemaId={connectSchemaId}
            onDelete={onDelete}
          />
        )
      }
    >
      <Flex style={{ flexDirection: 'column', gap: 10 }}>
        <Card>
          <Descriptions<EcnSubscrSchema, EcnSubscrSchemaCreateDto, EcnSubscrSchemaUpdateDto, {
            instrumentHash: string,
            connectSchemaId: number,
            worker: string,
          }>
            mainTitle="Subscription Schema"
            pathParams={{
              instrumentHash,
              connectSchemaId,
              worker: worker!,
            }}
            column={2}
            idColumnName="instrumentHash"
            getOne={params => apiClient.ecnSubscrSchemas.getOneBaseEcnSubscrSchemaControllerEcnSubscrSchema(params)}
            onUpdate={async params => {
              const response = await apiClient.ecnSubscrSchemas.updateOneBaseEcnSubscrSchemaControllerEcnSubscrSchema(params);
              await onUpdate();
              return response;
            }}
            onDelete={async params => {
              const response = await apiClient.ecnSubscrSchemas.deleteOneBaseEcnSubscrSchemaControllerEcnSubscrSchema(params);
              await onDelete();
              return response;
            }}
            entityToUpdateDto={ecnSubscriptionSchemaToDto}
            columns={subscrColumns}
            canEdit={canEdit}
            params={{
              join: ecnSubscrSchemaJoinFields,
            }}
          />
        </Card>
        <Card>
          <Descriptions<EcnConnectSchema, EcnConnectSchemaCreateDto, EcnConnectSchemaUpdateDto, {
            id: number,
            worker: string,
          }>
            mainTitle="Connection Schema"
            pathParams={{
              id: Number(connectSchemaId),
              worker: worker!,
            }}
            column={2}
            getOne={params => apiClient.ecnConnectSchemas.getOneBaseEcnConnectSchemaControllerEcnConnectSchema(params)}
            onUpdate={async params => {
              const response = await apiClient.ecnConnectSchemas.updateOneBaseEcnConnectSchemaControllerEcnConnectSchema(withNumericId(params));
              await onUpdate();
              return response;
            }}
            onDelete={async params => {
              const response = await apiClient.ecnConnectSchemas.deleteOneBaseEcnConnectSchemaControllerEcnConnectSchema(withNumericId(params));
              await onDelete();
              return response;
            }}
            entityToUpdateDto={ecnConnectSchemaToDto}
            columns={connectSchemaColumns}
            params={{
              join: ecnConnectSchemaJoinFields,
            }}
            canEdit={canEdit}
          />
        </Card>
        <Card>
          <Descriptions<EcnInstrument, EcnInstrumentCreateDto, EcnInstrumentUpdateDto, {
            instrumentHash: string,
            worker: string,
          }>
            mainTitle="Instrument"
            pathParams={{
              instrumentHash,
              worker: worker!,
            }}
            column={2}
            idColumnName="instrumentHash"
            getOne={params => apiClient.ecnInstruments.getOneBaseEcnInstrumentsControllerEcnInstrument(params)}
            onUpdate={async params => {
              const response = await apiClient.ecnInstruments.updateOneBaseEcnInstrumentsControllerEcnInstrument(params);
              await onUpdate();
              return response;
            }}
            onDelete={async params => {
              const response = await apiClient.ecnInstruments.deleteOneBaseEcnInstrumentsControllerEcnInstrument(params);
              await onDelete();
              return response;
            }}
            entityToUpdateDto={ecnInstrumentToDto}
            columns={instrumentColumns}
            canEdit={canEdit}
            params={{
              join: ecnInstrumentJoinFields,
            }}
          />
        </Card>
      </Flex>
    </Drawer>
  );
};

export const EditSubscrSchemaButton: React.FC<{
  instrumentHash?: EcnSubscrSchema['instrumentHash'];
  connectSchemaId?: EcnSubscrSchema['connectSchemaId'];
  onDelete: () => Promise<void>;
  onUpdate: () => Promise<void>;
  className?: string;
}> = ({ instrumentHash, connectSchemaId, onDelete, onUpdate, ...restProps }) => {
  const { worker, liquidityManager } = useLiquidityManagerContext();
  const { canManageLiquidity } = useAccess() || {};
  const canEdit = canManageLiquidity(liquidityManager);
  const [opened, setOpened] = useState(false);

  if (!worker || !canEdit || !instrumentHash || !connectSchemaId) {
    return <></>;
  }

  return (
    <>
      <Button type="link" onClick={() => setOpened(prevState => !prevState)} {...restProps}>
        <EditOutlined />
      </Button>
      {opened && (
        <SubscrSchemaDrawer
          instrumentHash={instrumentHash}
          connectSchemaId={connectSchemaId}
          onClose={() => setOpened(false)}
          onDelete={async () => {
            setOpened(false);
            await onDelete();
          }}
          onUpdate={onUpdate}
        />
      )}
    </>
  )
}
