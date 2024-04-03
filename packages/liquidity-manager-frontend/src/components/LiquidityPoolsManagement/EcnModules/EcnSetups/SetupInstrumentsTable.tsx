import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, Space, Switch, Flex } from 'antd';
import { ActionType, ColumnsState, ProFormSelect, ProTable } from '@ant-design/pro-components';
import apiClient from '@/tools/client/apiClient';
import { EcnConnectSchema, EcnConnectSchemaSetupLabel, EcnInstrument, GetEcnInstrumentsInConnectionsData } from '@/tools/api';
import s from '@/tools/tools.less';
import { useSetupInstrumentsColumns } from './useSetupInstrumentsColumns';
import { SortOrder } from 'antd/es/table/interface';
import { useLiquidityManagerContext } from "../../liquidityManagerContext";
import { PageLoading } from "@ant-design/pro-layout";

type ParamsType = {
  connectSchemasIds?: EcnConnectSchema['id'][],
  compareConnectSchemaId?: EcnConnectSchema['id'],
  showOnlyChanged?: boolean,
}

type RequestParams = ParamsType & {
  pageSize?: number;
  current?: number;
  keyword?: string
}

export type DataType = Record<EcnConnectSchema['id'], 'Disabled' | 'Enabled' | 'Changed'> & {
  instrumentName: EcnInstrument['name'],
  instrumentHash: EcnInstrument['instrumentHash']
}

export const SetupInstrumentsTable = ({ id }: { id: EcnConnectSchemaSetupLabel['id'] }) => {
  const actionRef = useRef<ActionType>();
  const [connectSchemas, setConnectSchemas] = useState<EcnConnectSchema[]>([]);
  const [params, setParams] = useState<ParamsType>({});
  const columns = useSetupInstrumentsColumns(connectSchemas, params.compareConnectSchemaId);
  const patchParams = (params: Partial<ParamsType>) => setParams(prevParams => ({ ...prevParams, ...params }));
  const { worker } = useLiquidityManagerContext();

  useEffect(() => {
    if (!worker) return;

    apiClient.ecnConnectSchemas.getManyBaseEcnConnectSchemaControllerEcnConnectSchema({
      worker,
      s: JSON.stringify({
        "$and": [
          { "fromModuleSetupLabels.id": { "$eq": id } },
          { "toModuleSetupLabels.id": { "$eq": id } },
        ]
      }),
      fields: ['descr'],
      join: ['fromModule', 'fromModule.setupLabels', 'toModule', 'toModule.setupLabels'],
      limit: 0,
    })
      .then(connectSchemas => {
        setConnectSchemas(connectSchemas.data);
        patchParams({ connectSchemasIds: connectSchemas.data.map(connectSchema => connectSchema.id) });
      });
  }, [worker]);

  const requestData = async (receivedParams: RequestParams, sort: Record<string, SortOrder>) => {
    const { pageSize = 10, current = 1, connectSchemasIds, keyword, compareConnectSchemaId, showOnlyChanged } = receivedParams;
    if (!connectSchemasIds) {
      return {
        data: [],
        success: false,
        total: 0,
      };
    }

    let sortDirection: 'ASC' | 'DESC' | undefined = undefined;
    if (sort) {
      sortDirection = sort.instrumentName === 'ascend' ? 'ASC' : 'DESC';
    }

    if (!worker) return {
      data: [],
      success: false,
      total: 0,
    };

    return apiClient.ecnInstruments.getInConnections({
      worker,
      id: connectSchemasIds,
      compareConnectSchemaId,
      limit: pageSize,
      offset: (current - 1) * pageSize,
      sortDirection,
      search: keyword,
      showOnlyChanged,
    })
      .then(({ data, total }) => ({ data, success: true, total }))
      .catch(error => {
        console.error(error);
        return {
          data: [],
          success: false,
          total: 0,
        };
      });
  }

  const connectSchemasIdsMap = useMemo(() => {
    const connectSchemasIdsMap = new Map<EcnConnectSchema['id'], EcnConnectSchema>();
    for (const connectSchema of connectSchemas) {
      connectSchemasIdsMap.set(connectSchema.id, connectSchema);
    }
    return connectSchemasIdsMap;
  }, [connectSchemas]);

  const onChangeColumnsState = (newColumnsState: Record<string, ColumnsState>) => {
    const connectSchemasIds = new Set<EcnConnectSchema['id']>(connectSchemasIdsMap.keys());
    for (const [columnIdString, columnState] of Object.entries(newColumnsState)) {
      const columnId = Number(columnIdString);
      if (connectSchemasIdsMap.get(columnId) !== undefined && columnState.show === false) {
        connectSchemasIds.delete(columnId);
      }
    }
    patchParams({ connectSchemasIds: [...connectSchemasIds] });
  }

  const processData = (data: GetEcnInstrumentsInConnectionsData[]) => {
    const { compareConnectSchemaId } = params;

    if (compareConnectSchemaId === undefined) {
      return data.map(row => {
        for (const [connection, { enabled }] of Object.entries(row.connections)) {
          row[connection] = enabled ? 'Enabled' : 'Disabled';
        }

        return row;
      });
    }

    const compareConnectSchemaInstrumentsAvailabilityMap = data.reduce((acc, row) => {
      acc.set(row.instrumentHash, row.connections[compareConnectSchemaId]?.enabled ?? false);
      return acc;
    }, new Map<EcnInstrument['instrumentHash'], boolean>());

    return data.map(row => {
      for (const [connection, { equal, enabled }] of Object.entries(row.connections)) {
        if (!enabled) {
          row[connection] = 'Disabled';
          continue;
        }

        if (equal === false && enabled && compareConnectSchemaInstrumentsAvailabilityMap.get(row.instrumentHash)) {
          row[connection] = 'Changed';
          continue;
        }

        row[connection] = 'Enabled';
      }

      return row;
    })
  }

  if (!worker) return <PageLoading />;

  return (
    <Card>
      <ProTable<DataType, ParamsType>
        ghost
        className={s['setup-instruments-table']}
        scroll={{ x: 'max-content' }}
        actionRef={actionRef}
        tableExtraRender={() => <Options connectSchemas={connectSchemas} patchParams={patchParams} reload={actionRef.current?.reload} />}
        columnsState={{ onChange: onChangeColumnsState }}
        params={params}
        columns={columns}
        search={false}
        options={{
          fullScreen: true,
          search: { allowClear: true },
        }}
        request={requestData}
        postData={processData}
      />
    </Card>
  );
}

const Options = (
  {
    connectSchemas,
    patchParams,
    reload,
  }: {
    connectSchemas: EcnConnectSchema[],
    patchParams: (params: Partial<ParamsType>) => void,
    reload?: () => void,
  }
) => {
  return (
    <Flex justify={'space-between'}>
      <ProFormSelect<EcnConnectSchema['id']>
        showSearch
        formItemProps={{
          className: s.noMargin,
        }}
        width={400}
        mode='single'
        placeholder='Choose connect schema to compare with...'
        options={connectSchemas.map(connectSchema => ({ label: connectSchema.descr, value: connectSchema.id }))}
        onChange={option => {
          patchParams({ compareConnectSchemaId: option });
          reload?.();
        }}
      />
      <Space>
        Show only rows with changes:
        <Switch
          onChange={checked => {
            patchParams({ showOnlyChanged: checked });
            reload?.();
          }}
        />
      </Space>
    </Flex>
  )
}
