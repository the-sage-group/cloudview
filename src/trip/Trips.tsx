import { useState, useEffect } from "react";
import { IconArrowLeft, IconX } from "@tabler/icons-react";
import { useNavigate, useSearchParams } from "react-router";
import { EntityType, Trip } from "@the-sage-group/awyes-web";
import { Title, Stack, Text, Button, ActionIcon } from "@mantine/core";

import { useAwyes } from "../Context";
import { List } from "./List";
import { Error } from "../molecules/Error";

export function Trips() {
  const navigate = useNavigate();
  const { awyes } = useAwyes();
  const [searchParams] = useSearchParams();
  const entityName = searchParams.get("entity");
  const entityType = searchParams.get("type");
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    async function fetchTrips() {
      try {
        const { response } = await awyes.listTrips({
          entity: {
            name: entityName ?? "",
            type: Object.values(EntityType).indexOf(
              entityType?.toUpperCase() ?? ""
            ),
          },
        });
        console.log(response);
        setTrips(response.trips ?? []);
      } catch (error) {
        console.error("Failed to fetch trips:", error);
      }
    }
    fetchTrips();
  }, []);

  console.log(trips);

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
        <Text>Please provide both an entity name and type</Text>
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

  const filteredTrips = trips.filter(
    (trip) =>
      trip.entity?.name === entityName &&
      trip.entity?.type != null &&
      EntityType[trip.entity.type] === entityType?.toUpperCase()
  );

  if (filteredTrips.length === 0) {
    return (
      <Error
        title="No Trips Found"
        message={`No trips have been recorded for ${entityType}:${entityName}`}
        action={
          <Button
            variant="light"
            onClick={() => navigate("/")}
            leftSection={<IconArrowLeft size={16} />}
          >
            Back to Home
          </Button>
        }
      />
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
      </Stack>

      <List trips={filteredTrips} />
    </Stack>
  );
}
