import { v4 as uuidv4 } from "uuid";
import { useEffect, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import {
  AppShell,
  Button,
  Burger,
  NavLink,
  ScrollArea,
  Group,
  Title,
  Text,
} from "@mantine/core";
import { FieldDescriptorProto } from "@the-sage-group/awyes-web";
import { SpotlightActionData, spotlight } from "@mantine/spotlight";
import { IconPlus, IconFunction, IconArrowRight } from "@tabler/icons-react";

import Flow from "./Flow";
import { Search } from "./Search";
import { NewFlow } from "./NewFlow";
import { useAwyes, FlowContext } from "./Context";
import { FlowGraphType, toFlowGraph, toFlowNode, FlowNodeType } from "./types";

export default function App() {
  const service = useAwyes();
  const [opened, { toggle }] = useDisclosure();
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [flows, setFlows] = useState<FlowGraphType[]>([]);
  const [actions, setActions] = useState<SpotlightActionData[]>([]);
  const [activeFlow, setActiveFlow] = useState<FlowGraphType | null>(null);
  const [selectedNode, setSelectedNode] = useState<FlowNodeType | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [{ response: handlerResponse }, { response: routeResponse }] =
          await Promise.all([service.listHandlers({}), service.listRoutes({})]);
        const flows = routeResponse.routes.map(toFlowGraph);
        setFlows(flows);
        setActiveFlow(flows[0]);
        setActions(
          handlerResponse.handlers.map((handler) => ({
            id: uuidv4(),
            label: `${handler.context}.${handler.name}`,
            description: handler.description,
            onClick: () => {
              setActiveFlow((currentFlow: FlowGraphType | null) => {
                if (currentFlow) {
                  return {
                    ...currentFlow,
                    nodes: [...currentFlow.nodes, toFlowNode({ handler })],
                  };
                }
                return currentFlow;
              });
            },
            leftSection: <IconFunction />,
          }))
        );
      } catch (error) {
        console.error("Failed to fetch nodes and flows:", error);
      }
    }
    fetchData();
  }, []);

  const handleCreateFlow = (
    name: string,
    parameters: FieldDescriptorProto[]
  ) => {
    const newFlow = {
      name,
      version: 1,
      context: "",
      description: "",
      nodes: [],
      edges: [],
      parameters,
    };
    setFlows([...flows, newFlow]);
    setActiveFlow(newFlow);
  };

  return (
    <FlowContext.Provider value={{ activeFlow, setActiveFlow, selectedNode, setSelectedNode }}>
      <AppShell
        header={{ height: 50 }}
        padding="md"
        navbar={{
          width: 300,
          breakpoint: "sm",
          collapsed: { desktop: opened },
        }}
        styles={{
          main: {
            height: "100vh",
          },
        }}
      >
        <AppShell.Header
          p="md"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--mantine-color-gray-2)",
            background: "var(--mantine-color-white)",
          }}
        >
          <Group gap="lg">
            <Burger opened={!opened} onClick={toggle} size="sm" />
            <Title order={3} style={{ margin: 0, fontWeight: 600 }}>
              CloudView
            </Title>
          </Group>
          <Group gap="md">
            <Search actions={actions} />
            <Button
              variant="outline"
              onClick={openModal}
              leftSection={<IconPlus size={16} />}
            >
              New Flow
            </Button>
            <Button
              disabled={!activeFlow}
              onClick={() => spotlight.open()}
              leftSection={<IconPlus size={16} />}
            >
              Add Node
            </Button>
          </Group>
        </AppShell.Header>

        <NewFlow
          opened={modalOpened}
          onClose={closeModal}
          onCreateFlow={handleCreateFlow}
        />

        <AppShell.Navbar p="md">
          <ScrollArea>
            {flows.length === 0 ? (
              <div
                style={{
                  padding: "2rem",
                  textAlign: "center",
                  color: "var(--mantine-color-gray-6)",
                }}
              >
                No flows yet!
              </div>
            ) : (
              flows.map((flow, index) => (
                <NavLink
                  key={index}
                  label={flow.name}
                  rightSection={<IconArrowRight size={16} />}
                  active={flow === activeFlow}
                  onClick={() => setActiveFlow(flow)}
                  styles={{
                    root: {
                      borderRadius: "var(--mantine-radius-sm)",
                      marginBottom: "0.5rem",
                    },
                  }}
                />
              ))
            )}
          </ScrollArea>
        </AppShell.Navbar>

        <AppShell.Main>
          {activeFlow ? (
            <Flow />
          ) : (
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
              <Title order={2}>No Flow Selected</Title>
              <Text>
                Select an existing flow or create a new one to get started
              </Text>
              <Button
                variant="light"
                onClick={openModal}
                leftSection={<IconPlus size={16} />}
              >
                Create New Flow
              </Button>
            </div>
          )}
        </AppShell.Main>
      </AppShell>
    </FlowContext.Provider>
  );
}
