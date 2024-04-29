import React, { useEffect } from 'react';
import '@antv/xflow/dist/index.css';
import apiClient from '@api/apiClient';
import { EcnModule } from '@api/generated';
import { EcnModuleDrawer } from '../EcnModules/EcnModuleDrawer';
import { EcnConnectSchemaDrawer } from '../EcnModules/EcnConnectSchemaDrawer';
import { Spin } from 'antd';
import { useConnectionsGraph } from '../Graph/useConnectionsGraph';
import { useLiquidityManagerContext } from "../../tools/liquidityManagerContext";
import XFlowGraph, { TData, TElements } from "@/components/Graph";

export interface IProps {
  modules: Set<EcnModule['id']>,
}

const ConnectionsGraph: React.FC<IProps> = ({ modules }) => {
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
        fields: ['id,name'],
        worker,
      }),
      apiClient.ecnConnectSchemas.getManyBaseEcnConnectSchemaControllerEcnConnectSchema({
        fields: ['id,fromModuleId,toModuleId,descr,enabled'],
        worker,
      }),
    ])
      .then(([nodes, edges]) => {
        const nodesMap: TData['nodesMap'] = new Map();
        const edgesMap: TData['edgesMap'] = new Map();
        const visibleSetupEdges: TElements['edges'] = new Set();

        for (const node of nodes.data) {
          nodesMap.set(node.id, {
            ...node,
            frontEdgesIds: new Set(),
            backEdgesIds: new Set(),
          });
        }

        for (const edge of edges.data) {
          edgesMap.set(edge.id, edge);
          nodesMap.get(edge.fromModuleId)?.frontEdgesIds.add(edge.id);
          nodesMap.get(edge.toModuleId)?.backEdgesIds.add(edge.id);
          if (modules.has(edge.fromModuleId) && modules.has(edge.toModuleId)) {
            visibleSetupEdges.add(edge.id);
          }
        }

        setData({ nodesMap, edgesMap });
        setVisibleElementsIds({ nodes: modules, edges: visibleSetupEdges });
        setIsLoading(false);
      });
  }, [worker]);

  return (
    <Spin spinning={isLoading}>
      <XFlowGraph {...connectionsGraphData} />
      <EcnModuleDrawer id={selectedNode} onDelete={deleteNode} onUpdate={updateNode} onClose={() => setSelectedNode(undefined)} />
      <EcnConnectSchemaDrawer id={selectedEdge} onDelete={deleteEdge} onUpdate={updateEdge} onClose={() => setSelectedEdge(undefined)} />
    </Spin>
  );
};

export default ConnectionsGraph;
