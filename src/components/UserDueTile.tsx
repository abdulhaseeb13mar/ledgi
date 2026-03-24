import { cn } from "@/utils/cn";
import { ChevronRight } from "lucide-react";

interface UserDueTileProps {
  name: string;
  email: string;
  amount: number;
  variant?: "owed" | "receivable";
  onClick?: () => void;
}

export function UserDueTile({ name, email, amount, variant = "owed", onClick }: UserDueTileProps) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl border border-gray-100 bg-white p-4 text-left shadow-sm transition-colors hover:bg-gray-50"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-gray-900">{name}</p>
        <p className="truncate text-sm text-gray-500">{email}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className={cn("text-lg font-bold", variant === "owed" ? "text-red-500" : "text-green-600")}>${amount.toFixed(2)}</span>
        <ChevronRight size={18} className="text-gray-400" />
      </div>
    </button>
  );
}
