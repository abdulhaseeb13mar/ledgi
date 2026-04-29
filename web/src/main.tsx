import { StrictMode } from "react";

import "./index.css";
import { router } from "./router";
import { AuthProvider } from "@/providers/auth.provider";
import QueryClientProvider from "@/providers/query.provider";
import { RouterProvider } from "@tanstack/react-router";
import { createRoot } from "react-dom/client";

const rootElement = document.getElementById("root")!;
const bootLoader = document.getElementById("boot-loader");

const hideBootLoader = () => {
  if (!bootLoader || !bootLoader.isConnected) return;

  bootLoader.classList.add("is-hidden");
  window.setTimeout(() => {
    bootLoader.remove();
  }, 200);
};

if (bootLoader) {
  const observer = new MutationObserver(() => {
    if (rootElement.childElementCount > 0) {
      observer.disconnect();
      // Let the first committed app frame paint before removing the shell loader.
      window.requestAnimationFrame(hideBootLoader);
    }
  });

  observer.observe(rootElement, { childList: true, subtree: true });

  // Fallback in case initial content is already present.
  if (rootElement.childElementCount > 0) {
    observer.disconnect();
    window.requestAnimationFrame(hideBootLoader);
  }
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
