import { useEffect } from "react";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Paper, Title, Group, Badge, Text, Button } from "@mantine/core";
import { IconArrowsRandom, IconPlayerPlay } from "@tabler/icons-react";
import { FieldDescriptorProto } from "@the-sage-group/awyes-web";

import { FlowNode } from "./Node";
import { addFlowEdge } from "./Edge";
import { FlowContext } from "./Context";
import {
  FlowNodeType,
  FlowEdgeType,
  FlowGraphType,
  toFlowProto,
} from "./types";
import { useAwyes } from "./Context";

const nodeTypes = {
  flowNode: FlowNode,
};

export default function Flow({ flow }: { flow: FlowGraphType }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNodeType>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<FlowEdgeType>([]);
  const service = useAwyes();

  useEffect(() => {
    setNodes([
      ...nodes,
      ...flow.nodes.filter((n) => !nodes.some((node) => node.id === n.id)),
    ]);
    setEdges([
      ...edges,
      ...flow.edges.filter((e) => !edges.some((edge) => edge.id === e.id)),
    ]);
  }, [flow]);

  const executeFlow = async () => {
    try {
      const response = await service.executeFlow(toFlowProto(flow));
      console.log(response);
    } catch (error) {
      console.error("Failed to execute flow:", error);
    }
  };

  return (
    <FlowContext.Provider value={{ nodes, edges, setNodes, setEdges }}>
      <ReactFlow
        fitView
        nodes={nodes}
        edges={edges}
        minZoom={0.1}
        nodeTypes={nodeTypes}
        onConnect={(connection) => addFlowEdge(connection, edges, setEdges)}
        onNodesChange={onNodesChange}
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
          <Group gap="xs" mb={flow.parameters.length > 0 ? "xs" : 0}>
            <IconArrowsRandom
              size={20}
              style={{ color: "var(--mantine-color-blue-6)" }}
            />
            <Title order={4} style={{ margin: 0 }}>
              {flow.name}
            </Title>
          </Group>

          {flow.parameters.length > 0 && (
            <>
              <Text size="sm" c="dimmed" mb="xs">
                Parameters
              </Text>
              <Group gap="xs">
                {flow.parameters.map(
                  (param: FieldDescriptorProto, index: number) => (
                    <Badge key={index} size="sm" variant="light">
                      {param.name}
                    </Badge>
                  )
                )}
              </Group>
            </>
          )}
        </Paper>

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
          onClick={executeFlow}
          title={
            nodes.length === 0 ? "Add nodes to execute flow" : "Execute flow"
          }
        >
          <IconPlayerPlay size={32} />
        </Button>

        <Controls />
        <Background variant={BackgroundVariant.Lines} gap={12} size={1} />
      </ReactFlow>
    </FlowContext.Provider>
  );
}
