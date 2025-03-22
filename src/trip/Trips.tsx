import { useState, useEffect } from "react";
import { IconArrowLeft, IconX } from "@tabler/icons-react";
import { useNavigate, useSearchParams } from "react-router";
import { EntityType, Trip } from "@the-sage-group/awyes-web";
import { Title, Stack, Text, Button, ActionIcon, Table } from "@mantine/core";

import { useAwyes } from "../Context";
import { Error } from "../molecules/Error";
import { Identifier, IdentifierType } from "../molecules/Identifier";

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
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Text c="dimmed" size="xl">
          Viewing trips for
        </Text>
        <Identifier
          type={IdentifierType.ENTITY}
          data={{
            name: entityName,
            type: EntityType[entityType as keyof typeof EntityType],
          }}
        />
      </div>
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Entity</Table.Th>
            <Table.Th>Route</Table.Th>
            <Table.Th>Trip ID</Table.Th>
            <Table.Th>Started At</Table.Th>
            <Table.Th>Completed At</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {filteredTrips.map((trip) => (
            <Table.Tr
              key={trip.id}
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                if (
                  e.target === e.currentTarget ||
                  (e.target as HTMLElement).tagName === "TD" ||
                  (e.target as HTMLElement).closest("td") === e.target
                ) {
                  navigate(`/trip/${trip.id}`);
                }
              }}
            >
              <Table.Td>
                {trip.entity?.type != null && trip.entity.name && (
                  <Identifier type={IdentifierType.ENTITY} data={trip.entity} />
                )}
              </Table.Td>
              <Table.Td>
                {trip.route && (
                  <Identifier
                    type={IdentifierType.ROUTE}
                    data={{
                      context: trip.route.split(".")[0],
                      name: trip.route.split(".")[1],
                    }}
                  />
                )}
              </Table.Td>
              <Table.Td>
                {trip.id && (
                  <Identifier type={IdentifierType.TRIP} data={trip} />
                )}
              </Table.Td>
              <Table.Td>
                {trip.startedAt &&
                  new Date(Number(trip.startedAt)).toLocaleString()}
              </Table.Td>
              <Table.Td>
                {trip.completedAt &&
                  new Date(Number(trip.completedAt)).toLocaleString()}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  );
}
