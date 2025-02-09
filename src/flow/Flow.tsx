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

import { Info } from "./Info";
import { Execute } from "./Execute";
import { NewFlow } from "./New";
import { FlowNode } from "../node/Node";
import { FlowEdge } from "../edge/Edge";
import { useAwyes } from "../Context";
import { SelectedNode } from "../node/Selected";
import { FlowNodeType, FlowEdgeType, toRouteProto } from "../types";
import { handleNodesChange, handleEdgesChange, createNewEdge } from "./utils";

const nodeTypes = {
  flowNode: FlowNode,
};

const edgeTypes = {
  flowEdge: FlowEdge,
};

export default function Flow() {
  const { routeName } = useParams();
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNodeType>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<FlowEdgeType>([]);
  const {
    selectedFlow,
    setSelectedFlow,
    setSelectedNode,
    flows,
    setFlows,
    awyes,
  } = useAwyes();

  // Effect for handling route changes
  useEffect(() => {
    if (routeName) {
      const matchingFlow = flows.find((flow) => flow.name === routeName);
      if (matchingFlow) {
        setSelectedFlow(matchingFlow);
      }
    }
  }, [routeName, flows]);

  // Effect for updating nodes and edges when selectedFlow changes
  useEffect(() => {
    async function updateFlow() {
      if (selectedFlow) {
        setNodes(selectedFlow.nodes);
        setEdges(selectedFlow.edges);
        try {
          await awyes.registerRoute({ route: toRouteProto(selectedFlow) });
        } catch (error) {
          console.error("Failed to save route:", error);
        }
      } else {
        setNodes([]);
        setEdges([]);
      }
    }
    updateFlow();
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
        <NewFlow />
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
        onPaneClick={() => setSelectedNode(null)}
        onConnect={(connection) => {
          if (connection.source && connection.target) {
            createNewEdge(connection, selectedFlow, setSelectedFlow);
          }
        }}
        onNodesChange={(changes) =>
          handleNodesChange(
            changes,
            onNodesChange,
            selectedFlow,
            setSelectedFlow
          )
        }
        onEdgesChange={(changes) =>
          handleEdgesChange(
            changes,
            onEdgesChange,
            selectedFlow,
            setSelectedFlow
          )
        }
      >
        <Controls
          showZoom={false}
          showInteractive={false}
          showFitView={true}
          position="bottom-left"
        />
        <Info selectedFlow={selectedFlow} />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <SelectedNode />
        <Execute />
      </ReactFlow>
    </div>
  );
}
