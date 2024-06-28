import {
  EcnInstrument,
  EcnSubscrSchema,
  EcnSubscrSchemaCreateDto,
  EcnSubscrSchemaUpdateDto
} from '@@api/generated';
import { Button, Drawer, Flex } from 'antd';
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
  const { canManageLiquidity } = useAccess() || {};
  const { worker } = useLiquidityManagerContext();
  const subscrColumns = useEcnSubscrSchemaColumns();
  subscrColumns.forEach(column => {
    if (column.dataIndex === 'instrument') {
      column.editable = false;
    }
  })

  const [selectedSubscrSchema, setSelectedSubscrSchema] = useState<EcnSubscrSchema | null>(null);
  const [instrument, setInstrument] = useState<EcnInstrument | null>(null);
  const [data, setData] = useState<Partial<EcnSubscrSchema & { instrument: EcnInstrument | null }>>({});

  useEffect(() => {
    if (!worker) {
      return;
    }

    apiClient.ecnInstruments.getOneBaseEcnInstrumentsControllerEcnInstrument({
      worker,
      instrumentHash,
    }).then(setInstrument);
  }, [instrumentHash]);

  useEffect(() => {
    setData({
      ...selectedSubscrSchema,
      instrumentHash,
      instrument,
      connectSchemaId,
    })
  }, [selectedSubscrSchema, instrument, connectSchemaId]);

  if (!worker || !canManageLiquidity) {
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
          <RelationSelect<EcnSubscrSchema>
            style={{ minWidth: '200px' }}
            onChange={setSelectedSubscrSchema}
            fieldNames={{
              label: 'connectSchemaDescr',
              value: 'connectSchemaId',
            }}
            selectedItem={selectedSubscrSchema}
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
            setData(subscrSchema);
          }}
          entity={data}
          column={2}
          idColumnName="instrumentHash"
          columns={subscrColumns}
          canEdit={canManageLiquidity}
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
  const { canManageLiquidity } = useAccess() || {};
  const { worker } = useLiquidityManagerContext();
  const [opened, setOpened] = useState(false);

  if (!worker || !canManageLiquidity || !instrumentHash || !connectSchemaId) {
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
