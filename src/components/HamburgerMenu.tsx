import { useState } from "react";

import kamelHisaabLogo from "@/assets/svgs/kamel-hisaab-secondary.svg";
import { useAuthContext } from "@/providers/auth.provider";
import { signOut } from "@/utils/auth";
import { cn } from "@/utils/cn";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { CheckCircle, Clock, Home, LogOut, Menu, PlusCircle, Settings, Users, X } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/", icon: <Home size={20} /> },
  { label: "Friends", href: "/friends", icon: <Users size={20} /> },
  { label: "Create Due", href: "/dues/create", icon: <PlusCircle size={20} /> },
  {
    label: "Confirm Dues",
    href: "/dues/confirm",
    icon: <CheckCircle size={20} />,
  },
  {
    label: "Pending Confirmations",
    href: "/dues/pending",
    icon: <Clock size={20} />,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: <Settings size={20} />,
  },
];

export function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { appUser } = useAuthContext();

  const handleLogout = async () => {
    await signOut();
    setOpen(false);
    navigate({ to: "/login" });
  };

  return (
    <>
      {/* Header bar */}
      <header className="fixed top-0 z-40 flex h-14 w-full max-w-150 items-center justify-between bg-[#01017e] px-4">
        <button onClick={() => setOpen(true)} className="text-white" aria-label="Open menu">
          <Menu size={24} />
        </button>
        <img src={kamelHisaabLogo} alt="Kamel Hisaab" className="h-8 w-auto" />
        <div className="w-6" />
      </header>

      {/* Overlay */}
      {open && <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setOpen(false)} />}

      {/* Drawer */}
      <nav
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-white shadow-xl transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between bg-[#01017e] px-4 py-4">
          <div>
            <p className="font-bold text-white">{appUser?.name}</p>
            <p className="text-xs text-white/70">{appUser?.email}</p>
          </div>
          <button onClick={() => setOpen(false)} className="text-white" aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                  isActive ? "bg-[#5f59f7] text-white" : "text-gray-700 hover:bg-gray-100",
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="border-t p-3">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </nav>
    </>
  );
}
