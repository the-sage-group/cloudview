import { useContext } from "react";
import { Spotlight, SpotlightActionData } from "@mantine/spotlight";
import { IconSearch, IconRoute, IconBolt, IconUser } from "@tabler/icons-react";
import { SearchContext, FlowContext } from "./Context";
import {
  Route,
  Handler,
  Trip,
  EntityType,
  Entity,
} from "@the-sage-group/awyes-web";
import { useNavigate } from "react-router";
import { toFlowNode } from "./types";

export function Search() {
  const navigate = useNavigate();
  const { setSelectedNode, setSelectedFlow, selectedFlow, flows } =
    useContext(FlowContext);
  const { routes, handlers, trips } = useContext(SearchContext);

  // Get unique entities from trips
  const entities = Array.from(
    new Set(
      trips
        .filter((trip) => trip.entity?.name && trip.entity?.type != null)
        .map((trip) => JSON.stringify(trip.entity))
    )
  ).map((entity) => JSON.parse(entity));

  const mapEntity = (entity: Entity): SpotlightActionData => {
    const type = EntityType[entity.type ?? 0];
    const name = entity.name ?? "";
    return {
      id: `${name}-${type}`,
      label: `${type}:${name}`,
      leftSection: <IconUser size={18} />,
      group: "Entities",
      onClick: () => {
        navigate(`/trips?entity=${type}:${name}`);
      },
    };
  };

  const mapRoute = (route: Route): SpotlightActionData => ({
    id: route.name || "",
    label: route.name || "",
    description: route.description || "",
    leftSection: <IconRoute size={18} />,
    group: "Routes",
    onClick: () => {
      if (route.name) {
        const matchingFlow = flows.find((flow) => flow.name === route.name);
        setSelectedFlow(matchingFlow || null);
        navigate(`/route/${route.name}`);
      }
    },
  });

  const mapHandler = (handler: Handler): SpotlightActionData => {
    const context = handler.context || "";
    const name = handler.name || "";
    return {
      id: `${context}.${name}`,
      label: `${context}.${name}`,
      description: handler.description || "",
      leftSection: <IconBolt size={18} />,
      group: "Handlers",
      onClick: () => {
        if (selectedFlow) {
          const newNode = toFlowNode({ handler });
          setSelectedNode(newNode);
          setSelectedFlow({
            ...selectedFlow,
            nodes: [...selectedFlow.nodes, newNode],
          });
        }
      },
    };
  };

  return (
    <Spotlight
      actions={[
        ...routes.map(mapRoute),
        ...handlers.map(mapHandler),
        ...entities.map(mapEntity),
      ]}
      searchProps={{
        placeholder: "Search for anything...",
        leftSection: <IconSearch size={16} style={{ color: "#228be6" }} />,
      }}
      shortcut="mod + k"
      nothingFound="Nothing found..."
      highlightQuery
      scrollable
    />
  );
}
