import { Outlet } from "@tanstack/react-router";

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#01017e] px-4">
      <div className="w-full max-w-[600px]">
        <Outlet />
      </div>
    </div>
  );
}
