import { useEffect, useState } from "react";
import { useParams } from "react-router";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { State } from "./State";
import { Status } from "./Status";
import { Error } from "../molecules/Error";
import { FlowEdge } from "../edge/Edge";
import { useAwyes } from "../Context";
import { toFlowGraph } from "../types";
import { FlowNode } from "../node/Node";
import { SelectedNode } from "../node/Selected";
import { FlowNodeType } from "../types";

const nodeTypes = {
  flowNode: FlowNode,
};

const edgeTypes = {
  flowEdge: FlowEdge,
};

export default function Trip() {
  const {
    awyes,
    selectedFlow,
    setSelectedFlow,
    setSelectedTrip,
    setSelectedTripEvents,
    setSelectedNode,
  } = useAwyes();
  const { tripId } = useParams();
  const [error, setError] = useState<string | null>(null);

  if (!tripId) {
    return (
      <Error
        title="Trip Not Found"
        message="No trip ID provided. Please check the URL and try again."
      />
    );
  }

  useEffect(() => {
    async function fetchTripAndSubscribe() {
      if (!tripId) {
        setSelectedTripEvents([]);
        return;
      }

      try {
        const { response: tripResponse } = await awyes.getTrip({ tripId });

        if (!tripResponse.trip) {
          setError("Trip not found");
          return;
        }

        setSelectedTrip(tripResponse.trip);
        setSelectedFlow(toFlowGraph(tripResponse.trip.route!));
        setError(null);
      } catch (error) {
        console.error("Failed to fetch trip: ", error);
        setError(
          "We couldn't find the trip you're looking for. Please check the URL and try again."
        );
        return;
      }

      const subscription = awyes.watchTrip({ tripId });

      subscription.responses.onNext((event) => {
        if (!event) return;

        setSelectedTripEvents((prev) => [
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
    }
    fetchTripAndSubscribe();
  }, [tripId]);

  const onNodeClick = (_: React.MouseEvent, node: FlowNodeType) => {
    setSelectedNode(node);
  };

  if (error) {
    return <Error title="Trip Not Found" message={error} />;
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <ReactFlow
        fitView
        nodes={selectedFlow?.nodes}
        edges={selectedFlow?.edges}
        minZoom={0.1}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        edgesFocusable={false}
        nodesDraggable={false}
        nodesConnectable={false}
        edgesReconnectable={false}
        elementsSelectable={true}
        onNodeClick={onNodeClick}
      >
        <Controls
          showZoom={false}
          showInteractive={false}
          showFitView={true}
          position="bottom-left"
        />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>

      <Status />
      <SelectedNode />
      <State />
    </div>
  );
}
