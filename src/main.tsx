import { StrictMode } from "react";
import { BrowserRouter } from "react-router";
import { createRoot } from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { AwyesProvider, GitHubProvider } from "./Context";

import App from "./app/App.tsx";

import "@mantine/core/styles.css";
import "@mantine/spotlight/styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider>
      <GitHubProvider>
        <AwyesProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AwyesProvider>
      </GitHubProvider>
    </MantineProvider>
  </StrictMode>
);
