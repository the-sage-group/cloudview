import { Paper, Title, Group, Text, Stack } from "@mantine/core";
import { FieldDescriptorProto } from "@the-sage-group/awyes-web";
import { FlowGraphType } from "../types";
import { Field } from "../molecules/Field";

interface SelectedFlowProps {
  selectedFlow: FlowGraphType;
}

export function SelectedFlow({ selectedFlow }: SelectedFlowProps) {
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
            {selectedFlow.context}.{selectedFlow.name}
          </Title>
        </Group>
      </Group>

      {selectedFlow.parameter.length > 0 && (
        <Stack gap="lg">
          <div>
            <Text size="sm" fw={600} c="dimmed" mb={8}>
              Parameters
            </Text>
            <Group gap="xs">
              {selectedFlow.parameter.map(
                (param: FieldDescriptorProto, index: number) => (
                  <Field key={index} field={param} />
                )
              )}
            </Group>
          </div>
        </Stack>
      )}
    </Paper>
  );
}
