import { createContext, useContext, ReactNode } from "react";
import { AwyesService } from "./client";
import { FlowNodeType, FlowEdgeType } from "./types";

// Flow Context
type FlowContextType = {
  nodes: FlowNodeType[];
  edges: FlowEdgeType[];
  setNodes: React.Dispatch<React.SetStateAction<FlowNodeType[]>>;
  setEdges: React.Dispatch<React.SetStateAction<FlowEdgeType[]>>;
};

export const FlowContext = createContext<FlowContextType>({
  nodes: [],
  edges: [],
  setNodes: () => {},
  setEdges: () => {},
});

// Awyes Context
const AwyesContext = createContext<AwyesService | null>(null);

export function AwyesProvider({ children }: { children: ReactNode }) {
  const service = new AwyesService();

  return (
    <AwyesContext.Provider value={service}>{children}</AwyesContext.Provider>
  );
}

export function useAwyes() {
  const context = useContext(AwyesContext);
  if (!context) {
    throw new Error("useAwyes must be used within an AwyesProvider");
  }
  return context;
}
