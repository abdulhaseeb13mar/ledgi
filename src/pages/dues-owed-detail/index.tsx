import { useState } from "react";

import { DueItem } from "@/components/DueItem";
import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDuesIOweToUserQuery, useRequestResolveMutation, useUserQuery } from "@/hooks/api";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/providers/auth.provider";
import { useParams } from "@tanstack/react-router";
import { toast } from "sonner";

export default function DuesOwedDetailPage() {
  const { userId } = useParams({ strict: false }) as { userId: string };
  const { user } = useAuthContext();
  const { data: targetUser } = useUserQuery(userId);
  const { data: dues = [], isLoading } = useDuesIOweToUserQuery(user?.uid, userId);
  const requestResolve = useRequestResolveMutation();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const activeDues = dues.filter((d) => d.status === "active");
  const resolveRequestedDues = dues.filter((d) => d.status === "resolve_requested");

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleRequestConfirm = async () => {
    if (selectedIds.size === 0) {
      toast.error("Select at least one due");
      return;
    }
    try {
      await requestResolve.mutateAsync(Array.from(selectedIds));
      setSelectedIds(new Set());
      toast.success("Resolve request sent!");
    } catch {
      toast.error("Failed to send request");
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
      <PageHeader title={`Dues to ${targetUser?.name ?? "..."}`} showBack />

      {dues.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-500">No dues found</p>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="w-full grid-cols-2">
            <TabsTrigger value="active" className="flex-1">
              Active
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex-1">
              Pending Confirmation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {activeDues.length === 0 ? (
              <p className="py-12 text-center text-sm text-gray-500">No active dues found</p>
            ) : (
              <div className="space-y-2">
                {activeDues.map((due) => (
                  <div
                    key={due.id}
                    className={cn("rounded-xl border-2 transition-colors", selectedIds.has(due.id) ? "border-[#5f59f7]" : "border-transparent")}
                  >
                    <DueItem due={due} selectable selected={selectedIds.has(due.id)} onToggle={toggleSelection} />
                  </div>
                ))}
              </div>
            )}

            {activeDues.length > 0 && (
              <button
                onClick={handleRequestConfirm}
                disabled={selectedIds.size === 0 || requestResolve.isPending}
                className="mt-4 w-full rounded-xl bg-[#5f59f7] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#4e48e0] disabled:opacity-50"
              >
                {requestResolve.isPending ? "Sending..." : `Request ${targetUser?.name ?? "User"} to Confirm Paid`}
              </button>
            )}
          </TabsContent>

          <TabsContent value="pending">
            {resolveRequestedDues.length === 0 ? (
              <p className="py-12 text-center text-sm text-gray-500">No pending dues found</p>
            ) : (
              <div className="space-y-2">
                {resolveRequestedDues.map((due) => (
                  <DueItem key={due.id} due={due} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
