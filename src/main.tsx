import { StrictMode } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import { createRoot } from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { AwyesProvider } from "./Context";

import App from "./App.tsx";

import "@mantine/core/styles.css";
import "@mantine/spotlight/styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider>
      <AwyesProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/route/:routeName" element={<App />} />
            <Route path="/trip/:tripId" element={<App />} />
            <Route path="/trip/:tripId/events" element={<App />} />
          </Routes>
        </BrowserRouter>
      </AwyesProvider>
    </MantineProvider>
  </StrictMode>
);
