import { Badge } from "@mantine/core";
import { useNavigate } from "react-router";
import {
  EntityType,
  Entity,
  Handler,
  Trip,
  Route,
  FieldDescriptorProto,
  FieldDescriptorProto_Type,
  FieldDescriptorProto_Label,
  Position,
} from "@the-sage-group/awyes-web";
import { BADGE_COLORS } from "../constants/theme";

export enum IdentifierType {
  HANDLER = "handler",
  ROUTE = "route",
  TRIP = "trip",
  FIELD = "field",
  ENTITY = "entity",
  POSITION = "position",
}
// Type for all the message types the Identifier can handle
type IdentifierEntity =
  | { type: IdentifierType.HANDLER; data: Pick<Handler, "name" | "context"> }
  | { type: IdentifierType.ROUTE; data: Pick<Route, "name" | "context"> }
  | { type: IdentifierType.TRIP; data: Pick<Trip, "id"> }
  | { type: IdentifierType.FIELD; data: FieldDescriptorProto }
  | { type: IdentifierType.ENTITY; data: Entity }
  | { type: IdentifierType.POSITION; data: Pick<Position, "name"> };

// Helper function to get badge color based on message type
function getBadgeColor(entity: IdentifierEntity): string {
  switch (entity.type) {
    case IdentifierType.HANDLER:
      return BADGE_COLORS.HANDLER;
    case IdentifierType.ROUTE:
      return BADGE_COLORS.ROUTE;
    case IdentifierType.TRIP:
      return BADGE_COLORS.TRIP;
    case IdentifierType.ENTITY:
      return BADGE_COLORS.ENTITY;
    case IdentifierType.POSITION:
      return BADGE_COLORS.POSITION;
    default:
      return BADGE_COLORS.DEFAULT;
  }
}

// Helper function to get display label
function getDisplayLabel(entity: IdentifierEntity): string {
  switch (entity.type) {
    case IdentifierType.HANDLER:
      return `${entity.data.context}.${entity.data.name}`;
    case IdentifierType.ROUTE:
      return `${entity.data.context}.${entity.data.name}`;
    case IdentifierType.TRIP:
      return entity.data.id?.slice(0, 8) || "";
    case IdentifierType.ENTITY:
      return entity.data.name || "";
    case IdentifierType.POSITION:
      return entity.data.name || "";
    case IdentifierType.FIELD:
      return entity.data.jsonName
        ? entity.data.jsonName
        : FieldDescriptorProto_Type[entity.data.type!] +
            (entity.data.label === FieldDescriptorProto_Label.REPEATED
              ? "[]"
              : "");
    default:
      return "";
  }
}

// Helper function to get type label
function getTypeLabel(entity: IdentifierEntity): string {
  switch (entity.type) {
    case IdentifierType.HANDLER:
      return "HANDLER";
    case IdentifierType.ROUTE:
      return "ROUTE";
    case IdentifierType.TRIP:
      return "TRIP";
    case IdentifierType.ENTITY:
      return EntityType[entity.data.type!];
    case IdentifierType.FIELD:
      return entity.data.name || "";
    case IdentifierType.POSITION:
      return "POSITION";
    default:
      return "";
  }
}

// Helper function to handle navigation
function handleNavigation(
  navigate: ReturnType<typeof useNavigate>,
  entity: IdentifierEntity
): void {
  switch (entity.type) {
    case IdentifierType.HANDLER:
      // Navigate to handler (if applicable)
      break;
    case IdentifierType.POSITION:
      // Navigate to position (if applicable)
      break;
    case IdentifierType.ROUTE:
      navigate(`/route/${entity.data.context}/${entity.data.name}`);
      break;
    case IdentifierType.TRIP:
      navigate(`/trip/${entity.data.id}`);
      break;
    case IdentifierType.ENTITY:
      if (entity.data.type !== undefined && entity.data.name) {
        navigate({
          pathname: "/trips",
          search: `?${new URLSearchParams({
            entity: entity.data.name,
            type: EntityType[entity.data.type],
          })}`,
        });
      }
      break;

    default:
      break;
  }
}

export function Identifier(identifier: IdentifierEntity) {
  const navigate = useNavigate();
  const badgeColor = getBadgeColor(identifier);
  const displayLabel = getDisplayLabel(identifier);
  const typeLabel = getTypeLabel(identifier);

  return (
    <Badge
      variant="default"
      color={badgeColor}
      onClick={() => handleNavigation(navigate, identifier)}
      size="sm"
      style={{ cursor: "pointer" }}
      styles={{
        label: {
          display: "flex",
          alignItems: "center",
          gap: "4px",
        },
      }}
    >
      <span style={{ fontWeight: 600, color: "black" }}>{typeLabel}:</span>
      <span
        style={{
          fontWeight: 600,
          color: `var(--mantine-color-${badgeColor}-6)`,
        }}
      >
        {displayLabel}
      </span>
    </Badge>
  );
}
