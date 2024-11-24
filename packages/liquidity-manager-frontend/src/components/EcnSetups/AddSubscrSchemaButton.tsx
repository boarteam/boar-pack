import {
  EcnConnectSchema,
  EcnInstrument,
  EcnSubscrSchema,
  EcnSubscrSchemaCreateDto,
  EcnSubscrSchemaUpdateDto
} from '@@api/generated';
import { Button, Drawer, Flex, Spin } from 'antd';
import React, { useEffect, useState } from "react";
import { useAccess } from '@umijs/max';
import apiClient from "@@api/apiClient";
import { PlusSquareOutlined } from "@ant-design/icons";
import { useLiquidityManagerContext } from '../../tools';
import { useEcnSubscrSchemaColumns } from "../EcnSubscrSchemas/useEcnSubscrSchemaColumns";
import { ecnSubscrSchemaJoinFields } from "../EcnSubscrSchemas/ecnSubscrSchemaJoinFields";
import { ecnSubscriptionSchemaToDto } from "../EcnSubscrSchemas/EcnSubscrSchemasTable";
import { Descriptions, RelationSelect } from '@jifeon/boar-pack-common-frontend';

const AddSubscrSchemaDrawer: React.FC<{
  instrumentHash: EcnSubscrSchema['instrumentHash'];
  connectSchemaId: EcnSubscrSchema['connectSchemaId'];
  onCreate: () => Promise<void>,
  onClose: () => void;
}> = ({ instrumentHash, connectSchemaId, onCreate, onClose }) => {
  const { worker, liquidityManager } = useLiquidityManagerContext();
  if (!worker) {
    return <Spin />;
  }

  const { canManageLiquidity } = useAccess() || {};
  const canEdit = canManageLiquidity(liquidityManager);
  const subscrColumns = useEcnSubscrSchemaColumns();

  const [selectedSubscrSchema, setSelectedSubscrSchema] = useState<EcnSubscrSchema & { connectSchemaDescr: string } | null>(null);
  const [instrument, setInstrument] = useState<EcnInstrument | null>(null);
  const [connectSchema, setConnectSchema] = useState<EcnConnectSchema | null>(null);
  const [data, setData] = useState<EcnSubscrSchema | {}>({});

  useEffect(() => {
    apiClient.ecnInstruments.getOneBaseEcnInstrumentsControllerEcnInstrument({
      worker,
      instrumentHash,
      join: ['instrumentGroup'],
    }).then(setInstrument);
  }, [instrumentHash]);

  useEffect(() => {
    apiClient.ecnConnectSchemas.getOneBaseEcnConnectSchemaControllerEcnConnectSchema({
      worker,
      id: connectSchemaId,
    }).then(setConnectSchema);
  }, [connectSchemaId]);

  useEffect(() => {
    if (selectedSubscrSchema) {
      const { connectSchemaId, connectSchemaDescr, ...rest } = selectedSubscrSchema; 
      setData({ ...rest, instrument, connectSchema });
    }
    else {
      setData({ instrument, connectSchema });
    }
  }, [selectedSubscrSchema, connectSchema, instrument]);

  if (!canEdit) {
    return <></>;
  }

  return (
    <Drawer
      open
      title="Subscription Schema"
      onClose={onClose}
      width='33%'
    >
      <Flex style={{ flexDirection: 'column', gap: 10 }}>
        <Flex justify={'space-between'} align={'center'}>
          Copy setting from this Connect Schema:
          <RelationSelect<EcnSubscrSchema & { connectSchemaDescr: string }>
            style={{ minWidth: '200px' }}
            onChange={setSelectedSubscrSchema}
            fieldNames={{
              label: 'connectSchemaDescr',
              value: 'connectSchemaId',
            }}
            selectedItem={selectedSubscrSchema}
            //@ts-ignore
            fetchItems={(_, keyword) => apiClient.ecnSubscrSchemas.getManyBaseEcnSubscrSchemaControllerEcnSubscrSchema({
              worker,
              s: JSON.stringify({ "$and": [
                  { "connectSchema.descr": { "$contL": keyword } },
                  { "instrumentHash": { 'eq': instrumentHash } },
                ],
              }),
              join: ['connectSchema', 'executionMode'],
              limit: 0,
            }).then(response => {
              response.data.forEach(subscrSchema => {
                // @ts-ignore-next-line
                subscrSchema.connectSchemaDescr = subscrSchema.connectSchema.descr;
              });

              return response;
            })}
          />
        </Flex>
        <Descriptions<EcnSubscrSchema, EcnSubscrSchemaCreateDto, EcnSubscrSchemaUpdateDto, {
          instrumentHash: string,
          connectSchemaId: number,
          worker: string,
        }>
          style={{ marginBottom: 0 }}
          afterSave={async subscrSchema => {
            setData({ ...subscrSchema, instrument, connectSchema })
          }}
          entity={data}
          column={2}
          idColumnName="instrumentHash"
          columns={subscrColumns}
          canEdit={canEdit}
          params={{
            join: ecnSubscrSchemaJoinFields,
          }}
        />
        <Button
          type='primary'
          style={{ alignSelf: 'end' }}
          onClick={async () => {
            try {
              await apiClient.ecnSubscrSchemas.createOneBaseEcnSubscrSchemaControllerEcnSubscrSchema({
                worker,
                requestBody: ecnSubscriptionSchemaToDto(data),
              });
              await onCreate();
            }
            catch (error) {
              console.error(error);
            }
          }}
        >
          Save
        </Button>
      </Flex>
    </Drawer>
  );
};

export const AddSubscrSchemaButton: React.FC<{
  instrumentHash?: EcnSubscrSchema['instrumentHash'];
  connectSchemaId?: EcnSubscrSchema['connectSchemaId'];
  onCreate: () => Promise<void>;
  className?: string;
}> = ({ instrumentHash, connectSchemaId, onCreate, ...restProps }) => {
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
        <PlusSquareOutlined />
      </Button>
      {opened && (
        <AddSubscrSchemaDrawer
          instrumentHash={instrumentHash}
          connectSchemaId={connectSchemaId}
          onClose={() => setOpened(false)}
          onCreate={onCreate}
        />
      )}
    </>
  )
}
