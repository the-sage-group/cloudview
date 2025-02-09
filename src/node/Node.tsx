import { useState } from "react";
import { useParams } from "react-router";
import { NodeProps, Handle, Position } from "@xyflow/react";
import { Paper, Text, Stack, TextInput } from "@mantine/core";

import { useAwyes } from "../Context";
import { FlowNodeType, FlowEdgeType } from "../types";

export function FlowNode(props: NodeProps<FlowNodeType>) {
  const { data: node, id } = props;
  const {
    selectedFlow,
    setSelectedFlow,
    selectedNode,
    setSelectedNode,
    selectedTripEvents: selectedEvents,
  } = useAwyes();
  const { tripId } = useParams();
  const [nodeName, setNodeName] = useState(
    node.name ? node.name : node.handler?.name
  );
  const [isEditing, setIsEditing] = useState(node.name ? false : true);

  // Check if there are events for this node
  const nodeEvents = selectedEvents.filter(
    (event) => event.position?.name === (node.name || node.handler?.name)
  );
  const hasEvents = nodeEvents.length > 0;

  const updateNodeName = () => {
    setIsEditing(false);
    if (!selectedFlow) return;
    const updatedNodes = selectedFlow.nodes.map((n: FlowNodeType) => {
      if (n.id === node.id) {
        n.data.name = nodeName;
      }
      return n;
    });
    const updatedEdges = selectedFlow.edges.map((e: FlowEdgeType) => {
      if (!e.data?.from || !e.data?.to) return e;
      if (e.source === node.id) {
        e.data.from.name = nodeName;
      }
      if (e.target === node.id) {
        e.data.to.name = nodeName;
      }
      return e;
    });
    setSelectedFlow({
      ...selectedFlow,
      nodes: updatedNodes,
      edges: updatedEdges,
    });
  };

  const isSelected = selectedNode?.id === id;

  return (
    <div style={{ position: "relative" }}>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <Paper
        shadow="sm"
        p="md"
        radius="xl"
        withBorder
        onClick={() => {
          const node = selectedFlow?.nodes.find(
            (n: FlowNodeType) => n.id === id
          );
          if (node) {
            setSelectedNode(node);
          }
        }}
        style={{
          minWidth: "200px",
          maxWidth: "300px",
          width: "fit-content",
          cursor: "pointer",
          background: hasEvents
            ? "var(--mantine-color-blue-1)"
            : "var(--mantine-color-white)",
          borderColor: isSelected ? "var(--mantine-color-blue-6)" : undefined,
          borderWidth: isSelected ? "3px" : "1px",
        }}
      >
        <Stack gap="xs" align="center" style={{ width: "100%" }}>
          {isEditing && !tripId ? (
            <TextInput
              value={nodeName}
              onChange={(e) => setNodeName(e.target.value)}
              placeholder="Enter node name"
              required
              onBlur={updateNodeName}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  updateNodeName();
                }
              }}
              style={{ width: "100%" }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <Text
              size="lg"
              fw={700}
              ta="center"
              onDoubleClick={(e) => {
                if (!tripId) {
                  e.stopPropagation();
                  setIsEditing(true);
                }
              }}
              style={{
                cursor: tripId ? "default" : "text",
                wordBreak: "break-word",
              }}
            >
              {nodeName}
            </Text>
          )}
        </Stack>
      </Paper>
    </div>
  );
}
