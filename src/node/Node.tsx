import { Paper, Text, Stack } from "@mantine/core";
import { NodeProps, Handle, Position } from "@xyflow/react";

import { useAwyes } from "../Context";
import { FlowNodeType } from "../types";

export function FlowNode(props: NodeProps<FlowNodeType>) {
  const { data: node, id } = props;
  const { selectedFlow, selectedNode, setSelectedNode, selectedTripEvents } =
    useAwyes();

  // Check if there are events for this node
  const nodeEvents = selectedTripEvents.filter(
    (event) => event.position?.name === (node.name || node.handler)
  );
  const hasEvents = nodeEvents.length > 0;

  const isSelected = selectedNode?.id === id;

  return (
    <div style={{ position: "relative" }}>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <Paper
        shadow="sm"
        p="md"
        radius="xl"
        withBorder
        onClick={() => {
          const node = selectedFlow?.nodes.find((n) => n.id === id);
          if (!node) return;
          setSelectedNode(node);
        }}
        style={{
          minWidth: "200px",
          maxWidth: "300px",
          width: "fit-content",
          cursor: "pointer",
          background: hasEvents
            ? "var(--mantine-color-blue-1)"
            : "var(--mantine-color-white)",
          borderWidth: "2px",
          borderColor: isSelected
            ? "var(--mantine-color-blue-6)"
            : "var(--mantine-color-gray-3)",
        }}
      >
        <Stack gap="xs" align="center" style={{ width: "100%" }}>
          <Text
            size="lg"
            fw={700}
            ta="center"
            style={{
              cursor: "pointer",
              wordBreak: "break-word",
            }}
          >
            {node.name}
          </Text>
        </Stack>
      </Paper>
    </div>
  );
}
