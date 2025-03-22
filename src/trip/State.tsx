import { useState } from "react";
import {
  Paper,
  Title,
  Group,
  Text,
  ScrollArea,
  Table,
  Code,
} from "@mantine/core";
import { IconChevronUp } from "@tabler/icons-react";
import { useAwyes } from "../Context";

export function State() {
  const { selectedTrip } = useAwyes();
  const [showState, setShowState] = useState(false);
  if (!selectedTrip) return null;

  return (
    <Paper
      shadow="sm"
      radius="md"
      withBorder
      style={{
        position: "absolute",
        bottom: 0,
        left: "7rem",
        right: "7rem",
        zIndex: 1000,
        backgroundColor: "var(--mantine-color-body)",
        transform: `translateY(${showState ? "0" : "calc(100% - 2.5rem))"})`,
        transition: "transform 0.3s ease",
      }}
    >
      <Group
        p="xs"
        style={{
          cursor: "pointer",
          borderBottom: showState
            ? "1px solid var(--mantine-color-gray-3)"
            : "none",
        }}
        onClick={() => setShowState(!showState)}
      >
        <Title order={5} style={{ flex: 1 }}>
          Trip State
        </Title>
        <Group gap="xs">
          <Text size="sm" c="dimmed">
            {Object.keys(selectedTrip.state).length} variables
          </Text>
          <IconChevronUp
            size={16}
            style={{
              transform: `rotate(${showState ? "0deg" : "180deg"})`,
              transition: "transform 0.3s ease",
            }}
          />
        </Group>
      </Group>
      <div
        style={{
          height: showState ? "auto" : 0,
          maxHeight: "30vh",
          transition: "max-height 0.3s ease",
          overflow: "hidden",
        }}
      >
        <ScrollArea p="md">
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: "200px" }}>Key</Table.Th>
                <Table.Th>Value</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {Object.entries(selectedTrip.state).map(([key, value]) => (
                <Table.Tr key={key}>
                  <Table.Td>
                    <Text fw={500}>{key}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Code block>{new TextDecoder().decode(value)}</Code>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </div>
    </Paper>
  );
}
