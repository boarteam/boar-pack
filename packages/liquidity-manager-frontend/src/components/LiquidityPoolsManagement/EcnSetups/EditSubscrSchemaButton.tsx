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
} from '@/tools/api';
import apiClient from '../../../tools/client/apiClient';
import { Button, Card, Drawer, Flex, Modal } from 'antd';
import React, { useState } from "react";
import { DeleteOutlined, EditOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { useAccess } from '@umijs/max';
import { useLiquidityManagerContext } from "../liquidityManagerContext";
import {
  ecnSubscriptionSchemaToDto
} from "@/components/LiquidityPoolsManagement/EcnModules/EcnSubscrSchemas/EcnSubscrSchemasTable";
import {
  ecnSubscrSchemaJoinFields
} from "@/components/LiquidityPoolsManagement/EcnModules/EcnSubscrSchemas/ecnSubscrSchemaJoinFields";
import Descriptions from "@/components/Descriptions/Descriptions";
import {
  useEcnSubscrSchemaColumns
} from "@/components/LiquidityPoolsManagement/EcnModules/EcnSubscrSchemas/useEcnSubscrSchemaColumns";
import {
  useEcnConnectSchemasColumns
} from "@/components/LiquidityPoolsManagement/EcnConnectSchemas/useEcnConnectSchemasColumns";
import { useEcnInstrumentsColumns } from "@/components/LiquidityPoolsManagement/EcnInstruments/useEcnInstrumentsColumns";
import { withNumericId } from "@/components/Table/tableTools";
import { ecnInstrumentJoinFields } from "@/components/LiquidityPoolsManagement/EcnInstruments/ecnInstrumentJoinFields";
import {
  ecnConnectSchemaJoinFields,
  ecnConnectSchemaToDto
} from "@/components/LiquidityPoolsManagement/EcnModules/EcnConnectSchemaDrawer";
import {
  ecnConnectSchemaSearchableColumns
} from "@/components/LiquidityPoolsManagement/EcnConnectSchemas/ecnConnectSchemaSearchableColumns";
import { ecnInstrumentToDto } from "@/components/LiquidityPoolsManagement/EcnInstruments/EcnInstrumentsTable";

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
  const { canManageLiquidity } = useAccess() || {};
  const { worker } = useLiquidityManagerContext();

  if (!worker || !canManageLiquidity) {
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
  open: boolean;
  instrumentHash: EcnSubscrSchema['instrumentHash'];
  connectSchemaId: EcnSubscrSchema['connectSchemaId'];
  onUpdate: () => Promise<void>,
  onDelete: () => Promise<void>;
  onClose: () => void;
}> = ({ open, instrumentHash, connectSchemaId, onUpdate, onDelete, onClose }) => {
  const { canManageLiquidity } = useAccess() || {};
  const { worker } = useLiquidityManagerContext();
  const subscrColumns = useEcnSubscrSchemaColumns();
  const connectSchemaColumns = useEcnConnectSchemasColumns(canManageLiquidity ?? false);
  const instrumentColumns = useEcnInstrumentsColumns();

  if (!worker || !canManageLiquidity || !open) {
    return <></>;
  }

  return (
    <Drawer
      open
      title="Subscription Schema"
      onClose={onClose}
      width='33%'
      extra={
        canManageLiquidity && (
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
            canEdit={canManageLiquidity}
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
            entityToCreateDto={ecnConnectSchemaToDto}
            entityToUpdateDto={ecnConnectSchemaToDto}
            columns={connectSchemaColumns}
            params={{
              join: ecnConnectSchemaJoinFields,
            }}
            defaultSort={['id', 'DESC']}
            searchableColumns={ecnConnectSchemaSearchableColumns}
            canEdit={canManageLiquidity}
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
            canEdit={canManageLiquidity}
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
  const { canManageLiquidity } = useAccess() || {};
  const { worker } = useLiquidityManagerContext();
  const [opened, setOpened] = useState(false);

  if (!worker || !canManageLiquidity || !instrumentHash || !connectSchemaId) {
    return <></>;
  }

  return (
    <>
      <Button type="link" onClick={() => setOpened(prevState => !prevState)} {...restProps}>
        <EditOutlined />
      </Button>
      <SubscrSchemaDrawer
        open={opened}
        instrumentHash={instrumentHash}
        connectSchemaId={connectSchemaId}
        onClose={() => setOpened(false)}
        onDelete={async () => {
          setOpened(false);
          await onDelete();
        }}
        onUpdate={onUpdate}
      />
    </>
  )
}
