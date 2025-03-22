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

function toFlowNode(position: Position): FlowNodeType {
  return {
    id: uuid(),
    type: "flowNode",
    data: position,
    position: { x: 0, y: 0 },
  };
}

function toFlowEdge(
  position: Position,
  transition: Transition,
  nodes: FlowNodeType[]
): FlowEdgeType {
  return {
    id: uuid(),
    type: "flowEdge",
    data: transition,
    source: nodes.find((node) => node.data.name === position.name)!.id,
    target: nodes.find((node) => node.data.name === transition.position)!.id,
  };
}

export function toFlowGraph(route: Route): FlowGraphType {
  // Create a new dagre graph
  const g = new dagre.graphlib.Graph({ compound: true })
    .setGraph({ nodesep: 100, ranksep: 100 })
    .setDefaultEdgeLabel(() => ({}));
  const flowNodes = route.position.map(toFlowNode);
  const flowEdges = route.position.flatMap((position) =>
    position.transition.map((transition) =>
      toFlowEdge(position, transition, flowNodes)
    )
  );

  flowNodes.forEach((node) => {
    g.setNode(node.id, { width: 200, height: 50 });
  });
  flowEdges.forEach((edge) => {
    g.setEdge(edge.source, edge.target, {});
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
