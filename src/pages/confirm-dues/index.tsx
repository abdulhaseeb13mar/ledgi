import { useMemo, useState } from "react";

import { DueItem } from "@/components/DueItem";
import { PageHeader } from "@/components/PageHeader";
import { useConfirmResolveMutation, useDuesPendingMyConfirmationQuery, useUsersByIdsQuery } from "@/hooks/api";
import { useAuthContext } from "@/providers/auth.provider";
import { toast } from "sonner";

export default function ConfirmDuesPage() {
  const { user } = useAuthContext();
  const { data: dues = [], isLoading } = useDuesPendingMyConfirmationQuery(user?.uid);
  const confirmResolve = useConfirmResolveMutation();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const owerIds = useMemo(() => [...new Set(dues.map((d) => d.owerId))], [dues]);
  const { data: users = [] } = useUsersByIdsQuery(owerIds);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirm = async () => {
    if (selectedIds.size === 0) {
      toast.error("Select at least one due");
      return;
    }
    try {
      await confirmResolve.mutateAsync(Array.from(selectedIds));
      setSelectedIds(new Set());
      toast.success("Dues confirmed as resolved!");
    } catch {
      toast.error("Failed to confirm");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#5f59f7] border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Confirm Resolved Dues" showBack />

      {dues.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-500">No dues pending your confirmation</p>
      ) : (
        <>
          <div className="space-y-2">
            {dues.map((due) => {
              const ower = users.find((u) => u.uid === due.owerId);
              return (
                <DueItem
                  key={due.id}
                  due={due}
                  selectable
                  selected={selectedIds.has(due.id)}
                  onToggle={toggleSelection}
                  showUser={ower ? `${ower.name} (${ower.email})` : undefined}
                />
              );
            })}
          </div>

          <button
            onClick={handleConfirm}
            disabled={selectedIds.size === 0 || confirmResolve.isPending}
            className="mt-4 w-full rounded-xl bg-green-600 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
          >
            {confirmResolve.isPending ? "Confirming..." : `Confirm ${selectedIds.size} Selected`}
          </button>
        </>
      )}
    </div>
  );
}
