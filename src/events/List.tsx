import {
  Stack,
  Paper,
  Title,
  Group,
  Text,
  Badge,
  Code,
  Table,
} from "@mantine/core";
import { Value } from "@the-sage-group/awyes-web";

import { useAwyes } from "../Context";

export default function List() {
  const { selectedTripEvents } = useAwyes();
  return (
    <Stack gap="md">
      {selectedTripEvents.map((event, index) => (
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
              <Title order={4}>
                {event.position?.name || "Unknown Position"}
              </Title>
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
            <Text size="sm" c="dimmed">
              {new Date(Number(event.timestamp)).toLocaleString()}
            </Text>
          </Group>

          {event.message && (
            <Text mb="md">{event.message}</Text>
          )}

          {Object.keys(event.state).length > 0 && (
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Variable</Table.Th>
                  <Table.Th>Value</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {Object.entries(event.state).map(([key, value]) => (
                  <Table.Tr key={key}>
                    <Table.Td style={{ width: "200px" }}>
                      <Text fw={500}>{key}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Code block>
                        {JSON.stringify(Value.toJson(value as Value))}
                      </Code>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Paper>
      ))}
    </Stack>
  );
}
