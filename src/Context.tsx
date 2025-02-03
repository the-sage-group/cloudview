import {
  AwyesClient,
  Event,
  Trip,
  Position,
  Route,
  Handler,
} from "@the-sage-group/awyes-web";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { createContext, useContext, ReactNode } from "react";
import { FlowGraphType, FlowNodeType } from "./types";

// Search Context
type SearchContextType = {
  trips: Trip[];
  events: Event[];
  routes: Route[];
  handlers: Handler[];
  positions: Position[];
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  setRoutes: React.Dispatch<React.SetStateAction<Route[]>>;
  setHandlers: React.Dispatch<React.SetStateAction<Handler[]>>;
  setPositions: React.Dispatch<React.SetStateAction<Position[]>>;
};

export const SearchContext = createContext<SearchContextType>({
  trips: [],
  events: [],
  routes: [],
  handlers: [],
  positions: [],
  setTrips: () => {},
  setEvents: () => {},
  setRoutes: () => {},
  setHandlers: () => {},
  setPositions: () => {},
});

// Flow Context
type FlowContextType = {
  flows: FlowGraphType[];
  selectedFlow: FlowGraphType | null;
  selectedNode: FlowNodeType | null;
  selectedEvents: Event[];
  setFlows: React.Dispatch<React.SetStateAction<FlowGraphType[]>>;
  setSelectedFlow: React.Dispatch<React.SetStateAction<FlowGraphType | null>>;
  setSelectedNode: React.Dispatch<React.SetStateAction<FlowNodeType | null>>;
  setSelectedEvents: React.Dispatch<React.SetStateAction<Event[]>>;
};

export const FlowContext = createContext<FlowContextType>({
  flows: [],
  selectedFlow: null,
  selectedNode: null,
  selectedEvents: [],
  setFlows: () => {},
  setSelectedFlow: () => {},
  setSelectedNode: () => {},
  setSelectedEvents: () => {},
});

// Awyes Context
const AwyesContext = createContext<AwyesClient | null>(null);

export function AwyesProvider({ children }: { children: ReactNode }) {
  const transport = new GrpcWebFetchTransport({
    baseUrl: "http://localhost:8080",
    allowInsecure: true,
  });
  const client = new AwyesClient(transport);

  return (
    <AwyesContext.Provider value={client}>{children}</AwyesContext.Provider>
  );
}

export function useAwyes() {
  const context = useContext(AwyesContext);
  if (!context) {
    throw new Error("useAwyes must be used within an AwyesProvider");
  }
  return context;
}
