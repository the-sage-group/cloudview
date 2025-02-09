import { Badge, Group } from "@mantine/core";
import { useNavigate } from "react-router";
import { EntityType } from "@the-sage-group/awyes-web";

interface EntityProps {
  type: EntityType;
  name: string;
}

export function Entity({ type, name }: EntityProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => {
        navigate({
          pathname: "/trips",
          search: `?${new URLSearchParams({
            entity: name,
            type: EntityType[type],
          })}`,
        });
      }}
      style={{ width: "fit-content" }}
    >
      <Badge
        size="sm"
        radius={0}
        variant="outline"
        color="gray"
        style={{ padding: 0, cursor: "pointer" }}
      >
        <Group gap={0} wrap="nowrap">
          <div
            style={{
              padding: "0.125rem 0.25rem",
              backgroundColor: "var(--mantine-color-gray-1)",
              color: "var(--mantine-color-gray-7)",
              fontWeight: 500,
            }}
          >
            {EntityType[type]}
          </div>
          <div
            style={{
              padding: "0.125rem 0.25rem",
              backgroundColor: "var(--mantine-color-blue-1)",
              color: "var(--mantine-color-blue-7)",
              fontWeight: 500,
              borderLeft: "1px solid var(--mantine-color-blue-3)",
            }}
          >
            {name}
          </div>
        </Group>
      </Badge>
    </div>
  );
} 