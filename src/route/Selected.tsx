import { useNavigate } from "react-router";
import { Paper, Group, Text, Stack, Button, Tooltip } from "@mantine/core";
import { FieldDescriptorProto } from "@the-sage-group/awyes-web";
import { IconHistory } from "@tabler/icons-react";

import { useAwyes } from "../Context";
import { Identifier, IdentifierType } from "../molecules/Identifier";

export function SelectedFlow() {
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
        <Stack gap="xs">
          <div>
            <Text size="sm" fw={600} tt="uppercase" c="dimmed" mb={8}>
              Route
            </Text>
            <Identifier
              type={IdentifierType.ROUTE}
              data={{
                name: selectedFlow?.name,
                context: selectedFlow?.context,
              }}
            />
          </div>
        </Stack>

        {selectedTrip?.entity?.type != null && selectedTrip.entity.name && (
          <Stack gap="xs">
            <div>
              <Text size="sm" fw={600} tt="uppercase" c="dimmed" mb={8}>
                Entity
              </Text>
              <Identifier
                type={IdentifierType.ENTITY}
                data={selectedTrip.entity}
              />
            </div>
          </Stack>
        )}

        {selectedTrip && (
          <Stack gap="xs">
            <div>
              <Text size="sm" fw={600} tt="uppercase" c="dimmed" mb={8}>
                Trip Details{" "}
                {selectedTrip && (
                  <Button
                    variant="subtle"
                    size="sm"
                    onClick={() => navigate(`/trip/${selectedTrip?.id}/events`)}
                  >
                    <Tooltip label="Events">
                      <IconHistory size={20} />
                    </Tooltip>
                  </Button>
                )}
              </Text>
              <Group gap="xs">
                <Text size="sm" fw={500}>
                  Started:
                </Text>
                <Text size="sm" c="dimmed">
                  {new Date(Number(selectedTrip?.startedAt)).toLocaleString()}
                </Text>
              </Group>
              <Group gap="xs">
                <Text size="sm" fw={500}>
                  Completed:
                </Text>
                <Text size="sm" c="dimmed">
                  {new Date(Number(selectedTrip?.completedAt)).toLocaleString()}
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
            </div>
          </Stack>
        )}
      </Stack>

      {selectedFlow?.parameter.length && selectedFlow?.parameter.length > 0 && (
        <Stack gap="lg" mt="lg">
          <div>
            <Text size="sm" fw={600} tt="uppercase" c="dimmed" mb={8}>
              Parameters
            </Text>
            <Group gap="xs">
              {selectedFlow?.parameter.map(
                (param: FieldDescriptorProto, index: number) => (
                  <Identifier
                    key={index}
                    type={IdentifierType.FIELD}
                    data={{
                      name: param.name,
                      type: param.type,
                      jsonName:
                        param.name &&
                        selectedTrip?.state &&
                        param.name in selectedTrip.state
                          ? new TextDecoder().decode(
                              selectedTrip.state[param.name]
                            )
                          : undefined,
                    }}
                  />
                )
              )}
            </Group>
          </div>
        </Stack>
      )}
    </Paper>
  );
}
