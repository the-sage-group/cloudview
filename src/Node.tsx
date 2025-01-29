import { NodeProps, Handle, Position } from "@xyflow/react";
import { Paper, Text, Stack, Badge, TextInput } from "@mantine/core";
import { useContext, useState } from "react";
import { FlowNodeType } from "./types";
import { FlowContext } from "./Context";

export function FlowNode(props: NodeProps<FlowNodeType>) {
  const { data: node, id } = props;
  const { activeFlow, setActiveFlow, selectedNode, setSelectedNode } =
    useContext(FlowContext);
  const [nodeName, setNodeName] = useState(
    node.name ? node.name : node.handler?.name
  );
  const [isEditing, setIsEditing] = useState(node.name ? false : true);

  const updateNodeName = () => {
    setIsEditing(false);
    if (!activeFlow) return;
    const updatedNodes = activeFlow.nodes.map((n) => {
      if (n.id === node.id) {
        n.data.name = nodeName;
      }
      return n;
    });
    const updatedEdges = activeFlow.edges.map((e) => {
      if (!e.data?.from || !e.data?.to) return e;
      if (e.source === node.id) {
        e.data.from.name = nodeName;
      }
      if (e.target === node.id) {
        e.data.to.name = nodeName;
      }
      return e;
    });
    setActiveFlow({
      ...activeFlow,
      nodes: updatedNodes,
      edges: updatedEdges,
    });
  };

  const isSelected = selectedNode?.id === id;

  return (
    <div style={{ position: "relative" }}>
      <Handle type="target" position={Position.Top} style={{ left: "50%" }} />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ left: "50%" }}
      />
      <Paper
        shadow="sm"
        p="md"
        radius="xl"
        withBorder
        onClick={() => {
          const node = activeFlow?.nodes.find((n) => n.id === id);
          if (node) {
            setSelectedNode(node);
          }
        }}
        style={{
          minWidth: "200px",
          maxWidth: "300px",
          width: "fit-content",
          cursor: "pointer",
          background: isSelected
            ? "var(--mantine-color-blue-0)"
            : "var(--mantine-color-white)",
          borderColor: isSelected ? "var(--mantine-color-blue-6)" : undefined,
        }}
      >
        <Stack gap="xs" align="center" style={{ width: "100%" }}>
          {isEditing ? (
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
              size="sm"
              fw={600}
              ta="center"
              onDoubleClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              style={{ cursor: "text", wordBreak: "break-word" }}
            >
              {nodeName}
            </Text>
          )}
          <Badge
            variant="dot"
            color="violet"
            size="sm"
            styles={{
              root: {
                maxWidth: "100%",
                whiteSpace: "normal",
                height: "auto",
                padding: "4px 8px",
                textAlign: "center",
              },
            }}
          >
            {`${node.handler?.context}.${node.handler?.name}`}
          </Badge>
        </Stack>
      </Paper>
    </div>
  );
}
