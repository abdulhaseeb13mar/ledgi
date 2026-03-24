import { HamburgerMenu } from "@/components/HamburgerMenu";
import { Outlet } from "@tanstack/react-router";

export default function DashboardLayout() {
  return (
    <div className="mx-auto min-h-screen max-w-[600px] bg-white">
      <HamburgerMenu />
      <main className="px-4 pb-6 pt-16">
        <Outlet />
      </main>
    </div>
  );
}
