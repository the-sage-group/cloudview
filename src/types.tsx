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
  const id = uuid();
  return {
    id,
    type: "flowNode",
    data: { ...position, id },
    position: { x: 0, y: 0 },
  };
}

function toFlowEdge(
  position: Position,
  transition: Transition,
  nodes: FlowNodeType[]
): FlowEdgeType {
  const id = uuid();
  return {
    id,
    type: "flowEdge",
    data: { ...transition, id },
    source: nodes.find((node) => node.data.name === position.name)!.id,
    target: nodes.find((node) => node.data.name === transition.position)!.id,
  };
}

export function toFlowGraph(route: Route): FlowGraphType {
  // Create a new dagre graph
  const g = new dagre.graphlib.Graph({ compound: true })
    .setGraph({})
    .setDefaultEdgeLabel(() => ({}));
  const flowNodes = route.positions.map(toFlowNode);
  const flowEdges = route.positions.flatMap((position) =>
    position.transitions.map((transition) =>
      toFlowEdge(position, transition, flowNodes)
    )
  );

  g.setNode("Start", {
    width: 200,
    height: 50,
    label: "Start Group",
  });

  g.setNode("Middle", {
    width: 200,
    height: 50,
    label: "Middle Group",
  });

  g.setNode("End", {
    width: 200,
    height: 50,
    label: "End Group",
  });

  flowNodes.forEach((node) => {
    g.setNode(node.id, {
      width: 200,
      height: 50,
      label: node.data.name,
    });
    if (node.data.name === "Start") {
      g.setParent(node.id, "Start");
    } else if (node.data.name === "End") {
      g.setParent(node.id, "End");
    } else {
      g.setParent(node.id, "Middle");
    }
  });

  flowEdges.forEach((edge) => {
    g.setEdge(edge.source, edge.target, {
      label: edge.data?.label,
    });
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
