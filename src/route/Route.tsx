import { useEffect } from "react";
import { useParams } from "react-router";
import { Title, Text } from "@mantine/core";
import { useNodesState, useEdgesState } from "@xyflow/react";

import Graph from "../molecules/Graph";
import { useAwyes } from "../Context";
import { FlowNodeType, FlowEdgeType } from "../types";

export default function Route() {
  const { context, name } = useParams();
  const [nodes, setNodes] = useNodesState<FlowNodeType>([]);
  const [edges, setEdges] = useEdgesState<FlowEdgeType>([]);
  const { selectedFlow, setSelectedFlow, flows, clearSelectedTrip } =
    useAwyes();

  // Effect for handling route changes
  useEffect(() => {
    if (!context || !name) return;
    const matchingFlow = flows.find(
      (flow) => flow.context === context && flow.name === name
    );
    if (!matchingFlow) return;
    setSelectedFlow(matchingFlow);
    clearSelectedTrip();
  }, [context, name, flows]);

  // Effect for updating nodes and edges when selectedFlow changes
  useEffect(() => {
    if (!selectedFlow) return;
    setNodes(selectedFlow.nodes);
    setEdges(selectedFlow.edges);
  }, [selectedFlow]);

  if (!selectedFlow) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          color: "var(--mantine-color-gray-6)",
        }}
      >
        <Title order={2}>No Flow Selected</Title>
        <Text>Select an existing flow or create a new one to get started</Text>
      </div>
    );
  }

  return <Graph nodes={nodes} edges={edges} />;
}
