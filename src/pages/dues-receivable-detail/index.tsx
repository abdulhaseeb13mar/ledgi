import { DueItem } from "@/components/DueItem";
import { PageHeader } from "@/components/PageHeader";
import { useDuesUserOwesToMeQuery, useUserQuery } from "@/hooks/api";
import { useAuthContext } from "@/providers/auth.provider";
import { useParams } from "@tanstack/react-router";

export default function DuesReceivableDetailPage() {
  const { userId } = useParams({ strict: false }) as { userId: string };
  const { user } = useAuthContext();
  const { data: targetUser } = useUserQuery(userId);
  const { data: dues = [], isLoading } = useDuesUserOwesToMeQuery(user?.uid, userId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#5f59f7] border-t-transparent" />
      </div>
    );
  }

  const activeDues = dues.filter((d) => d.status === "active");
  const resolveRequestedDues = dues.filter((d) => d.status === "resolve_requested");

  return (
    <div>
      <PageHeader title={`${targetUser?.name ?? "..."}'s Dues`} showBack />

      {dues.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-500">No dues found</p>
      ) : (
        <>
          {activeDues.length > 0 && (
            <div className="mb-4">
              <h2 className="mb-2 text-sm font-semibold text-gray-500">Active Dues</h2>
              <div className="space-y-2">
                {activeDues.map((due) => (
                  <DueItem key={due.id} due={due} />
                ))}
              </div>
            </div>
          )}

          {resolveRequestedDues.length > 0 && (
            <div className="mb-4">
              <h2 className="mb-2 text-sm font-semibold text-gray-500">Resolve Requested</h2>
              <div className="space-y-2">
                {resolveRequestedDues.map((due) => (
                  <DueItem key={due.id} due={due} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
