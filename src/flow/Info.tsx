import { Paper, Title, Group, Badge, Text, Stack } from "@mantine/core";
import { FieldDescriptorProto } from "@the-sage-group/awyes-web";
import { FlowGraphType } from "../types";

interface InfoProps {
  selectedFlow: FlowGraphType;
}

export function Info({ selectedFlow }: InfoProps) {
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
      <Group
        justify="space-between"
        mb={selectedFlow.parameter.length > 0 ? "lg" : 0}
      >
        <Group gap="xs">
          <Title order={4} style={{ margin: 0 }}>
            {selectedFlow.name}
          </Title>
        </Group>
      </Group>

      {selectedFlow.parameter.length > 0 && (
        <Stack gap="lg">
          <div>
            <Text size="sm" fw={600} tt="uppercase" c="dimmed" mb={8}>
              Parameters
            </Text>
            <Group gap="xs">
              {selectedFlow.parameter.map(
                (param: FieldDescriptorProto, index: number) => (
                  <Badge
                    key={index}
                    size="md"
                    variant="light"
                    radius="sm"
                    color="blue"
                  >
                    {param.name}
                  </Badge>
                )
              )}
            </Group>
          </div>
        </Stack>
      )}
    </Paper>
  );
}
