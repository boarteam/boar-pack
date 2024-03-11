import React, { useEffect, useMemo, useRef } from 'react';
import type { IAppLoad, IGraphCommandService, NsGraph } from '@antv/xflow';
import {
  CanvasScaleToolbar,
  CanvasSnapline,
  createGraphConfig,
  XFlow,
  XFlowCanvas,
  XFlowGraphCommands
} from '@antv/xflow';
import '@antv/xflow/dist/index.css';
import s from '../ConnectionsGraph/index.less';
import apiClient from '@/tools/client/apiClient';
import { EcnConnectSchema, EcnInstrument, EcnModule } from '@/tools/api';
import { AlgoNode } from '../ConnectionsGraph/react-node/algo-node';
import { EcnModuleDrawer } from '../EcnModules/EcnModuleDrawer';
import { Graph } from '@antv/x6';
import { Space, Spin, Tag } from 'antd';
import { useConnectionsGraph } from '../ConnectionsGraph/useConnectionsGraph';
import { defaultGraphNodeProps, TElements } from '../ConnectionsGraph';
import { buildJoinFields } from '@/components/Table/tableTools';
import { EcnInstrumentConnectSchemaDrawer } from './EcnInstrumentConnectSchemaDrawer';
import Paragraph from 'antd/es/typography/Paragraph';

type TData = {
  edgesMap: Map<EcnConnectSchema['id'], EcnConnectSchema & { subscrSchemaEnabled: boolean }>,
  nodesMap: Map<EcnModule['id'], EcnModule & { frontEdgesIds: Set<EcnConnectSchema['id']>, backEdgesIds: Set<EcnConnectSchema['id']> }>,
}

export interface IProps {
  instrumentHash: EcnInstrument['instrumentHash'],
}

const EcnInstrumentGraph: React.FC<IProps> = ({ instrumentHash }) => {
  const graphRef = useRef<Graph>(null);
  const commandServiceRef = useRef<IGraphCommandService>(null);
  const {
    selectedNode, setSelectedNode,
    selectedEdge, setSelectedEdge,
    visibleElementsIds, setVisibleElementsIds,
    isLoading, setIsLoading,
    data, setData,
    updateNode, deleteNode,
    updateEdge, deleteEdge,
  } = useConnectionsGraph();

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      apiClient.ecnModules.getManyBaseEcnModulesControllerEcnModule({
        s: JSON.stringify({
          'connectionsSubscrSchemas.instrumentHash': { eq: instrumentHash }
        }),
        join: buildJoinFields([
          { field: 'connections' },
          { field: 'connections.subscrSchemas' },
        ]).joinSelect,
      }),
      apiClient.ecnConnectSchemas.getManyBaseEcnConnectSchemaControllerEcnConnectSchema({
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
          nodesMap.set(node.id, {
            ...node,
            frontEdgesIds: new Set(),
            backEdgesIds: new Set(),
          });
          visibleNodes.add(node.id);
        }

        for (const { subscrSchemas, ...edge } of edges.data) {
          edgesMap.set(edge.id, { ...edge, subscrSchemaEnabled: Boolean(subscrSchemas[0].enabled) });
          visibleEdges.add(edge.id);
          nodesMap.get(edge.fromModuleId)?.frontEdgesIds.add(edge.id);
          nodesMap.get(edge.toModuleId)?.backEdgesIds.add(edge.id);
        }

        setData({ nodesMap, edgesMap });
        setVisibleElementsIds({ edges: visibleEdges, nodes: visibleNodes });
        setIsLoading(false);
      });
  }, []);

  const graphData = useMemo(() => {
    const connectedPorts = new Set<string>();

    const edges: NsGraph.IGraphData['edges'] = [];
    for (const edgeId of visibleElementsIds.edges) {
      const edgeData = data.edgesMap.get(edgeId);
      if (!edgeData) continue;

      const { id, fromModuleId, toModuleId, enabled, subscrSchemaEnabled } = edgeData;
      const sourcePortId = `${fromModuleId}-front`;
      const targetPortId = `${toModuleId}-back`;
      connectedPorts.add(sourcePortId);
      connectedPorts.add(targetPortId);
      edges.push({
        id: String(id),
        router: {
          name: 'manhattan',
        },
        connector: {
          name: 'rounded',
          args: { radius: 15 },
        },
        source: String(fromModuleId),
        sourcePortId,
        target: String(toModuleId),
        targetPortId,
        edgeContentWidth: 30,
        edgeContentHeight: 60,
        attrs: {
          line: {
            targetMarker: {
              name: "classic",
              width: 6,
              height: 8,
            },
            strokeDasharray: "",
            stroke: enabled && subscrSchemaEnabled ? '#90ee90' : '#ee9090',
            strokeWidth: 2,
          },
        },
      });
    }

    const nodes: NsGraph.IGraphData['nodes'] = [];
    for (const nodeId of visibleElementsIds.nodes) {
      const nodeData = data.nodesMap.get(nodeId);
      if (!nodeData) continue;

      const { id, name } = nodeData;
      nodes.push({
        ...defaultGraphNodeProps,
        id: String(id),
        height: 32,
        label: name,
        onClick: () => setSelectedNode(id),
      });
    }

    return { nodes, edges };
  }, [data, visibleElementsIds]);

  const onLoad: IAppLoad = async (app) => {
    const graph = await app.getGraphInstance();
    commandServiceRef.current = app.commandService;
    graphRef.current = graph;

    graph.on('edge:click', ({ edge }) => {
      edge.toFront();
      setSelectedEdge(Number(edge.data.id as string));
    });
  };

  const graphConfig = createGraphConfig(config => {
    config.setX6Config({
      grid: true,
      scaling: {
        min: 0.6,
        max: 5,
      }
    });
    config.setNodeRender('node', AlgoNode);
  })();

  useEffect(() => {
    setTimeout(() => {
      commandServiceRef.current?.executeCommand(XFlowGraphCommands.GRAPH_ZOOM.id, {
        factor: 'fit',
      });
    }, 100)
  }, [graphData]);

  return (
    <Space
      direction={'vertical'}
      style={{ width: '100%' }}
    >
      <Spin spinning={isLoading}>
        <XFlow
          className={s.dag}
          style={{ height: 'calc(100vh - 250px)' }}
          graphData={graphData}
          graphLayout={{
            layoutType: 'dagre',
            layoutOptions: {
              type: 'dagre',
              rankdir: 'LR',
              nodesep: 18,
              ranksep: 100,
              edgeLabelSpace: true,
              sortByCombo: false,
            },
          }}
          onLoad={onLoad}
        >
          <XFlowCanvas config={graphConfig} />
          <CanvasScaleToolbar position={{ top: 12, left: 12 }} />
          <CanvasSnapline color="#1890ff" />
        </XFlow>
        <EcnModuleDrawer id={selectedNode} onDelete={deleteNode} onUpdate={updateNode} onClose={() => setSelectedNode(undefined)} />
        <EcnInstrumentConnectSchemaDrawer id={selectedEdge} instrumentHash={instrumentHash} onDelete={deleteEdge} onUpdate={updateEdge} onClose={() => setSelectedEdge(undefined)}  />
      </Spin>
      <Paragraph>
        <Tag color={'green'}>Green arrows</Tag>indicate that both connection and subscription schemas are enabled.&nbsp;
        <Tag color={'red'}>Red arrows</Tag>indicate that either connection or subscription schema is disabled.
      </Paragraph>
    </Space>
  );
};

export default EcnInstrumentGraph;
