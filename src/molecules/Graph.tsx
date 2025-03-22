import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { Execute } from "../route/Execute";
import { SelectedFlow } from "../route/Selected";
import { FlowNode } from "../node/Node";
import { FlowEdge } from "../edge/Edge";
import { useAwyes } from "../Context";
import { SelectedNode } from "../node/Selected";
import { FlowNodeType, FlowEdgeType } from "../types";
import { State } from "../trip/State";

const nodeTypes = {
  flowNode: FlowNode,
};

const edgeTypes = {
  flowEdge: FlowEdge,
};

export default function Graph({
  nodes,
  edges,
}: {
  nodes: FlowNodeType[];
  edges: FlowEdgeType[];
}) {
  const { setSelectedNode } = useAwyes();
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <ReactFlow
        fitView
        nodes={nodes}
        edges={edges}
        minZoom={0.1}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        edgesFocusable={false}
        nodesDraggable={false}
        nodesConnectable={false}
        edgesReconnectable={false}
        elementsSelectable={true}
        onPaneClick={() => setSelectedNode(null)}
      >
        <Controls
          showZoom={false}
          showInteractive={false}
          showFitView={true}
          position="bottom-left"
        />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <SelectedFlow />
        <SelectedNode />
        <Execute />
        <State />
      </ReactFlow>
    </div>
  );
}
