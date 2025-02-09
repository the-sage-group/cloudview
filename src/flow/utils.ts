import { NodeChange, EdgeChange } from "@xyflow/react";
import { v4 as uuid } from "uuid";
import { AwyesClient, Entity, Value } from "@the-sage-group/awyes-web";
import {
  FlowNodeType,
  FlowEdgeType,
  FlowGraphType,
  toRouteProto,
} from "../types";

export const handleNodesChange = (
  changes: NodeChange<FlowNodeType>[],
  onNodesChange: (changes: NodeChange<FlowNodeType>[]) => void,
  selectedFlow: FlowGraphType,
  setSelectedFlow: (flow: FlowGraphType) => void
) => {
  onNodesChange(changes);

  const deletions = changes.filter((change) => change.type === "remove");
  if (deletions.length > 0) {
    const deletedIds = new Set(deletions.map((d) => d.id));
    setSelectedFlow({
      ...selectedFlow,
      nodes: selectedFlow.nodes.filter(
        (node: FlowNodeType) => !deletedIds.has(node.id)
      ),
      edges: selectedFlow.edges.filter(
        (edge: FlowEdgeType) =>
          !deletedIds.has(edge.source) && !deletedIds.has(edge.target)
      ),
    });
  }
};

export const handleEdgesChange = (
  changes: EdgeChange<FlowEdgeType>[],
  onEdgesChange: (changes: EdgeChange<FlowEdgeType>[]) => void,
  selectedFlow: FlowGraphType,
  setSelectedFlow: (flow: FlowGraphType) => void
) => {
  onEdgesChange(changes);

  const deletions = changes.filter((change) => change.type === "remove");
  if (deletions.length > 0) {
    const deletedIds = new Set(deletions.map((d) => d.id));
    setSelectedFlow({
      ...selectedFlow,
      edges: selectedFlow.edges.filter(
        (edge: FlowEdgeType) => !deletedIds.has(edge.id)
      ),
    });
  }
};

export const createNewEdge = (
  connection: { source: string; target: string },
  selectedFlow: FlowGraphType,
  setSelectedFlow: (flow: FlowGraphType) => void
) => {
  const id = uuid();
  const newEdge: FlowEdgeType = {
    id,
    source: connection.source,
    target: connection.target,
    type: "flowEdge",
    data: {
      id,
      label: "",
    },
  };
  setSelectedFlow({
    ...selectedFlow,
    edges: [...selectedFlow.edges, newEdge],
  });
};

export const handleExecuteFlow = async (
  entity: Entity,
  paramValues: Record<string, string>,
  selectedFlow: FlowGraphType,
  awyes: AwyesClient,
  navigate: (path: string) => void
) => {
  try {
    const stateValues: { [key: string]: Value } = {};
    Object.entries(paramValues).forEach(([key, value]) => {
      stateValues[key] = Value.fromJson({ stringValue: value });
    });

    const { response } = await awyes.startTrip({
      route: toRouteProto(selectedFlow),
      state: stateValues,
      entity: entity,
    });
    navigate(`/trip/${response.trip?.id}`);
  } catch (error) {
    console.error("Failed to execute flow:", error);
  }
};
