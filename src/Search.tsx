import { useContext } from "react";
import { Spotlight, SpotlightActionData } from "@mantine/spotlight";
import {
  IconSearch,
  IconRoute,
  IconMapPin,
  IconBolt,
} from "@tabler/icons-react";
import { SearchContext, FlowContext } from "./Context";
import { Route, Position, Handler } from "@the-sage-group/awyes-web";
import { useNavigate } from "react-router";
import { toFlowNode } from "./types";

export function Search() {
  const navigate = useNavigate();
  const { setSelectedNode, flows, setSelectedFlow, selectedFlow } =
    useContext(FlowContext);
  const { routes, handlers, positions } = useContext(SearchContext);

  const findRouteByPosition = (positionName: string): Route | undefined => {
    return routes.find((route) =>
      route.positions?.some((pos) => pos.name === positionName)
    );
  };

  const mapRoute = (route: Route): SpotlightActionData => ({
    id: route.name || "",
    label: route.name || "",
    description: route.description || "",
    leftSection: <IconRoute size={18} />,
    group: "Routes",
    onClick: () => {
      if (route.name) {
        navigate(`/route/${route.name}`);
      }
    },
  });

  const mapPosition = (position: Position): SpotlightActionData => {
    const route = position.name
      ? findRouteByPosition(position.name)
      : undefined;
    return {
      id: position.name || "",
      label: position.name || "",
      description: route?.name ? `Route: ${route.name}` : "",
      leftSection: <IconMapPin size={18} />,
      group: "Positions",
      onClick: () => {
        if (route?.name) {
          navigate(`/route/${route.name}`);

          // Find the node in the flow, then set it as the selected node
          const matchingFlow = flows.find((flow) => flow.name === route.name);
          if (matchingFlow) {
            const matchingNode = matchingFlow.nodes.find(
              (node) => node.data.name === position.name
            );
            if (matchingNode) {
              setSelectedNode(matchingNode);
            }
          }
        }
      },
    };
  };

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
          const newNode = toFlowNode({
            name: `${context}.${name}`,
            handler: handler,
          });
          setSelectedFlow({
            ...selectedFlow,
            nodes: [...selectedFlow.nodes, newNode],
          });
        }
      },
    };
  };

  const actions: SpotlightActionData[] = [
    ...routes.map(mapRoute),
    ...positions.map(mapPosition),
    ...handlers.map(mapHandler),
  ];

  return (
    <Spotlight
      actions={actions}
      searchProps={{
        placeholder: "Search routes, positions, handlers...",
        leftSection: <IconSearch size={16} style={{ color: "#228be6" }} />,
      }}
      shortcut="mod + k"
      nothingFound="Nothing found..."
      highlightQuery
      scrollable
      styles={{
        action: {
          "&[data-selected]": {
            backgroundColor: "#e7f5ff",
          },
        },
      }}
    />
  );
}
