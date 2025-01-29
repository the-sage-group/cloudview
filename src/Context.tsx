import { AwyesClient } from "@the-sage-group/awyes-web";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { createContext, useContext, ReactNode } from "react";
import { FlowGraphType, FlowNodeType } from "./types";

// Flow Context
type FlowContextType = {
  activeFlow: FlowGraphType | null;
  setActiveFlow: React.Dispatch<React.SetStateAction<FlowGraphType | null>>;
  selectedNode: FlowNodeType | null;
  setSelectedNode: React.Dispatch<React.SetStateAction<FlowNodeType | null>>;
};

export const FlowContext = createContext<FlowContextType>({
  activeFlow: null,
  setActiveFlow: () => {},
  selectedNode: null,
  setSelectedNode: () => {},
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
