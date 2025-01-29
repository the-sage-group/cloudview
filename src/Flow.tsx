import { v4 as uuid } from "uuid";
import { useEffect, useContext } from "react";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Background,
  BackgroundVariant,
  NodeChange,
  Controls,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Paper, Title, Group, Badge, Text, Button, Stack } from "@mantine/core";
import { IconArrowsRandom, IconPlayerPlay } from "@tabler/icons-react";
import {
  FieldDescriptorProto,
  FieldDescriptorProto_Type,
  FieldDescriptorProto_Label,
} from "@the-sage-group/awyes-web";

import { FlowNode } from "./Node";
import { FlowEdge } from "./Edge";
import { FlowContext } from "./Context";
import { FlowNodeType, FlowEdgeType, toRouteProto } from "./types";
import { useAwyes } from "./Context";

const nodeTypes = {
  flowNode: FlowNode,
};

const edgeTypes = {
  flowEdge: FlowEdge,
};

export default function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNodeType>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<FlowEdgeType>([]);
  const client = useAwyes();
  const { activeFlow, setActiveFlow, selectedNode, setSelectedNode } =
    useContext(FlowContext);
  if (!activeFlow) return null;

  useEffect(() => {
    const sortedNodes = [
      ...nodes,
      ...activeFlow.nodes.filter(
        (n) => !nodes.some((node) => node.id === n.id)
      ),
    ].sort((a, b) => {
      const nameA = a.data.name || a.data.handler?.name || "";
      const nameB = b.data.name || b.data.handler?.name || "";
      return nameA.localeCompare(nameB);
    });

    setNodes(sortedNodes);
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
      const response = await client.startTrip({
        route: toRouteProto(activeFlow),
        state: {},
      });
      console.log(response);
    } catch (error) {
      console.error("Failed to execute flow:", error);
    }
  };

  return (
    <FlowContext.Provider
      value={{ activeFlow, setActiveFlow, selectedNode, setSelectedNode }}
    >
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <ReactFlow
          fitView
          nodes={nodes}
          edges={edges}
          minZoom={0.1}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onConnect={(connection) => {
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

          {selectedNode && (
            <Paper
              shadow="sm"
              p="md"
              radius="md"
              withBorder
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                zIndex: 5,
                width: "300px",
              }}
            >
              <Stack gap="md">
                <div>
                  <Text size="sm" fw={600} c="dimmed" mb={4}>
                    Name
                  </Text>
                  <Text size="lg" fw={700}>
                    {selectedNode.data.name || selectedNode.data.handler?.name}
                  </Text>
                </div>

                <div>
                  <Text size="sm" fw={600} c="dimmed" mb={4}>
                    Handler
                  </Text>
                  <Group gap={8}>
                    <Badge variant="dot" color="violet" size="sm">
                      {`${selectedNode.data.handler?.context}.${selectedNode.data.handler?.name}`}
                    </Badge>
                  </Group>
                </div>

                {selectedNode.data.handler?.parameters?.length! > 0 && (
                  <div>
                    <Text size="sm" fw={600} c="dimmed" mb={4}>
                      Parameters
                    </Text>
                    <Stack gap={6}>
                      {selectedNode.data.handler?.parameters.map(
                        (param, index) => (
                          <Group key={index} gap={8}>
                            <Text size="sm" fw={500}>
                              {param.name}
                            </Text>
                            <Badge variant="dot" color="blue" size="sm">
                              {`${
                                param.label
                                  ? FieldDescriptorProto_Label[param.label]
                                  : ""
                              } ${FieldDescriptorProto_Type[param.type!]}`}
                            </Badge>
                          </Group>
                        )
                      )}
                    </Stack>
                  </div>
                )}

                {selectedNode.data.handler?.returns?.length! > 0 && (
                  <div>
                    <Text size="sm" fw={600} c="dimmed" mb={4}>
                      Returns
                    </Text>
                    <Stack gap={6}>
                      {selectedNode.data.handler?.returns.map((ret, index) => (
                        <Group key={index} gap={8}>
                          <Text size="sm" fw={500}>
                            {ret.name}
                          </Text>
                          <Badge variant="dot" color="green" size="sm">
                            {`${
                              ret.label
                                ? FieldDescriptorProto_Label[ret.label]
                                : ""
                            } ${FieldDescriptorProto_Type[ret.type!]}`}
                          </Badge>
                        </Group>
                      ))}
                    </Stack>
                  </div>
                )}
              </Stack>
            </Paper>
          )}

          <Button
            size="xl"
            radius="xl"
            color="blue"
            variant="filled"
            disabled={nodes.length === 0}
            style={{
              position: "absolute",
              bottom: "2rem",
              right: "2rem",
              zIndex: 5,
              width: "64px",
              height: "64px",
              padding: 0,
            }}
            onClick={startTrip}
            title={
              nodes.length === 0 ? "Add nodes to execute flow" : "Execute flow"
            }
          >
            <IconPlayerPlay size={24} />
          </Button>

          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          <Controls />
        </ReactFlow>
      </div>
    </FlowContext.Provider>
  );
}
