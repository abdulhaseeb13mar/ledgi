import { useState } from "react";

import { cn } from "@/lib/utils";
import { ArrowLeft, RotateCw } from "lucide-react";
import { toast } from "sonner";

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  refreshFunction?: () => Promise<boolean>;
  titleClassName?: string;
}

export function PageHeader({ title, showBack = false, refreshFunction, titleClassName }: PageHeaderProps) {
  const [refreshing, setRefreshing] = useState(false);
  const triggerRefresh = async () => {
    if (refreshFunction) {
      setRefreshing(true);
      const successRefresh = await refreshFunction();
      if (!successRefresh) {
        toast.error("Failed to refresh data");
      }
      setRefreshing(false);
    }
  };
  return (
    <div className="mb-2 flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        {showBack && (
          <button onClick={() => window.history.back()} className="rounded-lg p-1 text-gray-600 hover:bg-gray-100">
            <ArrowLeft size={22} />
          </button>
        )}
        <h1 className={cn("truncate text-xl font-bold text-primary", titleClassName)}>{title}</h1>
      </div>
      {refreshFunction && (
        <button
          onClick={triggerRefresh}
          disabled={refreshing}
          className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Refresh dues"
          title="Refresh"
        >
          <RotateCw size={16} className={cn(refreshing && "animate-spin")} />
        </button>
      )}
    </div>
  );
}
