import { Octokit } from "@octokit/rest";
import type { Endpoints } from "@octokit/types";
import { AwyesClient, Entity, Event, Trip } from "@the-sage-group/awyes-web";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { createContext, useContext, ReactNode, useState } from "react";

import { FlowGraphType, FlowNodeType } from "./types";

// Github Context
type GithubRepo = Endpoints["GET /user/repos"]["response"]["data"][number];
type GitHubContextType = {
  octokit: Octokit;
  repositories: GithubRepo[];
  setRepositories: React.Dispatch<React.SetStateAction<GithubRepo[]>>;
};
const octokit = new Octokit({ auth: import.meta.env.VITE_GITHUB_TOKEN });
export const GitHubContext = createContext<GitHubContextType>({
  octokit,
  repositories: [],
  setRepositories: () => {},
});
export function GitHubProvider({ children }: { children: ReactNode }) {
  const [repositories, setRepositories] = useState<GithubRepo[]>([]);
  return (
    <GitHubContext.Provider value={{ octokit, repositories, setRepositories }}>
      {children}
    </GitHubContext.Provider>
  );
}
export function useGitHub() {
  const context = useContext(GitHubContext);
  if (!context) {
    throw new Error("useGitHub must be used within a GitHubProvider");
  }
  return context;
}

// Awyes Context
type AwyesContextType = {
  awyes: AwyesClient;
  flows: FlowGraphType[];
  selectedFlow: FlowGraphType | null;
  selectedNode: FlowNodeType | null;
  selectedEntity: Entity | null;
  selectedTrip: Trip | null;
  selectedTripEvents: Event[];
  setFlows: React.Dispatch<React.SetStateAction<FlowGraphType[]>>;
  setSelectedFlow: React.Dispatch<React.SetStateAction<FlowGraphType | null>>;
  setSelectedNode: React.Dispatch<React.SetStateAction<FlowNodeType | null>>;
  setSelectedEntity: React.Dispatch<React.SetStateAction<Entity | null>>;
  setSelectedTrip: React.Dispatch<React.SetStateAction<Trip | null>>;
  setSelectedTripEvents: React.Dispatch<React.SetStateAction<Event[]>>;
};
const transport = new GrpcWebFetchTransport({
  baseUrl: "http://localhost:8080",
  allowInsecure: true,
});
const awyes = new AwyesClient(transport);
export const AwyesContext = createContext<AwyesContextType>({
  awyes,
  flows: [],
  selectedFlow: null,
  selectedNode: null,
  selectedEntity: null,
  selectedTrip: null,
  selectedTripEvents: [],
  setFlows: () => {},
  setSelectedFlow: () => {},
  setSelectedNode: () => {},
  setSelectedEntity: () => {},
  setSelectedTrip: () => {},
  setSelectedTripEvents: () => {},
});
export function AwyesProvider({ children }: { children: ReactNode }) {
  const [flows, setFlows] = useState<FlowGraphType[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<FlowGraphType | null>(null);
  const [selectedNode, setSelectedNode] = useState<FlowNodeType | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [selectedTripEvents, setSelectedTripEvents] = useState<Event[]>([]);

  return (
    <AwyesContext.Provider
      value={{
        awyes,
        flows,
        selectedFlow,
        selectedNode,
        selectedTrip,
        selectedTripEvents,
        selectedEntity,
        setFlows,
        setSelectedFlow,
        setSelectedNode,
        setSelectedEntity,
        setSelectedTrip,
        setSelectedTripEvents,
      }}
    >
      {children}
    </AwyesContext.Provider>
  );
}

export function useAwyes() {
  const context = useContext(AwyesContext);
  if (!context) {
    throw new Error("useAwyes must be used within an AwyesProvider");
  }
  return context;
}
