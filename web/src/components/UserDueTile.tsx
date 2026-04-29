import { cn } from "@/utils/cn";
import { formatAmount } from "@/utils/format-currency";
import { ChevronRight } from "lucide-react";

interface CurrencyTotal {
  currency: string;
  total: number;
}

interface UserDueTileProps {
  name: string;
  email: string;
  amounts: CurrencyTotal[];
  variant?: "owed" | "receivable";
  onClick?: () => void;
}

export function UserDueTile({ name, email, amounts, variant = "owed", onClick }: UserDueTileProps) {
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
        <div className={cn("flex flex-col items-end text-lg font-bold", variant === "owed" ? "text-red-500" : "text-green-600")}>
          {amounts.map((a) => (
            <span key={a.currency}>{formatAmount(a.total, a.currency)}</span>
          ))}
        </div>
        <ChevronRight size={18} className="text-gray-400" />
      </div>
    </button>
  );
}
