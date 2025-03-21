import { Badge } from "@mantine/core";
import {
  FieldDescriptorProto,
  FieldDescriptorProto_Label,
  FieldDescriptorProto_Type,
} from "@the-sage-group/awyes-web";
import { BADGE_COLORS } from "../constants/theme";

interface FieldProps {
  field: FieldDescriptorProto;
}

export function Field({ field }: FieldProps) {
  const fieldType = FieldDescriptorProto_Type[field.type!];
  const isRepeated = field.label === FieldDescriptorProto_Label.REPEATED;

  return (
    <Badge
      variant="dot"
      color={BADGE_COLORS.FIELD}
      size="sm"
      styles={{
        label: {
          display: "flex",
          alignItems: "center",
          gap: "4px",
        },
      }}
    >
      <span style={{ fontWeight: 600 }}>{field.name}:</span>
      <span
        style={{
          color: "var(--mantine-color-blue-6)",
          fontWeight: 600,
        }}
      >
        {fieldType}
        {isRepeated ? "[]" : ""}
      </span>
    </Badge>
  );
}
