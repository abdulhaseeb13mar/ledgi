import { Suspense } from "react";

import { Toaster } from "@/components/ui/sonner";
import { Outlet, useRouterState } from "@tanstack/react-router";

// A small top loading bar or full-screen loader for soft navigations
function RouterSpinner() {
  const isLoading = useRouterState({ select: (s) => s.status === "pending" });
  if (!isLoading) return null;
  return (
    <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-white/50 backdrop-blur-sm">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-[#5f59f7]"></div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <RouterSpinner />
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-[#5f59f7]"></div>
          </div>
        }
      >
        <Outlet />
      </Suspense>
      <Toaster position="top-center" />
    </>
  );
}
