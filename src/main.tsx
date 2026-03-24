import { StrictMode } from "react";

import "./index.css";
import { router } from "./router";
import { AuthProvider } from "@/providers/auth.provider";
import QueryClientProvider from "@/providers/query.provider";
import { RouterProvider } from "@tanstack/react-router";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
