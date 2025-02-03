import { useContext } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Paper,
  Title,
  Group,
  Text,
  Stack,
  Table,
  Button,
  ActionIcon,
} from "@mantine/core";
import { IconArrowLeft, IconX } from "@tabler/icons-react";
import { Value } from "@the-sage-group/awyes-web";

import { FlowContext } from "./Context";

export default function Events() {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const { events } = useContext(FlowContext);

  if (!tripId || events.length === 0) {
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
        <Title order={2}>No Events</Title>
        <Text>No events found for this trip.</Text>
        <Button
          variant="light"
          onClick={() => navigate(`/trip/${tripId}`)}
          leftSection={<IconArrowLeft size={16} />}
        >
          Back to Flow
        </Button>
      </div>
    );
  }

  return (
    <Stack gap="xl" style={{ position: 'relative' }}>
      <ActionIcon
        variant="subtle"
        size="lg"
        onClick={() => navigate(`/trip/${tripId}`)}
        style={{ position: 'absolute', top: 0, right: 0 }}
      >
        <IconX size={22} />
      </ActionIcon>

      <Stack gap={0}>
        <Title order={2}>Trip Events</Title>
        <Text c="dimmed">Showing {events.length} events</Text>
      </Stack>

      <Stack gap="md">
        {events.map((event, index) => (
          <Paper key={index} withBorder p="md" radius="md">
            <Group justify="space-between" mb="md">
              <Title order={4}>Event {index + 1}</Title>
              <Text size="sm" c="dimmed">
                {new Date(Number(event.timestamp)).toLocaleString()}
              </Text>
            </Group>
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
                    <Table.Td>
                      <Text fw={500}>{key}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text style={{ fontFamily: "monospace" }}>
                        {JSON.stringify(Value.toJson(value as Value), null, 2)}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        ))}
      </Stack>
    </Stack>
  );
} 
