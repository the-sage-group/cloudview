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
import {
  Event,
  FieldDescriptorProto,
  Route,
  Position,
  Trip,
  Handler,
} from "@the-sage-group/awyes-web";
import { SpotlightActionData, spotlight } from "@mantine/spotlight";
import {
  IconPlus,
  IconFunction,
  IconArrowRight,
  IconSearch,
} from "@tabler/icons-react";
import { useLocation, useParams, useNavigate } from "react-router";

import Flow from "./Flow";
import Events from "./Events";

import { Search } from "./Search";
import { NewNode } from "./NewNode";
import { NewFlow } from "./NewFlow";
import { useAwyes, FlowContext, SearchContext } from "./Context";
import { FlowGraphType, toFlowGraph, toFlowNode, FlowNodeType } from "./types";

export default function App() {
  // Awyes
  const service = useAwyes();

  // Routing
  const location = useLocation();
  const { routeName } = useParams();
  const navigate = useNavigate();
  const isEventsView = location.pathname.endsWith("/events");

  // UI Toggle
  const [opened, { toggle }] = useDisclosure();
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);

  // Search Context
  const [trips, setTrips] = useState<Trip[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [handlers, setHandlers] = useState<Handler[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);

  // Flow Context
  const [flows, setFlows] = useState<FlowGraphType[]>([]);
  const [actions, setActions] = useState<SpotlightActionData[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<FlowGraphType | null>(null);
  const [selectedNode, setSelectedNode] = useState<FlowNodeType | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [
          { response: tripResponse },
          { response: eventResponse },
          { response: routeResponse },
          { response: handlerResponse },
          { response: positionResponse },
        ] = await Promise.all([
          service.listTrips({}),
          service.listEvents({}),
          service.listRoutes({}),
          service.listHandlers({}),
          service.listPositions({}),
        ]);
        setTrips(tripResponse.trips);
        setEvents(eventResponse.events);
        setRoutes(routeResponse.routes);
        setHandlers(handlerResponse.handlers);
        setPositions(positionResponse.positions);

        const flows = routeResponse.routes.map(toFlowGraph);
        setFlows(flows);

        if (routeName) {
          const matchingFlow = flows.find((flow) => flow.name === routeName);
          setSelectedFlow(matchingFlow || null);
        } else if (location.pathname === "/") {
          setSelectedFlow(null);
        } else if (!selectedFlow) {
          setSelectedFlow(flows[0]);
        }

        setActions(
          handlerResponse.handlers.map((handler) => ({
            id: uuidv4(),
            label: `${handler.context}.${handler.name}`,
            description: handler.description,
            onClick: () => {
              setSelectedFlow((currentFlow: FlowGraphType | null) => {
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
    setSelectedFlow(newFlow);
    navigate(`/route/${name}`);
  };

  return (
    <FlowContext.Provider
      value={{
        flows,
        setFlows,
        selectedFlow,
        setSelectedFlow,
        selectedNode,
        setSelectedNode,
        selectedEvents,
        setSelectedEvents,
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
            <SearchContext.Provider
              value={{
                trips,
                events,
                routes,
                handlers,
                positions,
                setTrips,
                setEvents,
                setRoutes,
                setHandlers,
                setPositions,
              }}
            >
              <Group
                gap="xs"
                style={{
                  cursor: "pointer",
                  padding: "8px 16px",
                  borderRadius: "var(--mantine-radius-md)",
                  border: "1px solid var(--mantine-color-blue-2)",
                  width: "500px",
                  backgroundColor: "white",
                  boxShadow: "0 2px 4px rgba(37, 99, 235, 0.05)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "var(--mantine-color-blue-0)",
                    borderColor: "var(--mantine-color-blue-4)",
                    boxShadow: "0 4px 8px rgba(37, 99, 235, 0.1)",
                    transform: "translateY(-1px)",
                  },
                }}
                onClick={() => spotlight.open()}
              >
                <IconSearch
                  size={18}
                  style={{ color: "var(--mantine-color-blue-6)" }}
                />
                <Text
                  size="sm"
                  style={{ color: "var(--mantine-color-gray-7)", flex: 1 }}
                >
                  Search everything...
                </Text>
                <Text
                  size="xs"
                  style={{
                    padding: "4px 8px",
                    backgroundColor: "var(--mantine-color-blue-0)",
                    border: "1px solid var(--mantine-color-blue-2)",
                    borderRadius: "4px",
                    color: "var(--mantine-color-blue-7)",
                    fontWeight: 500,
                  }}
                >
                  ⌘K
                </Text>
              </Group>
              <Search />
            </SearchContext.Provider>
          </Box>

          <Group gap="sm" style={{ flex: "0 0 auto", marginLeft: "2rem" }}>
            <Button
              variant="light"
              size="sm"
              disabled={!selectedFlow || selectedEvents.length > 0}
              onClick={openModal}
              leftSection={<IconPlus size={16} />}
            >
              New Flow
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
                  active={flow === selectedFlow}
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
          {!selectedFlow ? (
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
