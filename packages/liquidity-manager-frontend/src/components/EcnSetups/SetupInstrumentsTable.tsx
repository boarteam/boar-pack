import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, Flex, Space, Switch } from 'antd';
import { ActionType, ColumnsState, ProFormSelect, ProTable } from '@ant-design/pro-components';
import apiClient from '@@api/apiClient';
import {
  EcnConnectSchema,
  EcnConnectSchemaSetupLabel,
  EcnInstrument,
  EcnInstrumentsGroup,
  GetEcnInstrumentsInConnectionsData,
} from '@@api/generated';
import { useSetupInstrumentsColumns } from './useSetupInstrumentsColumns';
import { SortOrder } from 'antd/es/table/interface';
import { useLiquidityManagerContext } from "../../tools";
import { PageLoading } from "@ant-design/pro-layout";
import { FiltersChooser } from "./InstrumentsFilters/FiltersChooser";
import { FiltersContext, getParamsFromValues, useFilters } from "./InstrumentsFilters/filtersContext";
import { createStyles } from "antd-style";

type ParamsType = {
  connectSchemasIds?: EcnConnectSchema['id'][],
  compareConnectSchemaId?: EcnConnectSchema['id'],
  filterInstrument?: EcnInstrument['instrumentHash'][],
  filterInstrumentsGroup?: EcnInstrumentsGroup['id'][],
  showOnlyChanged?: boolean,
}

type RequestParams = ParamsType & {
  pageSize?: number;
  current?: number;
  keyword?: string
}

const Options: React.FC<{
  connectSchemas: EcnConnectSchema[];
  patchParams: (params: Partial<ParamsType>) => void;
  reload?: () => void;
}> = ({
  connectSchemas,
  patchParams,
  reload,
}) => {
  return (
    <Flex justify={'space-between'}>
      <Space>
        <FiltersChooser />
        <ProFormSelect<EcnConnectSchema['id']>
          showSearch
          formItemProps={{
            style: {
              margin: 0,
              display: 'inline-block',
            }
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
      </Space>
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

const useStyles = createStyles(({ token }) => {
  return {
    table: {
      '.ant-pro-table-column-setting-overlay .ant-popover-inner-content': {
        '.ant-pro-table-column-setting-list-item-title': {
          overflow: 'visible',
        },
        width: '400px',
      },
      '.ant-table-cell': {
        '.ant-table-cell_edit-button': {
          opacity: 0,
          transition: 'opacity 300ms',
          cursor: 'pointer',
        },
        overflow: 'visible',
      },
    }
  }
});

export const SetupInstrumentsTable = ({ id }: { id: EcnConnectSchemaSetupLabel['id'] }) => {
  const actionRef = useRef<ActionType>();
  const [connectSchemas, setConnectSchemas] = useState<EcnConnectSchema[]>([]);
  const [params, setParams] = useState<ParamsType>({});
  const columns = useSetupInstrumentsColumns(connectSchemas, params.compareConnectSchemaId);
  const patchParams = (params: Partial<ParamsType>) => setParams(prevParams => ({ ...prevParams, ...params }));
  const { worker } = useLiquidityManagerContext();
  const filters = useFilters();

  const { styles } = useStyles();

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
    const {
      pageSize = 10,
      current = 1,
      connectSchemasIds,
      keyword,
      compareConnectSchemaId,
      showOnlyChanged,
      filterInstrument,
      filterInstrumentsGroup,
    } = receivedParams;

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
      filterInstrument,
      filterInstrumentsGroup,
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
      const columnId = Number(columnIdString.split(',').pop());
      if (connectSchemasIdsMap.get(columnId) !== undefined && columnState.show === false) {
        connectSchemasIds.delete(columnId);
      }
    }
    patchParams({ connectSchemasIds: [...connectSchemasIds] });
  }

  useEffect(() => {
    const { instr: filterInstrument, group: filterInstrumentsGroup } = getParamsFromValues(filters.chosenData.values);
    patchParams({ filterInstrumentsGroup, filterInstrument });
  }, [filters.chosenData.values])

  if (!worker) return <PageLoading />;

  return (
    <FiltersContext.Provider value={filters}>
      <Card>
        <ProTable<GetEcnInstrumentsInConnectionsData, ParamsType>
          ghost
          rowKey={'instrumentHash'}
          className={styles.table}
          scroll={{ x: 'max-content' }}
          actionRef={actionRef}
          tableExtraRender={() => (
            <Options
              connectSchemas={connectSchemas}
              patchParams={patchParams}
              reload={() => actionRef.current?.reload}
            />
          )}
          columnsState={{ onChange: onChangeColumnsState }}
          params={params}
          columns={columns}
          search={false}
          options={{ fullScreen: true }}
          request={requestData}
        />
      </Card>
    </FiltersContext.Provider>
  );
}
