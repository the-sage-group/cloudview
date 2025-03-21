import { useNavigate } from "react-router";
import { Table, Badge } from "@mantine/core";
import { Trip } from "@the-sage-group/awyes-web";

import { Entity } from "../molecules/Entity";
import { BADGE_COLORS } from "../constants/theme";

interface ListProps {
  trips: Trip[];
}

export function List({ trips }: ListProps) {
  const navigate = useNavigate();

  return (
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
        {trips.map((trip) => (
          <Table.Tr
            key={trip.id}
            style={{ cursor: "pointer" }}
            onClick={() => navigate(`/trip/${trip.id}`)}
          >
            <Table.Td>
              {trip.entity?.type != null && trip.entity.name && (
                <Entity type={trip.entity.type} name={trip.entity.name} />
              )}
            </Table.Td>
            <Table.Td>
              {trip.route && (
                <Badge
                  component="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    trip.route && navigate(`/route/${trip.route}`);
                  }}
                  variant="light"
                  color="blue"
                  size="sm"
                  radius="sm"
                  style={{
                    cursor: "pointer",
                    border: "none",
                    transition: "all 0.2s",
                  }}
                >
                  {trip.route}
                </Badge>
              )}
            </Table.Td>
            <Table.Td>
              {trip.id && (
                <Badge
                  variant="dot"
                  color={trip.completedAt ? BADGE_COLORS.TRIP_ID.COMPLETED : BADGE_COLORS.TRIP_ID.IN_PROGRESS}
                  size="md"
                  title={trip.id}
                  style={{
                    cursor: "pointer",
                    fontFamily: "monospace",
                  }}
                >
                  {trip.id.split("-")[0]}
                </Badge>
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
  );
}
