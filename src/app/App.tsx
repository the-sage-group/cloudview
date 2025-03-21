import { useEffect, useState } from "react";
import {
  AppShell,
  Burger,
  Group,
  Title,
  Box,
  LoadingOverlay,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { Endpoints } from "@octokit/types";
import { Routes, Route as RouterRoute, Link } from "react-router";

import Trip from "../trip/Trip";
import Flow from "../flow/Flow";
import Events from "../events/Events";
import { Search } from "./Search";
import { Trips } from "../trip/Trips";
import { toFlowGraph } from "../types";
import { useGitHub, useAwyes } from "../Context";
import { Navbar } from "./Navbar";

type GithubRepo = Endpoints["GET /user/repos"]["response"]["data"][number];

export default function App() {
  // Awyes Context
  const {
    awyes,
    setFlows,
    setSelectedFlow,
    setSelectedTrip,
    setSelectedTripEvents,
    setSelectedNode,
  } = useAwyes();

  // UI Toggle with localStorage persistence
  const [sidebarOpened, sidebar] = useDisclosure(
    localStorage.getItem("sidebar-opened") === "true"
  );
  useEffect(() => {
    localStorage.setItem("sidebar-opened", String(sidebarOpened));
  }, [sidebarOpened]);

  // GitHub Context
  const { octokit, setRepositories } = useGitHub();

  // Loading State
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const [userRepos, orgRepos, { response: routeResponse }] =
          await Promise.all([
            octokit?.rest.repos.listForAuthenticatedUser({
              sort: "full_name",
              affiliation: "owner,collaborator",
            }),
            octokit?.rest.repos.listForAuthenticatedUser({
              sort: "full_name",
              affiliation: "organization_member",
            }),
            awyes?.listRoutes({}),
          ]);
        const repoMap = new Map<number, GithubRepo>();
        (userRepos?.data || []).forEach((repo) => repoMap.set(repo.id, repo));
        (orgRepos?.data || []).forEach((repo) => repoMap.set(repo.id, repo));
        setRepositories(Array.from(repoMap.values()));

        const flows = routeResponse.routes.map(toFlowGraph);
        setFlows(flows);
      } catch (error) {
        console.error("Failed to fetch nodes and flows:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <LoadingOverlay
        visible={isLoading}
        overlayProps={{ radius: "lg", blur: 100 }}
        loaderProps={{
          size: "xl",
          color: "blue",
          variant: "bars",
        }}
        transitionProps={{
          duration: 500,
          timingFunction: "ease",
          transition: "fade",
        }}
      />
      <AppShell
        header={{ height: 60 }}
        padding="md"
        navbar={{
          width: 300,
          breakpoint: "sm",
          collapsed: { desktop: !sidebarOpened },
        }}
        styles={{
          main: {
            height: "100vh",
          },
        }}
      >
        <AppShell.Header
          p="xs"
          style={{
            display: "flex",
            alignItems: "center",
            borderBottom: "1px solid var(--mantine-color-gray-2)",
            background: "var(--mantine-color-white)",
            height: "60px",
          }}
        >
          <Box style={{ flex: "1", display: "flex" }}>
            <Group gap="xl" style={{ flex: "0 0 auto", marginRight: "2rem" }}>
              <Burger
                opened={sidebarOpened}
                onClick={sidebar.toggle}
                size="sm"
              />
              <Link
                to="/"
                style={{ textDecoration: "none" }}
                onClick={() => {
                  setSelectedFlow(null);
                  setSelectedTrip(null);
                  setSelectedTripEvents([]);
                  setSelectedNode(null);
                }}
              >
                <Title
                  order={3}
                  style={{
                    margin: 0,
                    whiteSpace: "nowrap",
                    background:
                      "linear-gradient(135deg, #00C6FF 0%, #0072FF 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                  }}
                >
                  ☁️ Awyes
                </Title>
              </Link>
            </Group>
          </Box>

          <Box
            style={{
              flex: "0 0 auto",
              width: "500px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Search />
          </Box>

          <Box style={{ flex: "1" }} />
        </AppShell.Header>

        <AppShell.Navbar p="md">
          <Navbar />
        </AppShell.Navbar>

        <AppShell.Main>
          <Routes>
            <RouterRoute path="/" element={<Flow />} />
            <RouterRoute path="/route/:context/:name" element={<Flow />} />
            <RouterRoute path="/trip/:tripId" element={<Trip />} />
            <RouterRoute path="/trip/:tripId/events" element={<Events />} />
            <RouterRoute path="/trips" element={<Trips />} />
          </Routes>
        </AppShell.Main>
      </AppShell>
    </div>
  );
}
