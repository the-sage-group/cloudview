import { useEffect } from "react";
import { useParams } from "react-router";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Background,
  BackgroundVariant,
  Controls,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Title, Text } from "@mantine/core";

import { Execute } from "./Execute";
import { SelectedFlow } from "./Selected";
import { FlowNode } from "../node/Node";
import { FlowEdge } from "../edge/Edge";
import { useAwyes } from "../Context";
import { SelectedNode } from "../node/Selected";
import { FlowNodeType, FlowEdgeType } from "../types";

const nodeTypes = {
  flowNode: FlowNode,
};

const edgeTypes = {
  flowEdge: FlowEdge,
};

export default function Flow() {
  const { routeName } = useParams();
  const [nodes, setNodes] = useNodesState<FlowNodeType>([]);
  const [edges, setEdges] = useEdgesState<FlowEdgeType>([]);
  const { selectedFlow, setSelectedFlow, setSelectedNode, flows } = useAwyes();

  // Effect for handling route changes
  useEffect(() => {
    if (!routeName) return;
    const matchingFlow = flows.find((flow) => flow.name === routeName);
    if (!matchingFlow) return;
    setSelectedFlow(matchingFlow);
  }, [routeName, flows]);

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

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <ReactFlow
        fitView
        nodes={nodes}
        edges={edges}
        minZoom={0.1}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        edgesFocusable={false}
        nodesDraggable={false}
        nodesConnectable={false}
        edgesReconnectable={false}
        elementsSelectable={true}
        onPaneClick={() => setSelectedNode(null)}
      >
        <Controls
          showZoom={false}
          showInteractive={false}
          showFitView={true}
          position="bottom-left"
        />
        <SelectedFlow selectedFlow={selectedFlow} />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <SelectedNode />
        <Execute />
      </ReactFlow>
    </div>
  );
}
