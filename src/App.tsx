import { Suspense } from "react";

import { Toaster } from "@/components/ui/sonner";
import { Outlet } from "@tanstack/react-router";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#5f59f7] border-t-transparent" />
          </div>
        }
      >
        <Outlet />
      </Suspense>
      <Toaster position="top-center" />
    </div>
  );
}
