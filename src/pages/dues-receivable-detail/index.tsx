import { DueItem } from "@/components/DueItem";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDuesUserOwesToMeQuery, useUserQuery } from "@/hooks/api";
import { ScrollablePageLayout } from "@/layouts/ScrollablePageLayout";
import { useAuthContext } from "@/providers/auth.provider";
import { useParams } from "@tanstack/react-router";

export default function DuesReceivableDetailPage() {
  const { userId } = useParams({ strict: false }) as { userId: string };
  const { user } = useAuthContext();
  const { data: targetUser, refetch: refetchUser } = useUserQuery(userId);
  const { data: dues = [], isLoading, refetch: refetchDues } = useDuesUserOwesToMeQuery(user?.uid, userId);

  const refreshData = async () => {
    try {
      await Promise.all([refetchDues(), refetchUser()]);
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

  const activeDues = dues.filter((d) => d.status === "active");
  const resolveRequestedDues = dues.filter((d) => d.status === "resolve_requested");

  return (
    <ScrollablePageLayout
      headerProps={{
        title: `${targetUser?.name ?? "..."}'s Dues`,
        showBack: true,
        refreshFunction: refreshData,
      }}
    >
      {dues.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-500">No dues found</p>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="w-full grid-cols-2">
            <TabsTrigger value="active" className="flex-1">
              Active
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex-1">
              Requested
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {activeDues.length === 0 ? (
              <p className="py-12 text-center text-sm text-gray-500">No active dues found</p>
            ) : (
              <div className="space-y-2">
                {activeDues.map((due) => (
                  <DueItem key={due.id} due={due} variant="receivable" />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending">
            {resolveRequestedDues.length === 0 ? (
              <p className="py-12 text-center text-sm text-gray-500">No requested dues found</p>
            ) : (
              <div className="space-y-2">
                {resolveRequestedDues.map((due) => (
                  <DueItem key={due.id} due={due} variant="receivable" />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </ScrollablePageLayout>
  );
}
