import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  IconArrowLeft,
  IconX,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import {
  Title,
  Text,
  Stack,
  Button,
  ActionIcon,
  Table,
  Badge,
  Code,
  Paper,
} from "@mantine/core";

import { useAwyes } from "../Context";
import { Error } from "../molecules/Error";
import { BADGE_COLORS } from "../constants/theme";
import { Identifier } from "../molecules/Identifier";
import { IdentifierType } from "../molecules/Identifier";

export default function Events() {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const { awyes, selectedTripEvents, setSelectedTripEvents } = useAwyes();
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  useEffect(() => {
    if (!tripId || selectedTripEvents.length > 0) return;

    // Subscribe to trip updates
    const subscription = awyes.watchTrip({ trip: tripId });

    subscription.responses.onNext((event) => {
      if (!event) return;

      setSelectedTripEvents((prev) => [
        ...prev.filter((e) => e.id !== event.id && e.trip === tripId),
        event,
      ]);
    });

    subscription.responses.onError((error) => {
      console.error("Trip subscription error:", error);
    });

    subscription.responses.onComplete(() => {
      console.log("Trip subscription completed");
    });
  }, [tripId, selectedTripEvents]);

  // Toggle expanded row
  const toggleRow = (index: number) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

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

  if (selectedTripEvents.length === 0) {
    return (
      <Stack gap="xl" style={{ position: "relative", height: "100%" }}>
        <ActionIcon
          variant="subtle"
          size="lg"
          onClick={() => navigate(`/trip/${tripId}`)}
          style={{ position: "absolute", top: 0, right: 0, zIndex: 1 }}
        >
          <IconX size={22} />
        </ActionIcon>

        <div style={{ flex: 1 }}>
          <Error
            title="No Events"
            message="There are no events for this trip yet."
          />
        </div>
      </Stack>
    );
  }

  // Sort events by timestamp (newest first)
  const sortedEvents = [...selectedTripEvents].sort(
    (a, b) => Number(a.timestamp) - Number(b.timestamp)
  );

  return (
    <Stack gap="xl" style={{ position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Text c="dimmed" size="xl">
          Viewing events for
        </Text>
        <Identifier type={IdentifierType.TRIP} data={{ id: tripId }} />
      </div>

      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Position</Table.Th>
            <Table.Th>Exit Status</Table.Th>
            <Table.Th>Exit Message</Table.Th>
            <Table.Th>Timestamp</Table.Th>
            <Table.Th>State Variables</Table.Th>
            <Table.Th style={{ width: "40px" }}></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {sortedEvents.map((event, index) => (
            <React.Fragment key={event.id}>
              <Table.Tr
                onClick={() => toggleRow(index)}
                style={{
                  cursor:
                    Object.keys(event.state).length > 0 ? "pointer" : "default",
                  backgroundColor:
                    expandedRow === index
                      ? "var(--mantine-color-blue-0)"
                      : undefined,
                }}
              >
                <Table.Td style={{ fontWeight: 500 }}>
                  <Identifier
                    type={IdentifierType.POSITION}
                    data={{ name: event.position?.name }}
                  />
                </Table.Td>
                <Table.Td>
                  <Badge
                    variant="filled"
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
                </Table.Td>
                <Table.Td
                  style={{
                    maxWidth: "300px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {event.exitMessage || "-"}
                </Table.Td>
                <Table.Td>
                  {new Date(Number(event.timestamp)).toLocaleString()}
                </Table.Td>
                <Table.Td>
                  {Object.keys(event.state).length > 0
                    ? `${Object.keys(event.state).length} variables`
                    : ""}
                </Table.Td>
                <Table.Td style={{ textAlign: "center" }}>
                  {Object.keys(event.state).length > 0 && (
                    <ActionIcon variant="subtle" color="blue">
                      {expandedRow === index ? (
                        <IconChevronUp size={16} />
                      ) : (
                        <IconChevronDown size={16} />
                      )}
                    </ActionIcon>
                  )}
                </Table.Td>
              </Table.Tr>
              {expandedRow === index && Object.keys(event.state).length > 0 && (
                <Table.Tr key={`${event.id}-${index}`}>
                  <Table.Td colSpan={6} style={{ padding: 0 }}>
                    <Paper
                      p="md"
                      withBorder
                      radius={0}
                      style={{ margin: "0 -1px" }}
                    >
                      <Table>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th style={{ width: "200px" }}>
                              Variable
                            </Table.Th>
                            <Table.Th>Value</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {Object.entries(event.state).map(([key, value]) => (
                            <Table.Tr key={`${event.id}-${key}`}>
                              <Table.Td>
                                <Text fw={500}>{key}</Text>
                              </Table.Td>
                              <Table.Td>
                                <Code block>
                                  {new TextDecoder().decode(value)}
                                </Code>
                              </Table.Td>
                            </Table.Tr>
                          ))}
                        </Table.Tbody>
                      </Table>
                    </Paper>
                  </Table.Td>
                </Table.Tr>
              )}
            </React.Fragment>
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  );
}
