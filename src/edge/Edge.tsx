import { Badge, rem } from "@mantine/core";
import { BezierEdge, EdgeProps } from "@xyflow/react";
import { useState } from "react";

import { FlowEdgeType } from "../types";
import { BADGE_COLORS } from "../constants/theme";
import { useAwyes } from "../Context";

export function FlowEdge(props: EdgeProps<FlowEdgeType>) {
  const { data: edge } = props;
  const [isHovered, setIsHovered] = useState(false);
  const { selectedTripEvents, selectedFlow } = useAwyes();

  if (!edge) return null;

  // Calculate center position
  const centerX = props.sourceX + (props.targetX - props.sourceX) * 0.5;
  const centerY = props.sourceY + (props.targetY - props.sourceY) * 0.5;

  // Find the source node to get its name
  const sourceNode = selectedFlow?.nodes.find(
    (node) => node.id === props.source
  );
  const sourceNodeName = sourceNode?.data.name;

  // Check if this edge has been traversed in any event
  const isTraversed = selectedTripEvents.some(
    (event) =>
      event.position?.name === sourceNodeName && event.exitLabel === edge.label
  );

  const getEdgeColor = () => {
    // If the edge has been traversed, highlight it even when not hovered
    if (isTraversed || isHovered) {
      switch (edge.label) {
        case "SUCCESS":
          return `var(--mantine-color-${BADGE_COLORS.SUCCESS}-6)`;
        case "FAILURE":
          return `var(--mantine-color-${BADGE_COLORS.FAILURE}-6)`;
        default:
          return `var(--mantine-color-${BADGE_COLORS.DEFAULT}-6)`;
      }
    }
  };

  return (
    <g
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <BezierEdge
        {...props}
        style={{
          stroke: getEdgeColor(),
          strokeWidth: isHovered ? 2 : 1,
          transition: "all 0.2s ease-in-out",
        }}
      />
      {isHovered && (
        <foreignObject
          width={120}
          height={40}
          x={centerX - 60} // Center horizontally by offsetting half the width
          y={centerY - 20} // Center vertically by offsetting half the height
          style={{
            overflow: "visible",
            position: "absolute",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Badge
              variant={edge.label ? "filled" : "outline"}
              color={
                edge.label === "SUCCESS"
                  ? BADGE_COLORS.SUCCESS
                  : edge.label === "FAILURE"
                  ? BADGE_COLORS.FAILURE
                  : BADGE_COLORS.DEFAULT
              }
              style={{
                padding: "8px 12px",
                textTransform: "none",
                fontSize: rem(13),
                fontWeight: 600,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              {edge.label || ""}
            </Badge>
          </div>
        </foreignObject>
      )}
    </g>
  );
}
