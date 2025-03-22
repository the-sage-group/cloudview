import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { Combobox, Group, Text, useCombobox } from "@mantine/core";
import { Route, Handler, EntityType, Entity } from "@the-sage-group/awyes-web";
import {
  IconSearch,
  IconRoute,
  IconBolt,
  IconUser,
  IconBrandGithub,
} from "@tabler/icons-react";

import { useAwyes } from "../Context";

export function Search() {
  const { awyes } = useAwyes();
  const navigate = useNavigate();
  const combobox = useCombobox({});
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [options, setOptions] = useState<{ group: string; items: any[] }[]>([]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [value]);

  const mapEntity = (entity: Entity) => ({
    value: `${entity.name}-${EntityType[entity.type ?? 0]}`,
    label: `${entity.name}`,
    description: `${EntityType[entity.type ?? 0]}`,
    icon:
      entity.type === EntityType.USER ? (
        <IconUser size={18} />
      ) : (
        <IconBrandGithub size={18} />
      ),
    onClick: () => {
      navigate(
        `/trips?entity=${entity.name}&type=${EntityType[entity.type ?? 0]}`
      );
      combobox.closeDropdown();
    },
  });

  const mapRoute = (route: Route) => ({
    value: `${route.context}.${route.name}`,
    label: `${route.context}.${route.name}`,
    description: route.description || "",
    icon: <IconRoute size={18} />,
    onClick: () => {
      navigate(`/route/${route.context}/${route.name}`);
      combobox.closeDropdown();
    },
  });

  const mapHandler = (handler: Handler) => ({
    value: `${handler.context}.${handler.name}`,
    label: `${handler.context}.${handler.name}`,
    description: handler.description || "",
    icon: <IconBolt size={18} />,
    onClick: () => {},
  });

  async function handleSearch(query: string) {
    try {
      const { response } = await awyes.search({ query });
      const newOptions = [
        { group: "Routes", items: (response.routes ?? []).map(mapRoute) },
        { group: "Handlers", items: (response.handlers ?? []).map(mapHandler) },
        { group: "Entities", items: (response.entities ?? []).map(mapEntity) },
      ].filter((group) => group.items.length > 0);
      setOptions(newOptions);
    } catch (error) {
      console.error("Search failed:", error);
    }
  }

  const items = options.map((option) => (
    <Combobox.Group label={option.group} key={option.group}>
      {option.items.map((item) => (
        <Combobox.Option
          value={item.value}
          key={item.value}
          onClick={item.onClick}
        >
          <Group>
            {item.icon}
            <div>
              <Text>{item.label}</Text>
              {item.description && (
                <Text size="xs" c="dimmed">
                  {item.description}
                </Text>
              )}
            </div>
          </Group>
        </Combobox.Option>
      ))}
    </Combobox.Group>
  ));

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(val) => {
        const option = options
          .flatMap((group) => group.items)
          .find((item) => item.value === val);
        if (option) {
          option.onClick();
          setIsFocused(false);
          setValue("");
          combobox.closeDropdown();
        }
      }}
    >
      <Combobox.Target>
        <Group
          gap="xs"
          style={{
            cursor: "pointer",
            padding: "8px 16px",
            borderRadius: "var(--mantine-radius-md)",
            border: isFocused
              ? "1px solid var(--mantine-color-blue-5)"
              : "1px solid var(--mantine-color-gray-3)",
            width: "500px",
            backgroundColor: "white",
            boxShadow: isFocused
              ? "0 2px 6px rgba(37, 99, 235, 0.1)"
              : "0 2px 4px rgba(0, 0, 0, 0.05)",
            transition: "all 0.2s ease",
          }}
        >
          <IconSearch
            size={18}
            style={{
              color: isFocused
                ? "var(--mantine-color-blue-6)"
                : "var(--mantine-color-gray-6)",
            }}
          />
          <input
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              combobox.openDropdown();
            }}
            onClick={() => {
              setIsFocused(true);
              combobox.openDropdown();
            }}
            onFocus={() => {
              setIsFocused(true);
              combobox.openDropdown();
            }}
            onBlur={() => {
              setIsFocused(false);
              combobox.closeDropdown();
            }}
            placeholder="What are you looking for?"
            style={{
              border: "none",
              background: "none",
              outline: "none",
              flex: 1,
              color: "var(--mantine-color-gray-7)",
              fontSize: "14px",
            }}
          />
        </Group>
      </Combobox.Target>

      {items.length > 0 && (
        <Combobox.Dropdown>
          <Combobox.Options>
            {items.length > 0 && items}
            {items.length === 0 && value && (
              <Combobox.Empty>Nothing found...</Combobox.Empty>
            )}
          </Combobox.Options>
        </Combobox.Dropdown>
      )}
    </Combobox>
  );
}
