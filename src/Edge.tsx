import { v4 as uuid } from "uuid";
import { Connection } from "@xyflow/react";
import { FlowEdgeType } from "./types";

export function addFlowEdge(
  connection: Connection,
  edges: FlowEdgeType[],
  setEdges: (edges: FlowEdgeType[]) => void
) {
  const id = uuid();
  setEdges([
    ...edges,
    {
      id,
      source: connection.source,
      target: connection.target,
      data: {
        id,
        source: connection.source,
        target: connection.target,
        mappings: [],
      },
    },
  ]);
}
