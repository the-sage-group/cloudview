import { v4 as uuid } from "uuid";
import { useEffect, useContext, useState } from "react";
import { useParams } from "react-router";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Background,
  BackgroundVariant,
  NodeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Paper,
  Title,
  Group,
  Badge,
  Text,
  Button,
  ScrollArea,
  Table,
} from "@mantine/core";
import {
  IconArrowsRandom,
  IconPlayerPlay,
  IconChevronUp,
  IconHistory,
} from "@tabler/icons-react";
import { FieldDescriptorProto, Value } from "@the-sage-group/awyes-web";
import { useNavigate } from "react-router";

import { FlowNode, SelectedNode } from "./Node";
import { FlowEdge } from "./Edge";
import { FlowContext, useAwyes } from "./Context";
import { FlowNodeType, FlowEdgeType, toRouteProto } from "./types";

const nodeTypes = {
  flowNode: FlowNode,
};

const edgeTypes = {
  flowEdge: FlowEdge,
};

export default function Flow() {
  const client = useAwyes();
  const navigate = useNavigate();
  const { tripId } = useParams();
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNodeType>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<FlowEdgeType>([]);
  const { activeFlow, setActiveFlow, selectedNode, events, setEvents } =
    useContext(FlowContext);
  const [showState, setShowState] = useState(false);
  const [showEvents, setShowEvents] = useState(false);

  console.log(events);
  if (!activeFlow) return null;

  useEffect(() => {
    setNodes([
      ...nodes,
      ...activeFlow.nodes.filter(
        (n) => !nodes.some((node) => node.id === n.id)
      ),
    ]);
    setEdges([
      ...edges,
      ...activeFlow.edges.filter(
        (e) => !edges.some((edge) => edge.id === e.id)
      ),
    ]);
    (async () => {
      try {
        await client.registerRoute({
          route: toRouteProto(activeFlow),
        });
      } catch (error) {
        console.error("Failed to save route:", error);
      }
    })();
  }, [activeFlow]);

  useEffect(() => {
    if (!tripId) {
      setEvents([]);
      return;
    }

    // Subscribe to trip updates
    const subscription = client.watchTrip({ tripId });

    subscription.responses.onNext((event) => {
      if (!event) return;

      setEvents((prev) => [
        ...prev.filter((e) => e.timestamp !== event.timestamp),
        event,
      ]);
    });

    subscription.responses.onError((error) => {
      console.error("Trip subscription error:", error);
    });

    subscription.responses.onComplete(() => {
      console.log("Trip subscription completed");
    });
  }, [tripId]);

  const handleNodesChange = (changes: NodeChange<FlowNodeType>[]) => {
    onNodesChange(changes);

    const deletions = changes.filter((change) => change.type === "remove");
    if (deletions.length > 0) {
      const deletedIds = new Set(deletions.map((d) => d.id));
      setActiveFlow({
        ...activeFlow,
        nodes: activeFlow.nodes.filter((node) => !deletedIds.has(node.id)),
        edges: activeFlow.edges.filter(
          (edge) => !deletedIds.has(edge.source) && !deletedIds.has(edge.target)
        ),
      });
    }
  };

  const startTrip = async () => {
    try {
      const { response } = await client.startTrip({
        route: toRouteProto(activeFlow),
        state: {},
      });
      navigate(`/trip/${response.trip?.id}`);
    } catch (error) {
      console.error("Failed to execute flow:", error);
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <ReactFlow
        fitView
        nodes={nodes}
        edges={edges}
        minZoom={0.1}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onConnect={(connection) => {
          if (tripId) return;
          const id = uuid();
          const newEdge: FlowEdgeType = {
            id,
            source: connection.source!,
            target: connection.target!,
            type: "flowEdge",
            data: {
              id,
              label: "",
            },
          };
          setActiveFlow({
            ...activeFlow,
            edges: [...activeFlow.edges, newEdge],
          });
        }}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
      >
        <Paper
          shadow="sm"
          p="md"
          radius="md"
          withBorder
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            zIndex: 5,
            maxWidth: "400px",
          }}
        >
          <Group
            justify="space-between"
            mb={activeFlow.parameters.length > 0 ? "xs" : 0}
          >
            <Group gap="xs">
              <IconArrowsRandom
                size={20}
                style={{ color: "var(--mantine-color-blue-6)" }}
              />
              <Title order={4} style={{ margin: 0 }}>
                {activeFlow.name}
              </Title>
            </Group>
            {tripId && events.length > 0 && (
              <Button
                variant="subtle"
                size="compact-sm"
                rightSection={<IconHistory size={16} />}
                onClick={() => navigate(`/trip/${tripId}/events`)}
              >
                View Events
              </Button>
            )}
          </Group>

          {activeFlow.parameters.length > 0 && (
            <>
              <Text size="sm" c="dimmed" mb="xs">
                Parameters
              </Text>
              <Group gap="xs">
                {activeFlow.parameters.map(
                  (param: FieldDescriptorProto, index: number) => (
                    <Badge key={index} variant="dot" color="blue">
                      {param.name}
                    </Badge>
                  )
                )}
              </Group>
            </>
          )}
        </Paper>

        {selectedNode && <SelectedNode />}

        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        {!tripId && (
          <Button
            size="xl"
            radius="xl"
            color="blue"
            variant="filled"
            disabled={nodes.length === 0}
            style={{
              width: "64px",
              height: "64px",
              padding: 0,
              position: "absolute",
              bottom: "2rem",
              right: "2rem",
              zIndex: 5,
            }}
            onClick={startTrip}
            title={
              nodes.length === 0 ? "Add nodes to execute flow" : "Execute flow"
            }
          >
            <IconPlayerPlay size={24} />
          </Button>
        )}
      </ReactFlow>

      {tripId && events.length > 0 && (
        <Paper
          shadow="sm"
          radius="md"
          withBorder
          style={{
            position: "absolute",
            bottom: 0,
            left: "1rem",
            right: "7rem",
            zIndex: 1000,
            backgroundColor: "var(--mantine-color-body)",
            transform: `translateY(${
              showState ? "0" : "calc(100% - 2.5rem))"
            })`,
            transition: "transform 0.3s ease",
          }}
        >
          <Group
            p="xs"
            style={{
              cursor: "pointer",
              borderBottom: showState
                ? "1px solid var(--mantine-color-gray-3)"
                : "none",
              transition: "background-color 0.2s ease",
              ":hover": {
                backgroundColor: "var(--mantine-color-gray-0)",
              },
            }}
            onClick={() => setShowState(!showState)}
          >
            <Title order={5} style={{ flex: 1 }}>
              Trip State
            </Title>
            <Group gap="xs">
              <Text size="sm" c="dimmed">
                {
                  Object.keys(
                    events.reduce(
                      (acc, event) => ({ ...acc, ...event.state }),
                      {}
                    )
                  ).length
                }{" "}
                variables
              </Text>
              <IconChevronUp
                size={16}
                style={{
                  transform: `rotate(${showState ? "0deg" : "180deg"})`,
                  transition: "transform 0.3s ease",
                }}
              />
            </Group>
          </Group>
          <div
            style={{
              height: showState ? "15vh" : 0,
              transition: "height 0.3s ease",
              overflow: "hidden",
            }}
          >
            <ScrollArea p="md" h="15vh">
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Key</Table.Th>
                    <Table.Th>Value</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {Object.entries(
                    events.reduce(
                      (acc, event) => ({ ...acc, ...event.state }),
                      {}
                    )
                  ).map(([key, value]) => (
                    <Table.Tr key={key}>
                      <Table.Td>
                        <Text fw={500}>{key}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text style={{ fontFamily: "monospace" }}>
                          {JSON.stringify(Value.toJson(value as Value))}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </div>
        </Paper>
      )}
    </div>
  );
}
