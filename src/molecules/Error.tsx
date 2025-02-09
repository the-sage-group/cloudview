import { Title, Text, Button } from "@mantine/core";
import { ReactNode } from "react";

interface ErrorProps {
  title: string;
  message: string;
  action?: ReactNode;
}

export function Error({ title, message, action }: ErrorProps) {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        color: "var(--mantine-color-gray-6)",
      }}
    >
      <Title order={2}>{title}</Title>
      <Text>{message}</Text>
      {action}
    </div>
  );
} 