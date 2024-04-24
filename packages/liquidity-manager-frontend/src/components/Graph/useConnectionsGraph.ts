import { useState } from 'react';
import { IconStore } from '@antv/xflow';
import '@antv/xflow/dist/index.css';
import apiClient from '@/tools/client/apiClient';
import { EcnConnectSchema, EcnModule } from '@/tools/api';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { TEcnConnectionSchemaWihSubscrEnabled } from "../EcnInstruments/EcnInstrumentConnectSchemaDrawer";
import { useLiquidityManagerContext } from "../../tools/liquidityManagerContext";

IconStore.set('DeleteOutlined', DeleteOutlined);
IconStore.set('EditOutlined', EditOutlined);

const typeToEdges: Record<TPortGroup, 'frontEdgesIds' | 'backEdgesIds'> = {
  front: 'frontEdgesIds',
  back: 'backEdgesIds',
}

const typeToNodes: Record<TPortGroup, 'toModuleId' | 'fromModuleId'> = {
  front: 'toModuleId',
  back: 'fromModuleId',
}

type TToggleFn = (nodeId: EcnModule['id'], type: TPortGroup) => void;

type TAddNodes = (
  visibleElements: TElements,
  baseNodeId: EcnModule['id'],
  type: TPortGroup,
  allowedEdges?: TElements['edges'],
  stack?: Stack<EcnModule['id']>
) => TElements;

type TData = {
  edgesMap: Map<EcnConnectSchema['id'], TEcnConnectionSchemaWihSubscrEnabled>,
  nodesMap: Map<EcnModule['id'], EcnModule & { frontEdgesIds: Set<EcnConnectSchema['id']>, backEdgesIds: Set<EcnConnectSchema['id']> }>,
}

type TElements = {
  nodes: Set<EcnModule['id']>,
  edges: Set<EcnConnectSchema['id']>,
}

type TPortGroup = 'back' | 'front';

export interface IProps {
  modules: Set<EcnModule['id']>,
  connectSchemas?: Set<EcnConnectSchema['id']>,
  interactable?: boolean,
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


export const useConnectionsGraph = () => {
  const [selectedNode, setSelectedNode] = useState<EcnModule['id'] | undefined>();
  const [selectedEdge, setSelectedEdge] = useState<EcnConnectSchema['id'] | undefined>();
  const [visibleElementsIds, setVisibleElementsIds] = useState<TElements>({ nodes: new Set(), edges: new Set() });
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<TData>({ edgesMap: new Map(), nodesMap: new Map() });
  const { worker } = useLiquidityManagerContext();

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
    if (!worker) {
      return;
    }

    let node: ReturnType<typeof data.nodesMap.get>;
    await apiClient.ecnModules.deleteOneBaseEcnModulesControllerEcnModule({ id: nodeId, worker });
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

  const updateEdge = (updatedEdge: Partial<TEcnConnectionSchemaWihSubscrEnabled> & {id: EcnConnectSchema['id']}) => setData(prevData => {
    const edge = prevData.edgesMap.get(updatedEdge.id);
    if (!edge) return prevData;

    const newData = { ...prevData };
    newData.edgesMap.set(edge.id, {
      ...edge,
      ...updatedEdge,
    });

    return newData;
  });

  const deleteEdge = async (edgeId: EcnConnectSchema['id']) => {
    if (!worker) {
      return;
    }

    await apiClient.ecnConnectSchemas.deleteOneBaseEcnConnectSchemaControllerEcnConnectSchema({ id: edgeId, worker });
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

  return {
    selectedNode, setSelectedNode,
    selectedEdge, setSelectedEdge,
    visibleElementsIds, setVisibleElementsIds,
    isLoading, setIsLoading,
    data, setData,
    updateNode, deleteNode,
    updateEdge, deleteEdge,
    showNext, hideNext,
  }
};
