import { NavLink, ScrollArea, Text } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { useAwyes } from "../Context";
import { FlowGraphType } from "../types";

export function Navbar() {
  const navigate = useNavigate();
  const {
    flows,
    selectedFlow,
    setSelectedFlow,
    setSelectedTrip,
    setSelectedTripEvents,
    setSelectedNode,
  } = useAwyes();

  return (
    <ScrollArea>
      <div>
        <Text fw={500} size="sm" c="dimmed" mb="xs">
          Flows
        </Text>
        {flows.length === 0 ? (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              color: "var(--mantine-color-gray-6)",
            }}
          >
            No flows yet!
          </div>
        ) : (
          flows.map((flow: FlowGraphType, index: number) => (
            <NavLink
              key={index}
              label={flow.context + "." + flow.name}
              rightSection={<IconArrowRight size={16} />}
              active={flow.name === selectedFlow?.name}
              onClick={() => {
                setSelectedFlow(flow);
                setSelectedTrip(null);
                setSelectedTripEvents([]);
                setSelectedNode(null);
                navigate(`/route/${flow.context}/${flow.name}`);
              }}
              styles={{
                root: {
                  borderRadius: "var(--mantine-radius-sm)",
                  marginBottom: "0.5rem",
                },
              }}
            />
          ))
        )}
      </div>
    </ScrollArea>
  );
}
