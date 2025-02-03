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
  Box,
} from "@mantine/core";
import { Event, FieldDescriptorProto } from "@the-sage-group/awyes-web";
import { SpotlightActionData, spotlight } from "@mantine/spotlight";
import { IconPlus, IconFunction, IconArrowRight } from "@tabler/icons-react";
import { useLocation, useParams, useNavigate } from "react-router";

import Flow from "./Flow";
import Events from "./Events";

import { Search } from "./Search";
import { NewNode } from "./NewNode";
import { NewFlow } from "./NewFlow";
import { useAwyes, FlowContext } from "./Context";
import { FlowGraphType, toFlowGraph, toFlowNode, FlowNodeType } from "./types";

export default function App() {
  const service = useAwyes();
  const navigate = useNavigate();
  const [opened, { toggle }] = useDisclosure();
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [flows, setFlows] = useState<FlowGraphType[]>([]);
  const [actions, setActions] = useState<SpotlightActionData[]>([]);
  const [activeFlow, setActiveFlow] = useState<FlowGraphType | null>(null);
  const [selectedNode, setSelectedNode] = useState<FlowNodeType | null>(null);

  const location = useLocation();
  const { routeName } = useParams();
  const isEventsView = location.pathname.endsWith("/events");

  useEffect(() => {
    async function fetchData() {
      try {
        const [{ response: handlerResponse }, { response: routeResponse }] =
          await Promise.all([service.listHandlers({}), service.listRoutes({})]);
        const flows = routeResponse.routes.map(toFlowGraph);
        setFlows(flows);

        if (routeName) {
          const matchingFlow = flows.find((flow) => flow.name === routeName);
          setActiveFlow(matchingFlow || null);
        } else if (location.pathname === "/") {
          setActiveFlow(null);
        } else if (!activeFlow) {
          setActiveFlow(flows[0]);
        }

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
  }, [routeName, location.pathname]);

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
    navigate(`/route/${name}`);
  };

  return (
    <FlowContext.Provider
      value={{
        activeFlow,
        setActiveFlow,
        selectedNode,
        setSelectedNode,
        events,
        setEvents,
      }}
    >
      <AppShell
        header={{ height: 60 }}
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
          p="xs"
          style={{
            display: "flex",
            alignItems: "center",
            borderBottom: "1px solid var(--mantine-color-gray-2)",
            background: "var(--mantine-color-white)",
            height: "60px",
          }}
        >
          <Group gap="xl" style={{ flex: "0 0 auto", marginRight: "2rem" }}>
            <Burger opened={!opened} onClick={toggle} size="sm" />
            <Title
              order={3}
              style={{ margin: 0, fontWeight: 600, whiteSpace: "nowrap" }}
            >
              CloudView
            </Title>
          </Group>

          <Box
            style={{
              flex: "1 1 auto",
              maxWidth: "800px",
              margin: "0 auto",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Search />
          </Box>

          <Group gap="sm" style={{ flex: "0 0 auto", marginLeft: "2rem" }}>
            <NewNode actions={actions} />
            <Button
              variant="subtle"
              size="sm"
              onClick={openModal}
              leftSection={<IconPlus size={16} />}
            >
              New Flow
            </Button>
            <Button
              variant="light"
              size="sm"
              disabled={!activeFlow || events.length > 0}
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
                  onClick={() => {
                    navigate(`/route/${flow.name}`);
                  }}
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
          {!activeFlow ? (
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
          ) : isEventsView ? (
            <Events />
          ) : (
            <Flow />
          )}
        </AppShell.Main>
      </AppShell>
    </FlowContext.Provider>
  );
}
