import { Badge, Group } from "@mantine/core";
import { useNavigate } from "react-router";
import { EntityType } from "@the-sage-group/awyes-web";
import { BADGE_COLORS } from "../constants/theme";

// Helper function to get badge color based on entity type
function getEntityBadgeColor(type: EntityType): string {
  switch (type) {
    case EntityType.REPOSITORY:
      return BADGE_COLORS.REPOSITORY;
    case EntityType.USER:
      return BADGE_COLORS.USER;
    default:
      return BADGE_COLORS.FIELD; // Default color for other entity types
  }
}

interface EntityProps {
  type: EntityType;
  name: string;
}

export function Entity({ type, name }: EntityProps) {
  const navigate = useNavigate();
  const badgeColor = getEntityBadgeColor(type);

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
      style={{ width: "fit-content", cursor: "pointer" }}
    >
      <Badge
        variant="dot"
        color={badgeColor}
        size="sm"
        styles={{
          label: {
            display: "flex",
            alignItems: "center",
            gap: "4px",
          },
        }}
      >
        <span style={{ fontWeight: 600 }}>{EntityType[type]}:</span>
        <span
          style={{
            fontWeight: 600,
            color: `var(--mantine-color-${badgeColor}-6)`,
          }}
        >
          {name}
        </span>
      </Badge>
    </div>
  );
}
