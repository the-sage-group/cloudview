import { useContext, useState } from "react";
import { BezierEdge, EdgeProps } from "@xyflow/react";
import { Popover, Autocomplete, Badge, rem } from "@mantine/core";
import { FlowEdgeType } from "./types";
import { FlowContext } from "./Context";

export function FlowEdge(props: EdgeProps<FlowEdgeType>) {
  const [opened, setOpened] = useState(false);
  const { selectedFlow, setSelectedFlow } = useContext(FlowContext);
  const { data: edge, id } = props;
  if (!edge) return null;
  const sourceNode = selectedFlow?.nodes.find(
    (n) => n.id === props.source
  )?.data;
  const targetNode = selectedFlow?.nodes.find(
    (n) => n.id === props.target
  )?.data;
  if (!sourceNode || !targetNode) return null;

  return (
    <>
      <BezierEdge {...props} style={{ opacity: 0.8, strokeWidth: 2 }} />
      <foreignObject
        width={120}
        height={30}
        x={props.sourceX + (props.targetX - props.sourceX) * 0.5}
        y={props.sourceY + (props.targetY - props.sourceY) * 0.5}
        style={{
          overflow: "visible",
          position: "absolute",
          pointerEvents: "all",
        }}
      >
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <Popover
            opened={opened}
            onChange={setOpened}
            position="top"
            withArrow
            shadow="md"
            width={200}
            closeOnClickOutside={true}
            trapFocus
          >
            <Popover.Target>
              <Badge
                variant={edge.label ? "light" : "outline"}
                color={
                  edge.label === "SUCCESS"
                    ? "green"
                    : edge.label === "FAILURE"
                    ? "red"
                    : "gray"
                }
                style={{
                  width: "100%",
                  cursor: "pointer",
                  textTransform: "none",
                  fontSize: rem(12),
                  position: "relative",
                }}
                onClick={() => setOpened(true)}
              >
                {edge.label || "Add label"}
              </Badge>
            </Popover.Target>
            <Popover.Dropdown p="xs">
              <Autocomplete
                data={["SUCCESS", "FAILURE"]}
                placeholder="Add edge label"
                value={edge.label || ""}
                variant="filled"
                size="xs"
                onChange={(value) => {
                  const updatedEdges = selectedFlow?.edges.map((e) => {
                    if (e.id === id) {
                      e.data!.label = value;
                      e.data!.from = sourceNode;
                      e.data!.to = targetNode;
                    }
                    return e;
                  });
                  setSelectedFlow({
                    ...selectedFlow,
                    edges: updatedEdges,
                  });
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    setOpened(false);
                  }
                }}
              />
            </Popover.Dropdown>
          </Popover>
        </div>
      </foreignObject>
    </>
  );
}
