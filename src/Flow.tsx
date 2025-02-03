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
  EdgeChange,
  Controls,
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
  Code,
  Modal,
  Stack,
  TextInput,
  Combobox,
  InputBase,
  useCombobox,
  Tooltip,
} from "@mantine/core";
import {
  IconPlayerPlay,
  IconChevronUp,
  IconHistory,
  IconBrandGithub,
  IconSearch,
  IconUser,
} from "@tabler/icons-react";
import {
  EntityType,
  FieldDescriptorProto,
  Value,
  Entity,
} from "@the-sage-group/awyes-web";
import { useNavigate } from "react-router";

import { FlowNode, SelectedNode } from "./Node";
import { FlowEdge } from "./Edge";
import { FlowContext, useAwyes, SearchContext } from "./Context";
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
  const {
    selectedFlow,
    setSelectedFlow,
    selectedNode,
    selectedEvents,
    setSelectedEvents,
    setSelectedNode,
  } = useContext(FlowContext);
  const { repositories } = useContext(SearchContext);
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });
  const [showState, setShowState] = useState(false);
  const [executeModalOpen, setExecuteModalOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [paramValues, setParamValues] = useState<Record<string, string>>({});

  if (!selectedFlow) return null;

  useEffect(() => {
    setNodes(selectedFlow.nodes);
    setEdges(selectedFlow.edges);
    (async () => {
      try {
        await client.registerRoute({
          route: toRouteProto(selectedFlow),
        });
      } catch (error) {
        console.error("Failed to save route:", error);
      }
    })();
  }, [selectedFlow]);

  useEffect(() => {
    if (!tripId) {
      setSelectedEvents([]);
      return;
    }

    // Subscribe to trip updates
    const subscription = client.watchTrip({ tripId });

    subscription.responses.onNext((event) => {
      if (!event) return;

      setSelectedEvents((prev) => [
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
      setSelectedFlow({
        ...selectedFlow,
        nodes: selectedFlow.nodes.filter((node) => !deletedIds.has(node.id)),
        edges: selectedFlow.edges.filter(
          (edge) => !deletedIds.has(edge.source) && !deletedIds.has(edge.target)
        ),
      });
    }
  };

  const handleEdgesChange = (changes: EdgeChange<FlowEdgeType>[]) => {
    onEdgesChange(changes);

    const deletions = changes.filter((change) => change.type === "remove");
    if (deletions.length > 0) {
      const deletedIds = new Set(deletions.map((d) => d.id));
      setSelectedFlow({
        ...selectedFlow,
        edges: selectedFlow.edges.filter((edge) => !deletedIds.has(edge.id)),
      });
    }
  };

  const handleExecute = async () => {
    if (!selectedEntity) return;

    try {
      const { response } = await client.startTrip({
        route: toRouteProto(selectedFlow),
        state: {},
        entity: selectedEntity,
      });
      navigate(`/trip/${response.trip?.id}`);
      setExecuteModalOpen(false);
    } catch (error) {
      console.error("Failed to execute flow:", error);
    }
  };

  const handleOpenExecuteModal = () => {
    setSelectedEntity(null);
    setParamValues({});
    setExecuteModalOpen(true);
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
        onPaneClick={() => setSelectedNode(null)}
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
          setSelectedFlow({
            ...selectedFlow,
            edges: [...selectedFlow.edges, newEdge],
          });
        }}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
      >
        <Controls
          showZoom={false}
          showInteractive={false}
          showFitView={true}
          position="bottom-left"
        />
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
            mb={selectedFlow.parameters.length > 0 ? "lg" : 0}
          >
            <Group gap="xs">
              {tripId && selectedEvents[0]?.entity && (
                <Tooltip
                  label={
                    <Stack gap={2}>
                      <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
                        Entity
                      </Text>
                      <Group gap="xs">
                        <Text size="sm" fw={500}>
                          {selectedEvents[0].entity.type != null
                            ? EntityType[selectedEvents[0].entity.type]
                                .split("_")
                                .map(
                                  (word: string) =>
                                    word.charAt(0).toUpperCase() +
                                    word.slice(1).toLowerCase()
                                )
                                .join(" ")
                            : "Unknown Type"}
                        </Text>
                        <Text size="sm" c="dimmed">
                          ·
                        </Text>
                        <Text size="sm">{selectedEvents[0].entity.name}</Text>
                      </Group>
                    </Stack>
                  }
                  position="right"
                  withArrow
                  arrowSize={6}
                >
                  {(() => {
                    switch (selectedEvents[0].entity.type) {
                      case EntityType.REPOSITORY:
                        return (
                          <IconBrandGithub
                            style={{
                              width: 20,
                              height: 20,
                              color: "var(--mantine-color-blue-6)",
                            }}
                            stroke={1.5}
                          />
                        );
                      case EntityType.USER:
                        return (
                          <IconUser
                            style={{
                              width: 20,
                              height: 20,
                              color: "var(--mantine-color-blue-6)",
                            }}
                            stroke={1.5}
                          />
                        );
                      default:
                        return (
                          <IconUser
                            style={{
                              width: 20,
                              height: 20,
                              color: "var(--mantine-color-blue-6)",
                            }}
                            stroke={1.5}
                          />
                        );
                    }
                  })()}
                </Tooltip>
              )}
              <Title order={4} style={{ margin: 0 }}>
                {selectedFlow.name}
              </Title>
              {tripId && selectedEvents.length > 0 && (
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
            {tripId && selectedEvents.length > 0 && (
              <Stack gap="xs" mt="xs">
                {selectedEvents[0] && (
                  <Group gap="xs">
                    <Text size="sm" fw={500}>Started:</Text>
                    <Text size="sm" c="dimmed">
                      {new Date(Number(selectedEvents[0].timestamp!)).toLocaleString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                      }).replace(/(\d+)\/(\d+)\/(\d+)/, '$3/$1/$2')}
                    </Text>
                  </Group>
                )}
                {selectedEvents.length > 1 && selectedEvents[selectedEvents.length - 1].label === 'SUCCESS' && (
                  <>
                    <Group gap="xs">
                      <Text size="sm" fw={500}>Completed:</Text>
                      <Text size="sm" c="dimmed">
                        {new Date(Number(selectedEvents[selectedEvents.length - 1].timestamp!)).toLocaleString('en-US', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: false
                        }).replace(/(\d+)\/(\d+)\/(\d+)/, '$3/$1/$2')}
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <Text size="sm" fw={500}>Duration:</Text>
                      <Text size="sm" c="dimmed">
                        {((Number(selectedEvents[selectedEvents.length - 1].timestamp) - Number(selectedEvents[0].timestamp)) / 1000).toFixed(1)}s
                      </Text>
                    </Group>
                  </>
                )}
              </Stack>
            )}
          </Group>

          {selectedFlow.parameters.length > 0 && (
            <Stack gap="lg">
              <div>
                <Text size="sm" fw={600} tt="uppercase" c="dimmed" mb={8}>
                  Parameters
                </Text>
                <Group gap="xs">
                  {selectedFlow.parameters.map(
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
            onClick={handleOpenExecuteModal}
            title={
              nodes.length === 0 ? "Add nodes to execute flow" : "Execute flow"
            }
          >
            <IconPlayerPlay size={24} />
          </Button>
        )}
      </ReactFlow>

      {tripId && selectedEvents.length > 0 && (
        <Paper
          shadow="sm"
          radius="md"
          withBorder
          style={{
            position: "absolute",
            bottom: 0,
            left: "7rem",
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
                    selectedEvents.reduce(
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
              height: showState ? "auto" : 0,
              maxHeight: "30vh",
              transition: "max-height 0.3s ease",
              overflow: "hidden",
            }}
          >
            <ScrollArea p="md">
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ width: "200px" }}>Key</Table.Th>
                    <Table.Th>Value</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {Object.entries(
                    selectedEvents.reduce(
                      (acc, event) => ({ ...acc, ...event.state }),
                      {}
                    )
                  ).map(([key, value]) => (
                    <Table.Tr key={key}>
                      <Table.Td>
                        <Text fw={500}>{key}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Code block>
                          {JSON.stringify(Value.toJson(value as Value))}
                        </Code>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </div>
        </Paper>
      )}

      <Modal
        opened={executeModalOpen}
        onClose={() => setExecuteModalOpen(false)}
        title={<Title order={3}>Execute Flow</Title>}
        size="lg"
      >
        <Stack gap="md">
          <>
            <Stack gap="xs">
              <Text fw={500}>Select Entity</Text>
              <Combobox
                store={combobox}
                onOptionSubmit={(val) => {
                  setSelectedEntity({ name: val, type: EntityType.REPOSITORY });
                  setSearchValue(val);
                  combobox.closeDropdown();
                }}
              >
                <Combobox.Target>
                  <InputBase
                    value={searchValue}
                    onChange={(event) => {
                      const value = event.currentTarget.value;
                      setSearchValue(value);
                      setSelectedEntity({
                        name: value,
                        type: EntityType.USER,
                      });
                    }}
                    onClick={() => {
                      const hasMatches = repositories.some((repo) =>
                        repo.full_name
                          .toLowerCase()
                          .includes(searchValue.toLowerCase().trim())
                      );
                      if (hasMatches) {
                        combobox.openDropdown();
                      }
                    }}
                    leftSection={
                      selectedEntity &&
                      (selectedEntity.type === EntityType.REPOSITORY ? (
                        <IconBrandGithub
                          size={16}
                          style={{ color: "var(--mantine-color-blue-filled)" }}
                        />
                      ) : (
                        <IconUser
                          size={16}
                          style={{ color: "var(--mantine-color-gray-6)" }}
                        />
                      ))
                    }
                    rightSection={<IconSearch size={16} />}
                    rightSectionPointerEvents="none"
                    placeholder="Search repositories or enter custom entity..."
                  />
                </Combobox.Target>

                {repositories.some((repo) =>
                  repo.full_name
                    .toLowerCase()
                    .includes(searchValue.toLowerCase().trim())
                ) && (
                  <Combobox.Dropdown>
                    <Combobox.Options>
                      <ScrollArea.Autosize mah={400} type="scroll">
                        {repositories
                          .filter((repo) =>
                            repo.full_name
                              .toLowerCase()
                              .includes(searchValue.toLowerCase().trim())
                          )
                          .map((repo) => (
                            <Combobox.Option
                              value={repo.full_name}
                              key={repo.node_id}
                            >
                              <Group>
                                <IconBrandGithub size={20} />
                                <div>
                                  <Text fw={500}>{repo.full_name}</Text>
                                  <Text size="xs" c="dimmed">
                                    {repo.description || "No description"}
                                  </Text>
                                </div>
                              </Group>
                            </Combobox.Option>
                          ))}
                      </ScrollArea.Autosize>
                    </Combobox.Options>
                  </Combobox.Dropdown>
                )}
              </Combobox>
            </Stack>

            {selectedFlow.parameters.length > 0 && (
              <Stack gap="xs">
                <Text fw={500}>Parameters</Text>
                {selectedFlow.parameters.map((param, index) => (
                  <TextInput
                    key={index}
                    label={param.name}
                    placeholder={`Enter ${param.name}`}
                    value={paramValues[param.name!] || ""}
                    onChange={(e) =>
                      setParamValues({
                        ...paramValues,
                        [param.name!]: e.currentTarget.value,
                      })
                    }
                    required
                  />
                ))}
              </Stack>
            )}

            <Group justify="flex-end" mt="xl">
              <Button
                variant="light"
                onClick={() => setExecuteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleExecute}
                disabled={
                  !selectedEntity ||
                  Object.keys(paramValues).length <
                    selectedFlow.parameters.length
                }
              >
                Execute
              </Button>
            </Group>
          </>
        </Stack>
      </Modal>
    </div>
  );
}
