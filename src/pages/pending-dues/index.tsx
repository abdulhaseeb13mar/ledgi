import { useMemo } from "react";

import { DueItem } from "@/components/DueItem";
import { PageHeader } from "@/components/PageHeader";
import { useDuesPendingOthersConfirmationQuery, useUsersByIdsQuery } from "@/hooks/api";
import { useAuthContext } from "@/providers/auth.provider";

export default function PendingDuesPage() {
  const { user } = useAuthContext();
  const { data: dues = [], isLoading, refetch: refetchDues } = useDuesPendingOthersConfirmationQuery(user?.uid);

  const creatorIds = useMemo(() => [...new Set(dues.map((d) => d.creatorId))], [dues]);
  const { data: users = [], refetch: refetchUsers } = useUsersByIdsQuery(creatorIds);

  const refreshData = async () => {
    try {
      await Promise.all([refetchDues(), creatorIds.length > 0 ? refetchUsers() : Promise.resolve()]);
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
      <PageHeader title="Pending Confirmations" showBack refreshFunction={refreshData} />

      {dues.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-500">No dues pending confirmation</p>
      ) : (
        <div className="space-y-2">
          {dues.map((due) => {
            const creator = users.find((u) => u.uid === due.creatorId);
            return <DueItem key={due.id} due={due} showUser={creator ? `Waiting for ${creator.name} (${creator.email})` : undefined} />;
          })}
        </div>
      )}
    </div>
  );
}
