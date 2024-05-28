import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { IAppLoad, IGraphCommandService, NsGraph } from '@antv/xflow';
import {
  CanvasContextMenu,
  CanvasSnapline,
  createCtxMenuConfig,
  createGraphConfig,
  IconStore,
  MenuItemType,
  XFlow,
  XFlowCanvas,
  XFlowEdgeCommands,
  XFlowGraphCommands,
  XFlowNodeCommands
} from '@antv/xflow';
import '@antv/xflow/dist/index.css';
import apiClient from '@@api/apiClient';
import { EcnConnectSchema, EcnModule } from '@@api/generated';
import { AlgoNode } from './react-node/algo-node';
import { Shape, Graph } from '@antv/x6';
import { Modal, Space, Switch, Tag } from 'antd';
import { useToken } from '@ant-design/pro-components';
import { DeleteOutlined, EditOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { useLiquidityManagerContext } from "../../tools";
import Paragraph from "antd/es/typography/Paragraph";
import { createStyles } from "antd-style";
import { useConnectionsGraph } from "./useConnectionsGraph";
import { CanvasScaleToolbar } from "./canvas-scale-toolbar/index";
import { useAccess } from "@umijs/max";

IconStore.set('DeleteOutlined', DeleteOutlined);
IconStore.set('EditOutlined', EditOutlined);

export type TData = {
  edgesMap: Map<EcnConnectSchema['id'], EcnConnectSchema>,
  nodesMap: Map<EcnModule['id'], EcnModule & { frontEdgesIds: Set<EcnConnectSchema['id']>, backEdgesIds: Set<EcnConnectSchema['id']> }>,
}

export type TElements = {
  nodes: Set<EcnModule['id']>,
  edges: Set<EcnConnectSchema['id']>,
}

const getDefaultGraphNodeProps: (canManageLiquidity?: boolean) => Partial<NsGraph.INodeConfig> = (canManageLiquidity = false) => ({
  width: 200,
  renderKey: 'node',
  ports: {
    groups: {
      'front': {
        position: 'right',
        attrs: {
          circle: {
            r: 5,
            magnet: canManageLiquidity,
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
            magnet: canManageLiquidity,
            stroke: '#d9d9d9',
            fill: '#d9d9d9',
          },
        },
      },
    },
    items: [],
  },
});

export const deleteNodeConfirm = async (onOk: () => Promise<void>) => {
  Modal.confirm({
    title: 'Delete this module?',
    icon: <ExclamationCircleFilled />,
    content: 'Are you sure you want to delete this module? All connections to and from this module will be deleted.',
    onOk,
  })
}

export const deleteEdgeConfirm = async (edgeId: EcnConnectSchema['id'], onOk: () => Promise<void>, worker: string) => {
  const subscrCount = await apiClient.ecnSubscrSchemas.getCount({
    connectSchemaId: edgeId,
    worker,
  }) as number;
  if (subscrCount > 0) {
    Modal.confirm({
      title: 'Delete this connection?',
      icon: <ExclamationCircleFilled />,
      content: `Are you sure you want to delete this connection? It will affect ${subscrCount} Subscribe Schemas.`,
      onOk,
    });
  } else {
    await onOk();
  }
}

const useStyles = createStyles(({ token }) => {
  const primary = '#1890ff';

  return {
    dagClass: {
      border: `1px solid ${token.colorPrimary} !important`,
      borderRadius: token.borderRadiusLG,
      position: 'relative',
      ':fullscreen': {
        background: `${token.colorBgBase} !important`,
        border: 'none !important',
      },
      height: 'calc(100vh - 290px)',
      '.x6-node:hover .front-port': {
        stroke: token.colorPrimary,
        strokeWidth: 2,
        transition: 'all ease-in-out 0.15s',
      },
      '.x6-edge': {
        '.x6-edge-label': {
          cursor: 'pointer',
          rect: {
            strokeWidth: 10,
            fill: '#d9d9d9',
            stroke: '#d9d9d9',
          },
        },
        '&:hover': {
          rect: {
            fill: primary,
            stroke: primary,
          },
          text: {
            fill: 'white',
          },
          'path:nth-child(2)': {
            stroke: primary,
          },
        },
        '&.x6-edge-selected': {
          rect: {
            fill: primary,
            stroke: primary,
          },
          text: {
            fill: 'white',
          },
          'path:nth-child(2)': {
            stroke: primary,
          },
        },
      },
    },
    scaleToolbar: {
      backgroundColor: token.colorBgBase,
      '.x6-toolbar-item': {
        color: `${token.colorPrimary} !important`,
      },
    }
  };
});

const getEdgeIdFromRealId = (realId: number) => `${realId}-edge`;
const getRealIdFromEdgeId = (edgeId: string) => Number(edgeId.slice(0, -5));
const getNodeIdFromRealId = (realId: number) => `${realId}-node`;
const getRealIdFromNodeId = (nodeId: string) => Number(nodeId.slice(0, -5));
const getPortIdFromRealId = (realId: number, port: 'frnt' | 'back') => `${getNodeIdFromRealId(realId)}-port-${port}`;
export const getPortIdFromNodeId = (nodeId: string, port: 'frnt' | 'back') => `${nodeId}-port-${port}`;

const XFlowGraph: React.FC<ReturnType<typeof useConnectionsGraph>> = ({
  setSelectedNode,
  setSelectedEdge,
  visibleElementsIds, setVisibleElementsIds,
  data, setData,
  deleteNode,
  deleteEdge,
  showNext, hideNext,
}) => {
  const graphRef = useRef<Graph>(null);
  const commandServiceRef = useRef<IGraphCommandService>(null);
  const { token } = useToken();
  const color = token.colorPrimary;
  const { canManageLiquidity } = useAccess() || {};
  const { worker } = useLiquidityManagerContext();
  const { styles } = useStyles();
  const [showDisabled, setShowDisabled] = useState(true);

  const graphData = useMemo(() => {
    const connectedPorts = new Set<string>();

    const edges: NsGraph.IGraphData['edges'] = [];
    for (const edgeId of visibleElementsIds.edges) {
      const edgeData = data.edgesMap.get(edgeId);
      if (!edgeData || (!showDisabled && !edgeData.enabled)) continue;

      const { id, fromModuleId, toModuleId, enabled } = edgeData;
      const sourcePortId = getPortIdFromRealId(fromModuleId, 'frnt');
      const targetPortId = getPortIdFromRealId(toModuleId, 'back');
      connectedPorts.add(sourcePortId);
      connectedPorts.add(targetPortId);
      edges.push({
        id: getEdgeIdFromRealId(id),
        router: {
          name: 'manhattan',
        },
        connector: {
          name: 'rounded',
          args: { radius: 15 },
        },
        // @ts-ignore
        source: getNodeIdFromRealId(fromModuleId),
        sourcePortId,
        // @ts-ignore
        target: getNodeIdFromRealId(toModuleId),
        targetPortId,
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

    const defaultGraphNodeProps = getDefaultGraphNodeProps(canManageLiquidity);
    const nodes: NsGraph.IGraphData['nodes'] = [];
    for (const nodeId of visibleElementsIds.nodes) {
      const nodeData = data.nodesMap.get(nodeId);
      if (!nodeData) continue;

      const { id, name, frontEdgesIds, backEdgesIds } = nodeData;
      const backPortId = getPortIdFromRealId(id, 'back');
      const frontPortId = getPortIdFromRealId(id, 'frnt');
      const backPortConnected = connectedPorts.has(backPortId);
      const frontPortConnected = connectedPorts.has(frontPortId);
      nodes.push({
        ...defaultGraphNodeProps,
        id: getNodeIdFromRealId(id),
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
  }, [data, visibleElementsIds, canManageLiquidity, showDisabled]);

  const onLoad: IAppLoad = async (app) => {
    if (!worker) {
      return;
    }

    const graph = await app.getGraphInstance();
    commandServiceRef.current = app.commandService;
    graphRef.current = graph;

    graph.on('edge:click', ({ edge }) => {
      edge.toFront();
      setSelectedEdge(getRealIdFromEdgeId(edge.data.id));
    });

    if (canManageLiquidity) {
      graph.on('edge:connected', async ({ edge }) => {
        graph.removeEdge(edge);
        try {
          const newEdge = await apiClient.ecnConnectSchemas.createOneBaseEcnConnectSchemaControllerEcnConnectSchema({
            requestBody: {
              fromModuleId: getRealIdFromNodeId(edge.getSourceCellId()),
              toModuleId: getRealIdFromNodeId(edge.getTargetCellId()),
            },
            worker,
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
        } catch (error) {
          console.error(error)
        }
      });
    }
  };

  const graphConfig = createGraphConfig(config => {
    let options: Parameters<typeof config.setX6Config>[0] = {
      grid: true,
      scaling: {
        min: 0.6,
        max: 5,
      },
    };

    if (canManageLiquidity) {
      options = {
        ...options,
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
          validateMagnet({ magnet }) {
            return magnet.getAttribute('port-group') === 'front';
          },
          validateConnection({ sourceView, sourceMagnet, targetView, targetMagnet }) {
            if (sourceView === targetView) {
              return false;
            }

            const isSourceRight = sourceMagnet?.getAttribute('port-group') === 'front';
            const isTargetLeft = targetMagnet?.getAttribute('port-group') === 'back';

            return isSourceRight && isTargetLeft;
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
        }
      };
    }

    config.setX6Config(options);
    config.setNodeRender('node', AlgoNode);
  })();

  const menuConfig = createCtxMenuConfig(config => {
    config.setMenuModelService(async (target, model) => {
      if (!canManageLiquidity) {
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
        return;
      }

      switch (target?.type) {
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
                    const nodeId = getRealIdFromNodeId(target.data.id);
                    deleteNodeConfirm(() => deleteNode(nodeId));
                  }
                },
              },
              {
                id: XFlowNodeCommands.UPDATE_NODE.id,
                label: 'Update module',
                iconName: 'EditOutlined',
                onClick: async ({ target }) => {
                  target.data?.id && setSelectedNode(getRealIdFromNodeId(target.data.id));
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
                  if (target.data?.id !== undefined && worker) {
                    const edgeId = getRealIdFromEdgeId(target.data.id);
                    await deleteEdgeConfirm(edgeId, () => deleteEdge(edgeId), worker);
                  }
                },
              },
              {
                id: XFlowEdgeCommands.UPDATE_EDGE.id,
                label: 'Update connection',
                iconName: 'EditOutlined',
                onClick: async ({ target }) => {
                  target.data?.id && setSelectedEdge(getRealIdFromEdgeId(target.data.id));
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
    <Space
      direction={'vertical'}
      style={{ width: '100%' }}
    >
      {/* @ts-ignore */}
      <XFlow
        className={styles.dagClass}
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
        <Space size='small' style={{ top: 10, right: 10, position: 'absolute', zIndex: 1 }}>
          <Switch checked={showDisabled} onChange={checked => setShowDisabled(checked)} />Show Disabled
        </Space>
        <CanvasContextMenu config={menuConfig} />
        <XFlowCanvas config={graphConfig} />
        <CanvasScaleToolbar
          className={styles.scaleToolbar}
          position={{ top: 12, left: 12 }}
        />
        <CanvasSnapline color="#1890ff" />
      </XFlow>
      <Paragraph>
        <Tag color={'green'}>Green arrows</Tag>indicate that both connection and subscription schemas are enabled.&nbsp;
        <Tag color={'red'}>Red arrows</Tag>indicate that either connection or subscription schema is disabled.
      </Paragraph>
    </Space>
  );
};

export default XFlowGraph;
