import dagre from "dagre";
import { v4 as uuid } from "uuid";
import { Edge, Node } from "@xyflow/react";
import { Route, Position, Transition } from "@the-sage-group/awyes-web";

// Define interfaces that extend the AwYes types with IDs
export type FlowNodeType = Node<Position & Record<string, any>, "flowNode">;
export type FlowEdgeType = Edge<Transition & Record<string, any>, "flowEdge">;
export type FlowGraphType = Omit<Route, "positions" | "transitions"> & {
  nodes: FlowNodeType[];
  edges: FlowEdgeType[];
};

export function toRouteProto(flow: FlowGraphType): Route {
  return {
    ...flow,
    positions: flow.nodes.map(toPositionProto),
    transitions: flow.edges.map(toTransitionProto),
  };
}

export function toPositionProto(node: FlowNodeType): Position {
  return {
    ...node.data,
  };
}

export function toTransitionProto(edge: FlowEdgeType): Transition {
  return {
    ...edge.data!,
  };
}

export function toFlowGraph(route: Route): FlowGraphType {
  // Create a new dagre graph
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "TB", nodesep: 70, ranksep: 70 });

  const flowNodes = route.positions.map((node) => toFlowNode(node));
  flowNodes.forEach((node) => {
    g.setNode(node.id, { width: 100, height: 100 });
  });
  const flowEdges = route.transitions.map((edge) =>
    toFlowEdge(edge, flowNodes)
  );
  flowEdges.forEach((edge) => {
    g.setEdge(edge.source, edge.target, { weight: 1 });
  });

  // Calculate layout
  dagre.layout(g);

  // Convert nodes with dagre positions
  return {
    ...route,
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

export function toFlowEdge(
  transition: Transition,
  nodes: FlowNodeType[]
): FlowEdgeType {
  const id = uuid();
  const fromNode = nodes.find((n) => n.data.name === transition.from?.name);
  const toNode = nodes.find((n) => n.data.name === transition.to?.name);

  return {
    id,
    type: "flowEdge",
    data: { ...transition, id },
    source: fromNode?.id || "",
    target: toNode?.id || "",
  };
}

export function toFlowNode(
  position: Position,
  location?: { x: number; y: number }
): FlowNodeType {
  const id = uuid();
  return {
    id,
    type: "flowNode",
    data: { ...position, id },
    position: location || { x: 100, y: 100 },
  };
}
