import React, { useEffect, useMemo, useRef } from 'react';
import type { IAppLoad, IGraphCommandService, NsGraph } from '@antv/xflow';
import { CanvasContextMenu, CanvasScaleToolbar, CanvasSnapline, createCtxMenuConfig, createGraphConfig  , IconStore, MenuItemType, XFlow, XFlowCanvas, XFlowEdgeCommands, XFlowGraphCommands, XFlowNodeCommands } from '@antv/xflow';
import '@antv/xflow/dist/index.css';
import s from './index.less';
import apiClient from '@/tools/client/apiClient';
import { EcnConnectSchema, EcnModule } from '@/tools/api';
import { AlgoNode } from './react-node/algo-node';
import { EcnModuleDrawer } from '../EcnModules/EcnModuleDrawer';
import { EcnConnectSchemaDrawer } from '../EcnModules/EcnConnectSchemaDrawer';
import { Shape, Graph } from '@antv/x6';
import { Modal, Spin } from 'antd';
import { useToken } from '@ant-design/pro-components';
import { DeleteOutlined, EditOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { useConnectionsGraph } from './useConnectionsGraph';

IconStore.set('DeleteOutlined', DeleteOutlined);
IconStore.set('EditOutlined', EditOutlined);

type TData = {
  edgesMap: Map<EcnConnectSchema['id'], EcnConnectSchema>,
  nodesMap: Map<EcnModule['id'], EcnModule & { frontEdgesIds: Set<EcnConnectSchema['id']>, backEdgesIds: Set<EcnConnectSchema['id']> }>,
}

export type TElements = {
  nodes: Set<EcnModule['id']>,
  edges: Set<EcnConnectSchema['id']>,
}

export interface IProps {
  modules: Set<EcnModule['id']>,
}

export const defaultGraphNodeProps: Partial<NsGraph.INodeConfig> = {
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
  const graphRef = useRef<Graph>(null);
  const commandServiceRef = useRef<IGraphCommandService>(null);
  const { token } = useToken();
  const color = token.colorPrimary;
  const {
    selectedNode, setSelectedNode,
    selectedEdge, setSelectedEdge,
    visibleElementsIds, setVisibleElementsIds,
    isLoading, setIsLoading,
    data, setData,
    updateNode, deleteNode,
    updateEdge, deleteEdge,
    showNext, hideNext,
  } = useConnectionsGraph();

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      apiClient.ecnModules.getManyBaseEcnModulesControllerEcnModule({
        fields: ['id,name'],
      }),
      apiClient.ecnConnectSchemas.getManyBaseEcnConnectSchemaControllerEcnConnectSchema({
        fields: ['id,fromModuleId,toModuleId,descr,enabled'],
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
  }, []);

  const graphData = useMemo(() => {
    const connectedPorts = new Set<string>();

    const edges: NsGraph.IGraphData['edges'] = [];
    for (const edgeId of visibleElementsIds.edges) {
      const edgeData = data.edgesMap.get(edgeId);
      if (!edgeData) continue;

      const { id, fromModuleId, toModuleId, enabled } = edgeData;
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
            stroke: enabled ? '#90ee90' : '#ee9090',
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
        },
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
        min: 0.6,
        max: 5,
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

  useEffect(() => {
    setTimeout(() => {
      commandServiceRef.current?.executeCommand(XFlowGraphCommands.GRAPH_ZOOM.id, {
        factor: 'fit',
      });
    }, 100)
  }, [graphData]);

  return (
    <Spin spinning={isLoading}>
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
      <EcnConnectSchemaDrawer id={selectedEdge} onDelete={deleteEdge} onUpdate={updateEdge} onClose={() => setSelectedEdge(undefined)} />
    </Spin>
  );
};

export default ConnectionsGraph;
