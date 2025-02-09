import { useState } from "react";
import { Label } from "@the-sage-group/awyes-web";
import { BezierEdge, EdgeProps } from "@xyflow/react";
import { Popover, Autocomplete, Badge, rem } from "@mantine/core";

import { useAwyes } from "../Context";
import { FlowEdgeType } from "../types";

export function FlowEdge(props: EdgeProps<FlowEdgeType>) {
  const [opened, setOpened] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const { selectedFlow, setSelectedFlow } = useAwyes();
  const { data: edge, id } = props;
  if (!edge) return null;
  const sourceNode = selectedFlow?.nodes.find(
    (n) => n.id === props.source
  )?.data;
  const targetNode = selectedFlow?.nodes.find(
    (n) => n.id === props.target
  )?.data;
  if (!sourceNode || !targetNode) return null;

  const updateEdgeLabel = (value: string) => {
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
    setOpened(false);
  };

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
            onChange={(isOpen) => {
              setOpened(isOpen);
              if (isOpen) {
                setInputValue(edge.label || "");
              }
            }}
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
                data={Object.keys(Label).filter((key) => isNaN(Number(key)))}
                placeholder="Add edge label"
                value={inputValue}
                variant="filled"
                size="xs"
                onChange={setInputValue}
                onOptionSubmit={updateEdgeLabel}
                onBlur={() => {
                  if (inputValue) {
                    updateEdgeLabel(inputValue);
                  } else {
                    setOpened(false);
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    updateEdgeLabel(inputValue);
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
