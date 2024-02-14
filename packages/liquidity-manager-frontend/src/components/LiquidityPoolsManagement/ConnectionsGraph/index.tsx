import React, { useEffect, useMemo, useState } from 'react';
import type { IAppLoad, NsGraph } from '@antv/xflow';
import { CanvasContextMenu, CanvasScaleToolbar, CanvasSnapline, createCtxMenuConfig, createGraphConfig  , IconStore, MenuItemType, XFlow, XFlowCanvas, XFlowEdgeCommands, XFlowNodeCommands } from '@antv/xflow';
import '@antv/xflow/dist/index.css';
import s from './index.less';
import apiClient from '@/tools/client/apiClient';
import { EcnConnectSchema, EcnModule } from '@/tools/api';
import { AlgoNode } from './react-node/algo-node';
import { EcnModuleDrawer } from '../EcnModules/EcnModuleDrawer';
import { EcnConnectSchemaDrawer } from '../EcnModules/EcnConnectSchemaDrawer';
import { Shape } from '@antv/x6';
import { Modal } from 'antd';
import { useToken } from '@ant-design/pro-components';
import { DeleteOutlined, EditOutlined, ExclamationCircleFilled } from '@ant-design/icons';

IconStore.set('DeleteOutlined', DeleteOutlined);
IconStore.set('EditOutlined', EditOutlined);

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
  nodesMap: Map<EcnModule['id'], EcnModule & { frontEdgesIds: Set<EcnConnectSchema['id']>, backEdgesIds: Set<EcnConnectSchema['id']> }>,
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
            r: 5,
            magnet: true,
            stroke: '#d9d9d9',
            fill: 'white',
            class: 'x6-port-body front-port'
          },
        },
      },
      'back': {
        position: 'left',
        attrs: {
          circle: {
            r: 5,
            magnet: true,
            stroke: '#d9d9d9',
            fill: '#d9d9d9',
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

export const deleteNodeConfirm = async (onOk: () => Promise<void>) => {
  Modal.confirm({
    title: 'Delete this module?',
    icon: <ExclamationCircleFilled />,
    content: 'Are you sure you want to delete this module? All connections to and from this module will be deleted.',
    onOk,
  })
}

export const deleteEdgeConfirm = async (edgeId: EcnConnectSchema['id'], onOk: () => Promise<void>) => {
  const subscrCount = await apiClient.ecnSubscrSchemas.getCount({ connectSchemaId: edgeId }) as number;
  if (subscrCount > 0) {
    Modal.confirm({
      title: 'Delete this connection?',
      icon: <ExclamationCircleFilled />,
      content: `Are you sure you want to delete this connection? It will affect ${subscrCount} Subscribe Schemas.`,
      onOk,
    });
  }
  else {
    onOk();
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
  const { token } = useToken();
  const color = token.colorPrimary;

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

  const deleteNode = async (nodeId: EcnModule['id']) => {
    let node: ReturnType<typeof data.nodesMap.get>;
    await apiClient.ecnModules.deleteOneBaseEcnModulesControllerEcnModule({ id: nodeId });
    setData(prevState => {
      node = prevState.nodesMap.get(nodeId);
      if (!node) return prevState;
      const newData = { ...prevState };
      newData.nodesMap.delete(node.id);
      [...node.frontEdgesIds, ...node.backEdgesIds].forEach(edgeId => newData.edgesMap.delete(edgeId));
      return newData;
    });
    setVisibleElementsIds(prevState => {
      const newVisibleElementsIds = { ...prevState };
      newVisibleElementsIds.nodes.delete(nodeId);
      [...(node?.frontEdgesIds ?? []), ...(node?.backEdgesIds ?? [])].forEach(edgeId => newVisibleElementsIds.edges.delete(edgeId));
      return newVisibleElementsIds;
    })
  };

  const deleteEdge = async (edgeId: EcnConnectSchema['id']) => {
    await apiClient.ecnConnectSchemas.deleteOneBaseEcnConnectSchemaControllerEcnConnectSchema({ id: edgeId });
    setData(prevState => {
      const edge = prevState.edgesMap.get(edgeId);
      if (!edge) return prevState;
      const newEdgesMap = new Map(prevState.edgesMap);
      newEdgesMap.delete(edgeId);
      const newNodesMap = new Map(prevState.nodesMap);
      newNodesMap.get(edge.fromModuleId)?.frontEdgesIds?.delete(edgeId);
      newNodesMap.get(edge.toModuleId)?.backEdgesIds?.delete(edgeId);
      return { edgesMap: newEdgesMap, nodesMap: newNodesMap };
    });
    setVisibleElementsIds(prevState => {
      const newEdges = new Set(prevState.edges);
      newEdges.delete(edgeId);
      return { ...prevState, edges: newEdges };
    })
  };

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
            frontEdgesIds: new Set(),
            backEdgesIds: new Set(),
          });
        }

        for (const edge of edges.data) {
          edgesMap.set(edge.id, edge);
          nodesMap.get(edge.fromModuleId)?.frontEdgesIds.add(edge.id);
          nodesMap.get(edge.toModuleId)?.backEdgesIds.add(edge.id);
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

      const backPortId = `${id}-back`;
      const frontPortId = `${id}-front`;
      const backPortConnected = connectedPorts.has(backPortId);
      const frontPortConnected = connectedPorts.has(frontPortId);

      nodes.push({
        ...defaultGraphNodeProps,
        id: String(id),
        height: 32,
        label: name,
        onClick: () => setSelectedNode(id),
        ports: {
          ...defaultGraphNodeProps.ports,
          items: [
            {
              id: frontPortId,
              group: 'front',
              connected: frontPortConnected,
              onClick: frontEdgesIds.size ? () => (frontPortConnected ? hideNext : showNext)(id, 'front') : undefined,
            },
            {
              id: backPortId,
              group: 'back',
              connected: backPortConnected,
              onClick: backEdgesIds.size ? () => (backPortConnected ? hideNext : showNext)(id, 'back') : undefined,
            },
          ],
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
    for (const edgeId of data.nodesMap.get(baseNodeId)?.[typeToEdges[type]] ?? []) {
      visibleElementsIds.edges.delete(edgeId)
    }
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
      setSelectedEdge(Number(edge.data.id as string));
    });
    graph.on('edge:connected', async ({ edge }) => {
      graph.removeEdge(edge);
      try {
        const newEdge = await apiClient.ecnConnectSchemas.createOneBaseEcnConnectSchemaControllerEcnConnectSchema({
          requestBody: {
            fromModuleId: Number(edge.getSourceCellId()),
            toModuleId: Number(edge.getTargetCellId()),
          }
        });
        setData(prevState => {
          const newEdgesMap = new Map(prevState.edgesMap);
          newEdgesMap.set(newEdge.id, newEdge);
          const newNodesMap = new Map(prevState.nodesMap);
          newNodesMap.get(newEdge.fromModuleId)?.frontEdgesIds?.add(newEdge.id);
          newNodesMap.get(newEdge.toModuleId)?.backEdgesIds?.add(newEdge.id);
          return { edgesMap: newEdgesMap, nodesMap: newNodesMap };
        });
        setVisibleElementsIds(prevState => {
          const newEdges = new Set(prevState.edges);
          newEdges.add(newEdge.id);
          return { ...prevState, edges: newEdges };
        })
      }
      catch(error) {
        console.error(error)
      }
    });
  };

  const graphConfig = createGraphConfig(config => {
    config.setX6Config({
      grid: true,
      scaling: {
        min: 0.2,
        max: 3,
      },
      highlighting: {
        magnetAvailable: {
          name: 'stroke',
          args: {
            attrs: {
              'stroke-width': 0,
            },
          },
        },
        magnetAdsorbed: {
          name: 'stroke',
          args: {
            attrs: {
              stroke: color,
            },
          },
        },
      },
      connecting: {
        snap: true,
        allowBlank: false,
        highlight: true,
        validateMagnet({ magnet, view }) {
          return magnet.getAttribute('port-group') === 'front';
        },
        validateConnection({ sourceView, sourceMagnet, targetView, targetMagnet }) {
          if (sourceView === targetView) {
            return false;
          }
          
          const isSourceRight = sourceMagnet?.getAttribute('port-group') === 'front';
          const isTargetLeft = targetMagnet?.getAttribute('port-group') === 'back';

          if (!isSourceRight || !isTargetLeft) {
            return false;
          }

          return true;
        },
        createEdge() {
          return new Shape.Edge({
            router: {
              name: 'manhattan',
            },
            connector: {
              name: 'rounded',
              args: { radius: 15 },
            },
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
        },
      },
    });
    config.setNodeRender('node', AlgoNode);
  })();

  const menuConfig = createCtxMenuConfig(config => {
    config.setMenuModelService(async (target, model) => {
      switch (target.type) {
        case 'node':
          model.setValue({
            id: 'root',
            type: MenuItemType.Root,
            submenu: [
              {
                id: XFlowNodeCommands.DEL_NODE.id,
                label: 'Delete module',
                iconName: 'DeleteOutlined',
                onClick: async ({ target }) => {
                  if (target.data?.id !== undefined) {
                    const nodeId = Number(target.data.id);
                    deleteNodeConfirm(() => deleteNode(nodeId));
                  }
                },
              },
              {
                id: XFlowNodeCommands.UPDATE_NODE.id,
                label: 'Update module',
                iconName: 'EditOutlined',
                onClick: async ({ target }) => {
                  target.data?.id && setSelectedNode(Number(target.data.id));
                },
              },
            ],
          });
          break;
        case 'edge':
          model.setValue({
            id: 'root',
            type: MenuItemType.Root,
            submenu: [
              {
                id: XFlowEdgeCommands.DEL_EDGE.id,
                label: 'Delete connection',
                iconName: 'DeleteOutlined',
                onClick: async ({ target }) => {
                  if (target.data?.id !== undefined) {
                    const edgeId = Number(target.data.id);
                    deleteEdgeConfirm(edgeId, () => deleteEdge(edgeId));
                  }
                },
              },
              {
                id: XFlowEdgeCommands.UPDATE_EDGE.id,
                label: 'Update connection',
                iconName: 'EditOutlined',
                onClick: async ({ target }) => {
                  target.data?.id && setSelectedEdge(Number(target.data.id));
                },
              },
            ],
          });
          break;
        case 'blank':
        default:
          model.setValue({
            id: 'root',
            type: MenuItemType.Root,
            submenu: [
              {
                id: 'EMPTY_MENU_ITEM',
                label: 'No action',
                isEnabled: false,
                iconName: 'DeleteOutlined',
              },
            ],
          });
          break;
      }
    })
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
        <CanvasContextMenu config={menuConfig} />
        <XFlowCanvas config={graphConfig} />
        <CanvasScaleToolbar position={{ top: 12, left: 12 }} />
        <CanvasSnapline color="#1890ff" />
      </XFlow>
      <EcnModuleDrawer id={selectedNode} onDelete={deleteNode} onUpdate={updateNode} onClose={() => setSelectedNode(undefined)} />
      <EcnConnectSchemaDrawer id={selectedEdge} onDelete={deleteEdge} onClose={() => setSelectedEdge(undefined)} />
    </>
  );
};

export default ConnectionsGraph;
