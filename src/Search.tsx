import { useState } from "react";
import {
  TextInput,
  Paper,
  Text,
  Group,
  UnstyledButton,
  rem,
  Box,
  Transition,
  Loader,
} from "@mantine/core";
import {
  IconSearch,
  IconRoute,
  IconCalendarEvent,
  IconPlane,
  IconMapPin,
} from "@tabler/icons-react";
import { useClickOutside } from "@mantine/hooks";

interface SearchResult {
  id: string;
  type: "route" | "event" | "trip" | "position";
  title: string;
  description: string;
}

export function Search() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const clickOutsideRef = useClickOutside(() => setFocused(false));

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (value.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    // TODO: Implement actual search logic here
    // Mock results for now
    setTimeout(() => {
      setResults([
        {
          id: "1",
          type: "route",
          title: "Payment Processing",
          description: "Main payment flow",
        },
        {
          id: "2",
          type: "event",
          title: "Payment Completed",
          description: "Transaction success event",
        },
        {
          id: "3",
          type: "trip",
          title: "Checkout Flow",
          description: "User checkout journey",
        },
        {
          id: "4",
          type: "position",
          title: "Position",
          description: "Position",
        },
      ]);
      setLoading(false);
    }, 300);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "route":
        return <IconRoute size={18} />;
      case "event":
        return <IconCalendarEvent size={18} />;
      case "trip":
        return <IconPlane size={18} />;
      case "position":
        return <IconMapPin size={18} />;
      default:
        return <IconSearch size={18} />;
    }
  };

  return (
    <Box
      ref={clickOutsideRef}
      style={{ position: "relative", width: "100%", maxWidth: "600px" }}
    >
      <TextInput
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => setFocused(true)}
        size="md"
        radius="md"
        leftSection={<IconSearch size={18} />}
        rightSection={loading && <Loader size="xs" />}
        placeholder="Search routes, events, trips..."
        styles={{
          input: {
            "&:focus": {
              borderColor: "var(--mantine-color-blue-filled)",
            },
          },
        }}
      />

      <Transition
        mounted={focused && (query.length > 0 || loading)}
        transition="pop-top-left"
        duration={200}
      >
        {(styles) => (
          <Paper
            shadow="md"
            p="md"
            radius="md"
            style={{
              ...styles,
              position: "absolute",
              top: "calc(100% + 5px)",
              left: 0,
              right: 0,
              zIndex: 1000,
            }}
          >
            {loading ? (
              <Group justify="center" p="md">
                <Loader size="sm" />
              </Group>
            ) : results.length > 0 ? (
              results.map((result) => (
                <UnstyledButton
                  key={result.id}
                  p="xs"
                  style={{
                    width: "100%",
                    borderRadius: rem(4),
                    "&:hover": {
                      backgroundColor: "var(--mantine-color-gray-0)",
                    },
                  }}
                >
                  <Group wrap="nowrap">
                    <Box style={{ color: "var(--mantine-color-blue-6)" }}>
                      {getIcon(result.type)}
                    </Box>
                    <div>
                      <Text size="sm" fw={500}>
                        {result.title}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {result.description}
                      </Text>
                    </div>
                  </Group>
                </UnstyledButton>
              ))
            ) : (
              <Text c="dimmed" ta="center">
                No results found
              </Text>
            )}
          </Paper>
        )}
      </Transition>
    </Box>
  );
}
