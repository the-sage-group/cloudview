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
import { BADGE_COLORS } from "../constants/theme";

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
              event.exitLabel === "SUCCESS"
                ? `var(--mantine-color-${BADGE_COLORS.SUCCESS}-6)`
                : event.exitLabel === "FAILURE"
                ? `var(--mantine-color-${BADGE_COLORS.FAILURE}-6)`
                : `var(--mantine-color-${BADGE_COLORS.DEFAULT}-6)`
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
                  event.exitLabel === "SUCCESS"
                    ? BADGE_COLORS.SUCCESS
                    : event.exitLabel === "FAILURE"
                    ? BADGE_COLORS.FAILURE
                    : BADGE_COLORS.DEFAULT
                }
              >
                {event.exitLabel || "N/A"}
              </Badge>
            </Group>
            <Text size="sm" c="dimmed">
              {new Date(Number(event.timestamp)).toLocaleString()}
            </Text>
          </Group>

          {event.exitMessage && <Text mb="md">{event.exitMessage}</Text>}

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
