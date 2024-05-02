import React, { useEffect } from 'react';
import '@antv/xflow/dist/index.css';
import apiClient from '@@api/apiClient';
import { EcnInstrument } from '@@api/generated';
import { EcnModuleDrawer } from '../EcnModules/EcnModuleDrawer';
import { Spin } from 'antd';
import { useConnectionsGraph } from '../Graph/useConnectionsGraph';
import XFlowGraph, { TData, TElements } from '../Graph';
import { buildJoinFields } from '@jifeon/boar-pack-common-frontend';
import { EcnInstrumentConnectSchemaDrawer } from './EcnInstrumentConnectSchemaDrawer';
import { useLiquidityManagerContext } from "../../tools";

export interface IProps {
  instrumentHash: EcnInstrument['instrumentHash'],
}

const EcnInstrumentGraph: React.FC<IProps> = ({ instrumentHash }) => {
  const { worker } = useLiquidityManagerContext();

  const connectionsGraphData = useConnectionsGraph();
  const {
    selectedNode, setSelectedNode,
    selectedEdge, setSelectedEdge,
    setVisibleElementsIds,
    isLoading, setIsLoading,
    setData,
    updateNode, deleteNode,
    updateEdge, deleteEdge,
  } = connectionsGraphData;

  useEffect(() => {
    if (!worker) return;

    setIsLoading(true);
    Promise.all([
      apiClient.ecnModules.getManyBaseEcnModulesControllerEcnModule({
        worker,
        s: JSON.stringify({
          'connectionsSubscrSchemas.instrumentHash': { eq: instrumentHash }
        }),
        join: buildJoinFields([
          { field: 'connections' },
          { field: 'connections.subscrSchemas' },
        ]).joinSelect,
      }),
      apiClient.ecnConnectSchemas.getManyBaseEcnConnectSchemaControllerEcnConnectSchema({
        worker,
        s: JSON.stringify({
          'subscrSchemas.instrumentHash': { eq: instrumentHash },
        }),
        join: buildJoinFields([
          { field: 'subscrSchemas', select: ['enabled'] },
        ]).joinSelect,
      }),
    ])
      .then(([nodes, edges]) => {
        const nodesMap: TData['nodesMap'] = new Map();
        const edgesMap: TData['edgesMap'] = new Map();
        const visibleEdges: TElements['edges'] = new Set();
        const visibleNodes: TElements['nodes'] = new Set();

        for (const node of nodes.data) {
          // @ts-ignore
          nodesMap.set(node.id, {
            ...node,
            frontEdgesIds: new Set(),
            backEdgesIds: new Set(),
          });
          visibleNodes.add(node.id);
        }

        for (const { subscrSchemas, ...edge } of edges.data) {
          // @ts-ignore
          edgesMap.set(edge.id, { ...edge, subscrSchemaEnabled: Boolean(subscrSchemas[0].enabled) });
          visibleEdges.add(edge.id);
          // @ts-ignore
          nodesMap.get(edge.fromModuleId)?.frontEdgesIds.add(edge.id);
          // @ts-ignore
          nodesMap.get(edge.toModuleId)?.backEdgesIds.add(edge.id);
        }

        setData({ nodesMap, edgesMap });
        setVisibleElementsIds({ edges: visibleEdges, nodes: visibleNodes });
        setIsLoading(false);
      });
  }, [worker]);

  return (
    <Spin spinning={isLoading}>
      <XFlowGraph {...connectionsGraphData} />
      <EcnModuleDrawer id={selectedNode} onDelete={deleteNode} onUpdate={updateNode} onClose={() => setSelectedNode(undefined)} />
      <EcnInstrumentConnectSchemaDrawer id={selectedEdge} instrumentHash={instrumentHash} onDelete={deleteEdge} onUpdate={updateEdge} onClose={() => setSelectedEdge(undefined)}  />
    </Spin>
  );
};

export default EcnInstrumentGraph;
