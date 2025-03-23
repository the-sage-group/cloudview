import { useEffect, useState } from "react";
import { Paper, Text, Stack, Group, Code } from "@mantine/core";
import { Label, Handler } from "@the-sage-group/awyes-web";

import { useAwyes } from "../Context";
import { BADGE_COLORS } from "../constants/theme";
import { Identifier, IdentifierType } from "../molecules/Identifier";

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
        maxHeight: "80vh",
        overflowY: "auto",
        marginBottom: "20px",
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
            <Identifier
              type={IdentifierType.HANDLER}
              data={{
                context: node.handler?.split(".")[0] || "",
                name: node.handler?.split(".")[1] || "",
              }}
            />
          </Group>
        </div>

        {handler?.parameters?.length! > 0 && (
          <div>
            <Text size="sm" fw={600} c="dimmed" mb={4}>
              Parameters
            </Text>
            <Stack gap={6}>
              {handler?.parameters.map((param) => (
                <Identifier
                  key={param.name}
                  type={IdentifierType.FIELD}
                  data={{
                    name: param.name,
                    type: param.type,
                  }}
                />
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
              {handler?.returns.map((ret) => (
                <Identifier
                  key={ret.name}
                  type={IdentifierType.FIELD}
                  data={{
                    name: ret.name,
                    type: ret.type,
                  }}
                />
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
              {nodeEvents.map((event) => (
                <Paper
                  key={event.id}
                  withBorder
                  p="md"
                  radius="md"
                  style={{
                    borderLeft: `4px solid ${
                      event.exitLabel === Label[Label.SUCCESS]
                        ? `var(--mantine-color-${BADGE_COLORS.SUCCESS}-6)`
                        : event.exitLabel === Label[Label.FAILURE]
                        ? `var(--mantine-color-${BADGE_COLORS.FAILURE}-6)`
                        : `var(--mantine-color-${BADGE_COLORS.DEFAULT}-6)`
                    }`,
                  }}
                >
                  <Group justify="space-between" mb="md">
                    <Text size="xs" c="dimmed">
                      {new Date(Number(event.timestamp)).toLocaleString()}
                    </Text>
                  </Group>
                  {event.exitMessage && (
                    <Text size="sm" mb="xs" c="dark.3">
                      {event.exitMessage}
                    </Text>
                  )}
                  {Object.keys(event.state).length > 0 && (
                    <Code block>
                      {Object.entries(event.state).map(([key, value]) => {
                        const decodedValue = new TextDecoder().decode(value);
                        let parsedValue = "";
                        try {
                          parsedValue = JSON.parse(decodedValue);
                        } catch {}
                        return (
                          <div key={key}>
                            <strong>{key}:</strong>{" "}
                            {JSON.stringify(parsedValue, null, 2)}
                          </div>
                        );
                      })}
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
