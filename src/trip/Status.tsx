import { useNavigate } from "react-router";
import {
  Stack,
  Group,
  Text,
  Title,
  Button,
  Badge,
  Paper,
  Tooltip,
} from "@mantine/core";
import { FieldDescriptorProto } from "@the-sage-group/awyes-web";
import { IconHistory } from "@tabler/icons-react";

import { useAwyes } from "../Context";
import { Entity } from "../molecules/Entity";
import { Field } from "../molecules/Field";

export function Status() {
  const { selectedTrip, selectedFlow } = useAwyes();
  const navigate = useNavigate();

  return (
    <Paper
      shadow="sm"
      p="xl"
      radius="md"
      withBorder
      style={{
        position: "absolute",
        top: "20px",
        left: "20px",
        zIndex: 5,
        maxWidth: "400px",
        backgroundColor: "var(--mantine-color-body)",
      }}
    >
      <Stack gap="lg">
        <Stack gap="sm">
          <Group justify="space-between" align="center">
            <Title
              order={3}
              style={{
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              {selectedFlow?.context}.{selectedFlow?.name}
            </Title>
            <Button
              variant="subtle"
              size="sm"
              onClick={() => navigate(`/trip/${selectedTrip?.id}/events`)}
            >
              <Tooltip label="Events">
                <IconHistory size={20} />
              </Tooltip>
            </Button>
          </Group>
          {selectedTrip?.entity?.type != null && selectedTrip.entity.name && (
            <Entity
              type={selectedTrip.entity.type}
              name={selectedTrip.entity.name}
            />
          )}
        </Stack>
        <Stack gap="xs">
          <Group gap="xs">
            <Text size="sm" fw={500}>
              Started:
            </Text>
            <Text size="sm" c="dimmed">
              {new Date(Number(selectedTrip?.startedAt))
                .toLocaleString("en-US", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                })
                .replace(/(\d+)\/(\d+)\/(\d+)/, "$3/$1/$2")}
            </Text>
          </Group>
          <Group gap="xs">
            <Text size="sm" fw={500}>
              Completed:
            </Text>
            <Text size="sm" c="dimmed">
              {new Date(Number(selectedTrip?.completedAt))
                .toLocaleString("en-US", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                })
                .replace(/(\d+)\/(\d+)\/(\d+)/, "$3/$1/$2")}
            </Text>
          </Group>
          <Group gap="xs">
            <Text size="sm" fw={500}>
              Duration:
            </Text>
            <Text size="sm" c="dimmed">
              {(
                (Number(selectedTrip?.completedAt) -
                  Number(selectedTrip?.startedAt)) /
                1000
              ).toFixed(1)}
              s
            </Text>
          </Group>
        </Stack>
      </Stack>

      {selectedFlow?.parameter?.length! > 0 && (
        <Stack gap="lg" mt="lg">
          <div>
            <Text size="sm" fw={600} tt="uppercase" c="dimmed" mb={8}>
              Parameters
            </Text>
            <Group gap="xs">
              {selectedFlow?.parameter.map((param, index) => (
                <Field key={index} field={param} />
              ))}
            </Group>
          </div>
        </Stack>
      )}
    </Paper>
  );
}
