import { useContext } from "react";
import {
  Paper,
  Title,
  Stack,
  Text,
  Badge,
  Group,
  Button,
  ActionIcon,
  UnstyledButton,
} from "@mantine/core";
import { useNavigate, useSearchParams } from "react-router";
import { IconArrowLeft, IconX } from "@tabler/icons-react";
import { SearchContext } from "./Context";
import { Status, EntityType } from "@the-sage-group/awyes-web";

export function Trips() {
  const navigate = useNavigate();
  const { trips } = useContext(SearchContext);
  const [searchParams] = useSearchParams();
  const entityParam = searchParams.get("entity");
  const [entityType, entityName] = entityParam?.split(":") ?? [];

  const filteredTrips = trips.filter(
    (trip) =>
      trip.entity?.name === entityName &&
      trip.entity?.type != null &&
      EntityType[trip.entity.type] === entityType?.toUpperCase()
  );

  if (!entityType || !entityName) {
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
        <Title order={2}>Invalid Entity</Title>
        <Text>Please provide a valid entity type and name</Text>
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

  return (
    <Stack gap="xl" style={{ position: "relative" }}>
      <ActionIcon
        variant="subtle"
        size="lg"
        onClick={() => navigate("/")}
        style={{ position: "absolute", top: 0, right: 0 }}
      >
        <IconX size={22} />
      </ActionIcon>

      <Stack gap={0}>
        <Title order={2}>Entity Trips</Title>
        <Text c="dimmed">
          {entityType}:{entityName} ({filteredTrips.length} trips)
        </Text>
      </Stack>

      <Stack gap="md">
        {filteredTrips.length === 0 ? (
          <div
            style={{
              height: "60vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem",
              color: "var(--mantine-color-gray-6)",
            }}
          >
            <Title order={2}>No Trips Found</Title>
            <Text ta="center">
              No trips have been recorded for {entityType}:{entityName}
            </Text>
            <Button
              variant="light"
              onClick={() => navigate("/")}
              leftSection={<IconArrowLeft size={16} />}
            >
              Back to Home
            </Button>
          </div>
        ) : (
          filteredTrips.map((trip) => (
            <Paper
              key={trip.id}
              p="md"
              withBorder
              onClick={() => navigate(`/trip/${trip.id}`)}
              style={{
                width: "100%",
                textAlign: "left",
                background: "white",
                border: "1px solid var(--mantine-color-gray-3)",
                cursor: "pointer",
                transition: "background-color 0.2s, border-color 0.2s",
                ":hover": {
                  backgroundColor: "var(--mantine-color-gray-0)",
                  borderColor: "var(--mantine-color-blue-3)",
                },
              }}
            >
              <Stack gap="xs">
                <Group justify="space-between" align="flex-start">
                  <Text fw={500}>Trip ID: {trip.id}</Text>
                  <Badge
                    color={
                      trip.completedAt
                        ? "green"
                        : trip.status === Status.ERROR
                        ? "red"
                        : "blue"
                    }
                  >
                    {
                      Status[
                        trip.completedAt ? Status.COMPLETED : Status.EXECUTING
                      ]
                    }
                  </Badge>
                </Group>
                {trip.route && (
                  <Group gap="xs">
                    <Text size="sm" c="dimmed">
                      Route:
                    </Text>
                    <Badge
                      component="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        trip.route?.name &&
                          navigate(`/route/${trip.route.name}`);
                      }}
                      variant="light"
                      color="blue"
                      size="sm"
                      radius="sm"
                      style={{
                        cursor: "pointer",
                        border: "none",
                        transition: "all 0.2s",
                        ":hover": {
                          transform: "translateY(-1px)",
                          filter: "brightness(1.1)",
                        },
                      }}
                    >
                      {trip.route.name}
                    </Badge>
                  </Group>
                )}
                <Group gap="xs">
                  {trip.startedAt && (
                    <Text size="sm" c="dimmed">
                      Started:{" "}
                      {new Date(Number(trip.startedAt)).toLocaleString()}
                    </Text>
                  )}
                  {trip.completedAt && (
                    <>
                      <Text size="sm" c="dimmed">
                        ·
                      </Text>
                      <Text size="sm" c="dimmed">
                        Completed:{" "}
                        {new Date(Number(trip.completedAt)).toLocaleString()}
                      </Text>
                    </>
                  )}
                </Group>
              </Stack>
            </Paper>
          ))
        )}
      </Stack>
    </Stack>
  );
}
