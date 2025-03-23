import { useEffect, useState } from "react";
import { useParams } from "react-router";

import { Error } from "../molecules/Error";
import { useAwyes } from "../Context";
import { toFlowGraph } from "../types";
import Graph from "../molecules/Graph";

export default function Trip() {
  const {
    awyes,
    selectedFlow,
    setSelectedFlow,
    setSelectedTrip,
    setSelectedTripEvents,
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
        const { response: tripResponse } = await awyes.getTrip({
          trip: tripId,
        });
        const { response: routeResponse } = await awyes.getRoute({
          route: tripResponse.trip?.route,
          version: tripResponse.trip?.routeVersion,
        });
        if (!tripResponse.trip) {
          setError("Trip not found");
          return;
        }

        setSelectedTrip(tripResponse.trip);
        setSelectedFlow(toFlowGraph(routeResponse.route!));
        setError(null);
      } catch (error) {
        console.error("Failed to fetch trip: ", error);
        setError(
          "We couldn't find the trip you're looking for. Please check the URL and try again."
        );
        return;
      }

      const subscription = awyes.watchTrip({ trip: tripId });

      subscription.responses.onNext((event) => {
        if (!event) return;

        setSelectedTripEvents((prev) => [
          ...prev.filter((e) => e.id !== event.id && e.trip === tripId),
          event,
        ]);
      });

      subscription.responses.onError((error) => {
        console.error("Trip subscription error:", error);
      });

      subscription.responses.onComplete(async () => {
        const { response: tripResponse } = await awyes.getTrip({
          trip: tripId,
        });
        if (!tripResponse.trip) {
          setError("Trip not found");
          return;
        }
        setSelectedTrip(tripResponse.trip);
        console.log("Trip subscription completed");
      });
    }
    fetchTripAndSubscribe();
  }, [tripId]);

  if (error) {
    return <Error title="Trip Not Found" message={error} />;
  }

  if (!selectedFlow) return null;

  return <Graph nodes={selectedFlow?.nodes} edges={selectedFlow?.edges} />;
}
