import { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { IconArrowLeft, IconX } from "@tabler/icons-react";
import { Title, Text, Stack, Button, ActionIcon } from "@mantine/core";

import List from "./List";
import { useAwyes } from "../Context";
import { Error } from "../molecules/Error";

export default function Events() {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const { awyes, selectedTripEvents, setSelectedTripEvents } = useAwyes();

  useEffect(() => {
    if (!tripId || selectedTripEvents.length > 0) return;

    // Subscribe to trip updates
    const subscription = awyes.watchTrip({ tripId });

    subscription.responses.onNext((event) => {
      if (!event) return;
      setSelectedTripEvents((prev) => [
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
  }, [tripId, selectedTripEvents.length]);

  console.log(selectedTripEvents);

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
        <Text c="dimmed">Showing {selectedTripEvents.length} events</Text>
      </Stack>

      <List />
    </Stack>
  );
}
