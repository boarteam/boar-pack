import React, { useEffect, useMemo, useState } from 'react';
import type { IAppLoad, NsGraph } from '@antv/xflow';
import { CanvasScaleToolbar, CanvasSnapline, createGraphConfig, XFlow, XFlowCanvas } from '@antv/xflow';

import '@antv/xflow/dist/index.css';
import s from './index.less';
import { PageContainer } from '@ant-design/pro-components';
import apiClient from '@/tools/client/apiClient';
import { EcnConnectSchema, EcnModule } from '@/tools/api';
import { AlgoNode } from './react-node/algo-node';
import { EcnModuleDrawer } from '../EcnModules/EcnModuleDrawer';
import { EcnConnectSchemaDrawer } from '../EcnModules/EcnConnectSchemaDrawer';

type TToggleFn = (nodeId: EcnModule['id'], type: TPortGroup) => void;

type TAddNodes = (
  visibleElements: TElements,
  baseNodeId: EcnModule['id'],
  type: TPortGroup,
  allowedEdges?: TElements['edges'],
  stack?: Stack<EcnModule['id']>
) => TElements;

type TData = {
  edgesMap: Map<EcnConnectSchema['id'], EcnConnectSchema>,
  nodesMap: Map<EcnModule['id'], EcnModule & { frontEdgesIds: EcnConnectSchema['id'][], backEdgesIds: EcnConnectSchema['id'][] }>,
}

type TElements = {
  nodes: Set<EcnModule['id']>,
  edges: Set<EcnConnectSchema['id']>,
}

type TPortGroup = 'back' | 'front';

export interface IProps {
  modules: EcnModule['id'][],
}

const defaultGraphNodeProps: Partial<NsGraph.INodeConfig> = {
  width: 200,
  renderKey: 'node',
  ports: {
    groups: {
      'front': {
        position: 'right',
        attrs: {
          circle: {
            r: 1,
            stroke: 'none',
            fill: 'none',
          },
        },
      },
      'back': {
        position: 'left',
        attrs: {
          circle: {
            r: 1,
            stroke: 'none',
            fill: 'none',
          },
        },
      },
    },
    items: [],
  },
};

const typeToEdges: Record<TPortGroup, 'frontEdgesIds' | 'backEdgesIds'> = {
  front: 'frontEdgesIds',
  back: 'backEdgesIds',
}

const typeToNodes: Record<TPortGroup, 'toModuleId' | 'fromModuleId'> = {
  front: 'toModuleId',
  back: 'fromModuleId',
}

class Stack<T> {
  set: Set<T>
  array: T[]

  constructor(values: Set<T>) {
    this.array = [];
    this.set = new Set();
    values.forEach(value => this.push(value));
  }

  push(value: T) {
    if (this.set.has(value)) return;
    this.set.add(value);
    this.array.push(value);
  }

  pop() {
    const value = this.array.pop();
    if (value !== undefined) this.set.delete(value);
    return value;
  }
}

