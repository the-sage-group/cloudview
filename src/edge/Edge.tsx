import { Badge, rem } from "@mantine/core";
import { BezierEdge, EdgeProps } from "@xyflow/react";

import { FlowEdgeType } from "../types";

export function FlowEdge(props: EdgeProps<FlowEdgeType>) {
  const { data: edge } = props;
  if (!edge) return null;

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
          pointerEvents: "none",
        }}
      >
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
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
              textTransform: "none",
              fontSize: rem(12),
              position: "relative",
            }}
          >
            {edge.label || ""}
          </Badge>
        </div>
      </foreignObject>
    </>
  );
}
