import { Checkbox } from "@/components/ui/checkbox";
import type { Due } from "@/types/due.types";
import { cn } from "@/utils/cn";
import { formatAmount } from "@/utils/format-currency";
import { formatDate } from "@/utils/format-date";

interface DueItemProps {
  due: Due;
  selectable?: boolean;
  selected?: boolean;
  onToggle?: (id: string) => void;
  showUser?: string;
}

export function DueItem({ due, selectable = false, selected = false, onToggle, showUser }: DueItemProps) {
  return (
    <div
      className={cn("flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm", selectable && "cursor-pointer hover:bg-gray-50")}
      onClick={() => selectable && onToggle?.(due.id)}
    >
      {selectable && <Checkbox checked={selected} onCheckedChange={() => onToggle?.(due.id)} className="mt-0.5" />}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900">{due.description}</p>
        {showUser && <p className="text-xs text-gray-500">{showUser}</p>}
        <p className="mt-1 text-xs text-gray-400">{formatDate(due.createdAt)}</p>
        {due.status === "resolve_requested" && (
          <span className="mt-1 inline-block rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">Resolve Requested</span>
        )}
      </div>
      <span className="text-base font-bold text-gray-900">{formatAmount(due.amount, due.currency)}</span>
    </div>
  );
}