const ConnectionsGraph: React.FC<IProps> = ({ modules }) => {
  const [selectedNode, setSelectedNode] = useState<EcnModule['id'] | undefined>();
  const [selectedEdge, setSelectedEdge] = useState<EcnConnectSchema['id'] | undefined>();
  const [visibleElementsIds, setVisibleElementsIds] = useState<TElements>({
    nodes: new Set(modules),
    edges: new Set()
  });
  const [data, setData] = useState<TData>({ edgesMap: new Map(), nodesMap: new Map() });

  const updateNode = (updatedNode: EcnModule) => setData(prevData => {
    const node = prevData.nodesMap.get(updatedNode.id);
    if (!node) return prevData;

    const newData = { ...prevData };
    newData.nodesMap.set(node.id, {
      ...node,
      ...updatedNode,
    });

    return newData;
  });

  useEffect(() => {
    Promise.all([
      apiClient.ecnModules.getManyBaseEcnModulesControllerEcnModule({
        fields: ['id,name'],
      }),
      apiClient.ecnConnectSchemas.getManyBaseEcnConnectSchemaControllerEcnConnectSchema({
        fields: ['id,fromModuleId,toModuleId,descr'],
      }),
    ])
      .then(([nodes, edges]) => {
        const nodesMap: TData['nodesMap'] = new Map();
        const edgesMap: TData['edgesMap'] = new Map();
        const visibleSetupEdges: TElements['edges'] = new Set();

        for (const node of nodes.data) {
          nodesMap.set(node.id, {
            ...node,
            frontEdgesIds: [],
            backEdgesIds: [],
          });
        }

        for (const edge of edges.data) {
          edgesMap.set(edge.id, edge);
          nodesMap.get(edge.fromModuleId)?.frontEdgesIds.push(edge.id);
          nodesMap.get(edge.toModuleId)?.backEdgesIds.push(edge.id);
          if (visibleElementsIds.nodes.has(edge.fromModuleId) && visibleElementsIds.nodes.has(edge.toModuleId)) {
            visibleSetupEdges.add(edge.id);
          }
        }

        setData({ nodesMap, edgesMap });
        setVisibleElementsIds(prevValues => ({ ...prevValues, edges: visibleSetupEdges }));
      });
  }, []);

  const graphData = useMemo(() => {
    const connectedPorts = new Set<string>();

    const edges: NsGraph.IGraphData['edges'] = [];
    for (const edgeId of visibleElementsIds.edges) {
      const edgeData = data.edgesMap.get(edgeId);
      if (!edgeData) continue;

      const { id, fromModuleId, toModuleId } = edgeData;
      const sourcePortId = `${fromModuleId}-front`;
      const targetPortId = `${toModuleId}-back`;
      connectedPorts.add(sourcePortId);
      connectedPorts.add(targetPortId);
      edges.push({
        id: String(id),
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
            stroke: "#cbcbcb",
            strokeWidth: 2,
          },
        },
      });
    }

    const nodes: NsGraph.IGraphData['nodes'] = [];
    for (const nodeId of visibleElementsIds.nodes) {
      const nodeData = data.nodesMap.get(nodeId);
      if (!nodeData) continue;

      const { id, name, frontEdgesIds, backEdgesIds } = nodeData;
      const portGroups: TPortGroup[] = [];
      backEdgesIds.length && portGroups.push('back');
      frontEdgesIds.length && portGroups.push('front');

      nodes.push({
        ...defaultGraphNodeProps,
        id: String(id),
        height: Math.ceil(name.length / 20) * 30,
        label: name,
        onClick: () => setSelectedNode(id),
        ports: {
          ...defaultGraphNodeProps.ports,
          items: portGroups.map(group => {
            const portId = `${id}-${group}`;
            const connected = connectedPorts.has(portId);
            return {
              id: portId,
              group,
              connected,
              onClick: () => (connected ? hideNext : showNext)(id, group),
            };
          }),
        }
      });
    }

    return { nodes, edges };
  }, [data, visibleElementsIds]);

  const addNodes: TAddNodes = (visibleElements, baseNodeId, type, allowedEdges, stack) => {
    for (const newEdgeId of data.nodesMap.get(baseNodeId)?.[typeToEdges[type]] ?? []) {
      if (visibleElements.edges.has(newEdgeId) || allowedEdges && !allowedEdges.has(newEdgeId)) continue;

      const newEdge = data.edgesMap.get(newEdgeId);
      if (!newEdge) continue;
      visibleElements.edges.add(newEdgeId);
      allowedEdges?.delete(newEdgeId);

      const newNodeId = newEdge[typeToNodes[type]];
      if (stack && !visibleElements.nodes.has(newNodeId)) stack.push(newNodeId);
      visibleElements.nodes.add(newNodeId);
    }

    return visibleElements;
  }

  const showNext: TToggleFn = (baseNodeId, type) => setVisibleElementsIds(els => ({ ...addNodes(els, baseNodeId, type) }));
  const hideNext: TToggleFn = (baseNodeId, type) => {
    const newVisibleElements: TElements = { nodes: new Set([baseNodeId]), edges: new Set() };
    data.nodesMap.get(baseNodeId)?.[typeToEdges[type]]?.forEach(id => visibleElementsIds.edges.delete(id));
    const stack = new Stack(newVisibleElements.nodes);
    for (let nodeId = stack.pop(); nodeId !== undefined; nodeId = stack.pop()) {
      addNodes(newVisibleElements, nodeId, 'front', visibleElementsIds.edges, stack);
      addNodes(newVisibleElements, nodeId, 'back', visibleElementsIds.edges, stack);
    }
    setVisibleElementsIds(newVisibleElements);
  };

  const onLoad: IAppLoad = async (app) => {
    const graph = await app.getGraphInstance();
    graph.on('edge:click', ({ edge }) => {
      edge.toFront();
      setSelectedEdge(edge.data.id);
    });
  };

  const graphConfig = createGraphConfig(config => {
    config.setX6Config({
      grid: true,
      scaling: {
        min: 0.2,
        max: 3,
      },
    });
    config.setNodeRender('node', AlgoNode);
  })();

  return (
    <>
      <XFlow
        className={s.dag}
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
      <EcnModuleDrawer id={selectedNode} onUpdate={updateNode} onClose={() => setSelectedNode(undefined)} />
      <EcnConnectSchemaDrawer id={selectedEdge} onClose={() => setSelectedEdge(undefined)} />
    </>
  );
};

export default ConnectionsGraph;
