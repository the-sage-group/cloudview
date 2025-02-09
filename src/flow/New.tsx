import { useState } from "react";
import {
  Modal,
  TextInput,
  Stack,
  Group,
  ActionIcon,
  Paper,
  Title,
  Text,
  Button,
} from "@mantine/core";
import { IconTrash, IconPlus } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useNavigate } from "react-router";
import { useAwyes } from "../Context";
import { toFlowGraph } from "../types";
import type { Route } from "@the-sage-group/awyes-web";

export function NewFlow() {
  const navigate = useNavigate();
  const { awyes, setFlows, setSelectedFlow, flows } = useAwyes();
  const [modalOpened, modal] = useDisclosure(false);
  const [newFlow, setNewFlow] = useState<Route>({
    name: "",
    context: "",
    parameters: [],
    positions: [],
    transitions: [],
  });

  const handleCreateFlow = async () => {
    try {
      // Register the new flow
      await awyes.registerRoute({ route: newFlow });

      // Convert to FlowGraph and update local state
      const flowGraph = toFlowGraph(newFlow);
      const updatedFlows = [...flows, flowGraph];
      setFlows(updatedFlows);
      setSelectedFlow(flowGraph);

      // Reset form
      setNewFlow({
        name: "",
        context: "",
        parameters: [],
        positions: [],
        transitions: [],
      });
      modal.close();

      // Navigate to the new flow
      navigate(`/route/${flowGraph.name}`);
    } catch (error) {
      console.error("Failed to create flow:", error);
    }
  };

  const addParameter = () => {
    setNewFlow({
      ...newFlow,
      parameters: [...newFlow.parameters, { name: "" }],
    });
  };

  const removeParameter = (index: number) => {
    setNewFlow({
      ...newFlow,
      parameters: newFlow.parameters.filter((_, i) => i !== index),
    });
  };

  const updateParameter = (index: number, value: string) => {
    setNewFlow({
      ...newFlow,
      parameters: newFlow.parameters.map((param, i) =>
        i === index ? { name: value } : param
      ),
    });
  };

  return (
    <>
      <Button
        variant="light"
        size="sm"
        onClick={modal.open}
        leftSection={<IconPlus size={16} />}
      >
        New Flow
      </Button>

      <Modal
        opened={modalOpened}
        onClose={modal.close}
        size="lg"
        padding="xl"
        radius="md"
        title={<Title order={3}>Create New Flow</Title>}
      >
        <Stack gap="xl">
          <Stack gap="xs">
            <Text size="sm" fw={500}>
              Context
            </Text>
            <TextInput
              placeholder="Enter context"
              value={newFlow.context}
              onChange={(e) =>
                setNewFlow({ ...newFlow, context: e.currentTarget.value })
              }
              size="md"
              required
            />
          </Stack>

          <Stack gap="xs">
            <Text size="sm" fw={500}>
              Flow Name
            </Text>
            <TextInput
              placeholder="Enter flow name"
              value={newFlow.name}
              onChange={(e) =>
                setNewFlow({ ...newFlow, name: e.currentTarget.value })
              }
              size="md"
              required
            />
          </Stack>

          <Stack gap="xs">
            <Group justify="space-between">
              <Text fw={500} size="sm">
                Parameters
              </Text>
              <Button
                variant="light"
                size="sm"
                leftSection={<IconPlus size={16} />}
                onClick={addParameter}
              >
                Add Parameter
              </Button>
            </Group>

            {newFlow.parameters.map((param, index) => (
              <Paper key={index} p="sm" withBorder>
                <Group gap="sm">
                  <TextInput
                    placeholder="Parameter name"
                    value={param.name}
                    onChange={(e) =>
                      updateParameter(index, e.currentTarget.value)
                    }
                    style={{ flex: 1 }}
                  />
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    onClick={() => removeParameter(index)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Paper>
            ))}
          </Stack>

          <Group justify="flex-end">
            <Button variant="light" onClick={modal.close}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateFlow}
              disabled={!newFlow.name || !newFlow.context}
            >
              Create Flow
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
