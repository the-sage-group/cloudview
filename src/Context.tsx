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
import type { Endpoints } from "@octokit/types";
import { Octokit } from "@octokit/rest";

import { FlowGraphType, FlowNodeType } from "./types";

type GithubRepo = Endpoints["GET /user/repos"]["response"]["data"][number];

// Search Context
type SearchContextType = {
  trips: Trip[];
  events: Event[];
  routes: Route[];
  handlers: Handler[];
  positions: Position[];
  repositories: GithubRepo[];
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  setRoutes: React.Dispatch<React.SetStateAction<Route[]>>;
  setHandlers: React.Dispatch<React.SetStateAction<Handler[]>>;
  setPositions: React.Dispatch<React.SetStateAction<Position[]>>;
  setRepositories: React.Dispatch<React.SetStateAction<GithubRepo[]>>;
};

export const SearchContext = createContext<SearchContextType>({
  trips: [],
  events: [],
  routes: [],
  handlers: [],
  positions: [],
  repositories: [],
  setTrips: () => {},
  setEvents: () => {},
  setRoutes: () => {},
  setHandlers: () => {},
  setPositions: () => {},
  setRepositories: () => {},
});

// Flow Context
type FlowContextType = {
  flows: FlowGraphType[];
  selectedFlow: FlowGraphType | null;
  selectedNode: FlowNodeType | null;
  selectedEvents: Event[];
  selectedEntity: string | null;
  setFlows: React.Dispatch<React.SetStateAction<FlowGraphType[]>>;
  setSelectedFlow: React.Dispatch<React.SetStateAction<FlowGraphType | null>>;
  setSelectedNode: React.Dispatch<React.SetStateAction<FlowNodeType | null>>;
  setSelectedEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  setSelectedEntity: React.Dispatch<React.SetStateAction<string | null>>;
};

export const FlowContext = createContext<FlowContextType>({
  flows: [],
  selectedFlow: null,
  selectedNode: null,
  selectedEvents: [],
  selectedEntity: null,
  setFlows: () => {},
  setSelectedFlow: () => {},
  setSelectedNode: () => {},
  setSelectedEvents: () => {},
  setSelectedEntity: () => {},
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

// GitHub Context
type GitHubContextType = {
  octokit: Octokit | null;
};

export const GitHubContext = createContext<GitHubContextType>({
  octokit: null,
});

export function GitHubProvider({ children }: { children: ReactNode }) {
  const octokit = new Octokit({
    auth: import.meta.env.VITE_GITHUB_TOKEN,
  });

  return (
    <GitHubContext.Provider value={{ octokit }}>
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
