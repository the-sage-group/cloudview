import dagre from "dagre";
import { v4 as uuid } from "uuid";
import { Edge, Node } from "@xyflow/react";
import {
  Node as AwYesNode,
  Edge as AwYesEdge,
  Flow as AwYesFlow,
} from "@the-sage-group/awyes-web";

// Define interfaces that extend the AwYes types with IDs

export type FlowNodeType = Node<AwYesNode & Record<string, any>, "flowNode">;
export type FlowEdgeType = Edge<AwYesEdge & Record<string, any>, "flowEdge">;
export type FlowGraphType = Omit<AwYesFlow, "nodes" | "edges"> & {
  nodes: FlowNodeType[];
  edges: FlowEdgeType[];
};

export function toFlowProto(flow: FlowGraphType): AwYesFlow {
  return {
    ...flow,
    nodes: flow.nodes.map(toNodeProto),
    edges: flow.edges.map(toEdgeProto),
  };
}

export function toNodeProto(node: FlowNodeType): AwYesNode {
  return {
    ...node.data,
  };
}

export function toEdgeProto(edge: FlowEdgeType): AwYesEdge {
  return {
    ...edge.data!,
  };
}

export function toFlowGraph(flow: AwYesFlow): FlowGraphType {
  // Create a new dagre graph
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "TB", nodesep: 70, ranksep: 70 });

  const flowNodes = flow.nodes.map((node) => toFlowNode(node));
  const flowEdges = flow.edges.map((edge) => toFlowEdge(edge));

  // Add nodes to dagre
  flowNodes.forEach((node) => {
    g.setNode(node.id, {});
  });

  // Add edges to dagre
  flowEdges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  // Calculate layout
  dagre.layout(g);

  // Convert nodes with dagre positions
  return {
    ...flow,
    nodes: flowNodes.map((node) => {
      const pos = g.node(node.id);
      return {
        ...node,
        position: { x: pos.x, y: pos.y },
      };
    }),
    edges: flowEdges,
  };
}

export function toFlowEdge(edge: AwYesEdge): FlowEdgeType {
  const id = uuid();
  return {
    id,
    type: "flowEdge",
    data: { ...edge, id },
    source: edge.source,
    target: edge.target,
  };
}

export function toFlowNode(
  node: AwYesNode,
  position?: { x: number; y: number }
): FlowNodeType {
  const id = uuid();
  return {
    id,
    type: "flowNode",
    data: { ...node, id },
    position: position || { x: 100, y: 100 },
  };
}
