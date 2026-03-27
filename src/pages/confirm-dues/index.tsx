import { useMemo, useState } from "react";

import { DueItem } from "@/components/DueItem";
import { PageHeader } from "@/components/PageHeader";
import { useConfirmResolveMutation, useDuesPendingMyConfirmationQuery, useRejectResolveMutation, useUsersByIdsQuery } from "@/hooks/api";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/providers/auth.provider";
import { toast } from "sonner";

export default function ConfirmDuesPage() {
  const { user } = useAuthContext();
  const { data: dues = [], isLoading, refetch: refetchDues } = useDuesPendingMyConfirmationQuery(user?.uid);
  const confirmResolve = useConfirmResolveMutation();
  const rejectResolve = useRejectResolveMutation();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const owerIds = useMemo(() => [...new Set(dues.map((d) => d.owerId))], [dues]);
  const { data: users = [], refetch: refetchUsers } = useUsersByIdsQuery(owerIds);

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

  const handleReject = async () => {
    if (selectedIds.size === 0) {
      toast.error("Select at least one due");
      return;
    }
    try {
      await rejectResolve.mutateAsync(Array.from(selectedIds));
      setSelectedIds(new Set());
      toast.success("Resolve requests rejected");
    } catch {
      toast.error("Failed to reject requests");
    }
  };

  const refreshData = async () => {
    try {
      await Promise.all([refetchDues(), owerIds.length > 0 ? refetchUsers() : Promise.resolve()]);
      return true;
    } catch {
      return false;
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
      <PageHeader title="Confirm Resolved Dues" showBack refreshFunction={refreshData} />

      {dues.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-500">No dues pending your confirmation</p>
      ) : (
        <>
          <div className="space-y-2">
            {dues.map((due) => {
              const ower = users.find((u) => u.uid === due.owerId);
              return (
                <div key={due.id} className={cn("rounded-xl border-2 transition-colors", selectedIds.has(due.id) ? "border-[#5f59f7]" : "border-transparent")}>
                  <DueItem
                    due={due}
                    selectable
                    selected={selectedIds.has(due.id)}
                    onToggle={toggleSelection}
                    showUser={ower ? `${ower.name} (${ower.email})` : undefined}
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-2">
            <button
              onClick={handleReject}
              disabled={selectedIds.size === 0 || confirmResolve.isPending || rejectResolve.isPending}
              className="w-full rounded-xl bg-red-600 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {rejectResolve.isPending ? "Rejecting..." : `Reject ${selectedIds.size} Selected`}
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedIds.size === 0 || confirmResolve.isPending || rejectResolve.isPending}
              className="w-full rounded-xl bg-green-600 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              {confirmResolve.isPending ? "Confirming..." : `Confirm ${selectedIds.size} Selected`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
