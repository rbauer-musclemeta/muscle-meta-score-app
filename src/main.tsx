import { createRoot } from "react-dom/client";
import { AppRouter } from "@/app/router";
import { AppProviders } from "@/app/providers/AppProviders";
import "@/styles/global.css";

createRoot(document.getElementById("root")!).render(
  <AppProviders>
    <AppRouter />
  </AppProviders>
);

