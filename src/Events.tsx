import { useContext, useEffect } from "react";
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
  Loader,
  Badge,
  Code,
} from "@mantine/core";
import { IconArrowLeft, IconX } from "@tabler/icons-react";
import { Value } from "@the-sage-group/awyes-web";

import { FlowContext } from "./Context";
import { useAwyes } from "./Context";

export default function Events() {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const client = useAwyes();
  const { selectedEvents, setSelectedEvents } = useContext(FlowContext);

  useEffect(() => {
    if (!tripId || selectedEvents.length > 0) return;

    // Subscribe to trip updates
    const subscription = client.watchTrip({ tripId });

    subscription.responses.onNext((event) => {
      if (!event) return;
      setSelectedEvents((prev) => [
        ...prev.filter((e) => e.timestamp !== event.timestamp),
        event,
      ]);
    });

    subscription.responses.onError((error) => {
      console.error("Trip subscription error:", error);
    });

    subscription.responses.onComplete(() => {
      console.log("Trip subscription completed");
    });
  }, [tripId, selectedEvents.length]);

  if (!tripId) {
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
        <Title order={2}>No Trip Selected</Title>
        <Text>Please select a trip to view its events.</Text>
        <Button
          variant="light"
          onClick={() => navigate("/")}
          leftSection={<IconArrowLeft size={16} />}
        >
          Back to Home
        </Button>
      </div>
    );
  }

  if (selectedEvents.length === 0) {
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
        <Loader size="md" />
        <Text>Loading events...</Text>
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
    <Stack gap="xl" style={{ position: "relative" }}>
      <ActionIcon
        variant="subtle"
        size="lg"
        onClick={() => navigate(`/trip/${tripId}`)}
        style={{ position: "absolute", top: 0, right: 0 }}
      >
        <IconX size={22} />
      </ActionIcon>

      <Stack gap={0}>
        <Title order={2}>Trip Events</Title>
        <Text c="dimmed">Showing {selectedEvents.length} events</Text>
      </Stack>

      <Stack gap="md">
        {selectedEvents.map((event, index) => (
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
          </Paper>
        ))}
      </Stack>
    </Stack>
  );
}
