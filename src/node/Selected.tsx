import { useEffect, useState } from "react";
import { Paper, Text, Stack, Badge, Group, Code } from "@mantine/core";
import {
  FieldDescriptorProto_Label,
  FieldDescriptorProto_Type,
  Value,
  Label,
  Handler,
} from "@the-sage-group/awyes-web";
import { useAwyes } from "../Context";

export function SelectedNode() {
  const { awyes, selectedNode, selectedTripEvents } = useAwyes();
  const [handler, setHandler] = useState<Handler | null>(null);

  useEffect(() => {
    async function fetchHandlerDetails() {
      if (!selectedNode) return;
      try {
        console.log(selectedNode.data.handler);
        const { response } = await awyes.getHandler({
          handler: selectedNode.data.handler,
        });
        setHandler(response.handler || null);
      } catch (error) {
        console.error("Failed to fetch handler details:", error);
      }
    }

    fetchHandlerDetails();
  }, [selectedNode]);

  if (!selectedNode) return null;

  const { data: node } = selectedNode;
  const nodeEvents = selectedTripEvents.filter(
    (event) => event.position?.name === node.name
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
            {node.name}
          </Text>
        </div>

        <div>
          <Text size="sm" fw={600} c="dimmed" mb={4}>
            Handler
          </Text>
          <Group gap={8}>
            <Badge variant="dot" color="violet" size="sm">
              {node.handler}
            </Badge>
          </Group>
        </div>

        {handler?.parameters?.length! > 0 && (
          <div>
            <Text size="sm" fw={600} c="dimmed" mb={4}>
              Parameters
            </Text>
            <Stack gap={6}>
              {handler?.parameters.map((param, index) => (
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

        {handler?.returns?.length! > 0 && (
          <div>
            <Text size="sm" fw={600} c="dimmed" mb={4}>
              Returns
            </Text>
            <Stack gap={6}>
              {handler?.returns.map((ret, index) => (
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
                      event.exitLabel === Label[Label.SUCCESS]
                        ? "var(--mantine-color-green-6)"
                        : event.exitLabel === Label[Label.FAILURE]
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
                          event.exitLabel === Label[Label.SUCCESS]
                            ? "green"
                            : event.exitLabel === Label[Label.FAILURE]
                            ? "red"
                            : "blue"
                        }
                      >
                        {event.exitLabel || "N/A"}
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
                  {event.exitMessage && (
                    <Text size="sm" mb="xs" c="dark.3">
                      {event.exitMessage}
                    </Text>
                  )}
                  {Object.keys(event.state).length > 0 && (
                    <Code
                      block
                      style={{ maxHeight: "200px", overflow: "auto" }}
                    >
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
                  )}
                </Paper>
              ))}
            </Stack>
          </div>
        )}
      </Stack>
    </Paper>
  );
}
