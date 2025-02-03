import { NodeProps, Handle, Position } from "@xyflow/react";
import {
  Paper,
  Text,
  Stack,
  Badge,
  TextInput,
  Group,
  Code,
} from "@mantine/core";
import {
  FieldDescriptorProto_Label,
  FieldDescriptorProto_Type,
  Value,
} from "@the-sage-group/awyes-web";
import { useContext, useState } from "react";
import { useParams } from "react-router";
import { FlowNodeType } from "./types";
import { FlowContext } from "./Context";

export function SelectedNode() {
  const { selectedNode, selectedEvents } = useContext(FlowContext);
  if (!selectedNode) return null;

  // Filter events for the selected node
  const nodeEvents = selectedEvents.filter(
    (event) => event.position?.name === selectedNode.data.name
  );

  return (
    <Paper
      shadow="sm"
      p="md"
      radius="md"
      withBorder
      style={{
        position: "absolute",
        top: "20px",
        right: "20px",
        zIndex: 5,
        width: "300px",
      }}
    >
      <Stack gap="md">
        <div>
          <Text size="sm" fw={600} c="dimmed" mb={4}>
            Name
          </Text>
          <Text size="lg" fw={700}>
            {selectedNode.data.name || selectedNode.data.handler?.name}
          </Text>
        </div>

        <div>
          <Text size="sm" fw={600} c="dimmed" mb={4}>
            Handler
          </Text>
          <Group gap={8}>
            <Badge variant="dot" color="violet" size="sm">
              {`${selectedNode.data.handler?.context}.${selectedNode.data.handler?.name}`}
            </Badge>
          </Group>
        </div>

        {selectedNode.data.handler?.parameters?.length! > 0 && (
          <div>
            <Text size="sm" fw={600} c="dimmed" mb={4}>
              Parameters
            </Text>
            <Stack gap={6}>
              {selectedNode.data.handler?.parameters.map((param, index) => (
                <Group key={index} gap={8}>
                  <Text size="sm" fw={500}>
                    {param.name}
                  </Text>
                  <Badge variant="dot" color="blue" size="sm">
                    {`${
                      param.label ? FieldDescriptorProto_Label[param.label] : ""
                    } ${FieldDescriptorProto_Type[param.type!]}`}
                  </Badge>
                </Group>
              ))}
            </Stack>
          </div>
        )}

        {selectedNode.data.handler?.returns?.length! > 0 && (
          <div>
            <Text size="sm" fw={600} c="dimmed" mb={4}>
              Returns
            </Text>
            <Stack gap={6}>
              {selectedNode.data.handler?.returns.map((ret, index) => (
                <Group key={index} gap={8}>
                  <Text size="sm" fw={500}>
                    {ret.name}
                  </Text>
                  <Badge variant="dot" color="green" size="sm">
                    {`${
                      ret.label ? FieldDescriptorProto_Label[ret.label] : ""
                    } ${FieldDescriptorProto_Type[ret.type!]}`}
                  </Badge>
                </Group>
              ))}
            </Stack>
          </div>
        )}

        {nodeEvents.length > 0 && (
          <div>
            <Text size="sm" fw={600} c="dimmed" mb={4}>
              Events
            </Text>
            <Stack gap="xs">
              {nodeEvents.map((event, index) => (
                <Paper
                  key={index}
                  withBorder
                  p="md"
                  radius="md"
                  style={{
                    borderLeft: `4px solid ${
                      event.label === "SUCCESS"
                        ? "var(--mantine-color-green-6)"
                        : event.label === "FAILURE"
                        ? "var(--mantine-color-red-6)"
                        : "var(--mantine-color-blue-6)"
                    }`,
                  }}
                >
                  <Group justify="space-between" mb="md">
                    <Group gap="xs">
                      <Badge
                        variant="light"
                        color={
                          event.label === "SUCCESS"
                            ? "green"
                            : event.label === "FAILURE"
                            ? "red"
                            : "blue"
                        }
                      >
                        {event.label || "N/A"}
                      </Badge>
                    </Group>
                    <Text size="xs" c="dimmed">
                      {event.timestamp
                        ? new Date(Number(event.timestamp)).toLocaleString(
                            "en-US",
                            {
                              dateStyle: "medium",
                              timeStyle: "medium",
                            }
                          )
                        : ""}
                    </Text>
                  </Group>
                  {event.message && (
                    <Text size="sm" mb="xs" c="dark.3">
                      {event.message}
                    </Text>
                  )}
                  <Code block style={{ maxHeight: "200px", overflow: "auto" }}>
                    {JSON.stringify(
                      Object.fromEntries(
                        Object.entries(event.state).map(([key, value]) => [
                          key,
                          Value.toJson(value as Value),
                        ])
                      ),
                      null,
                      2
                    )}
                  </Code>
                </Paper>
              ))}
            </Stack>
          </div>
        )}
      </Stack>
    </Paper>
  );
}

export function FlowNode(props: NodeProps<FlowNodeType>) {
  const { data: node, id } = props;
  const {
    selectedFlow,
    setSelectedFlow,
    selectedNode,
    setSelectedNode,
    selectedEvents,
  } = useContext(FlowContext);
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
    const updatedNodes = selectedFlow.nodes.map((n) => {
      if (n.id === node.id) {
        n.data.name = nodeName;
      }
      return n;
    });
    const updatedEdges = selectedFlow.edges.map((e) => {
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
          const node = selectedFlow?.nodes.find((n) => n.id === id);
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
