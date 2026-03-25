import { useMemo } from "react";

import { PageHeader } from "@/components/PageHeader";
import { UserDueTile } from "@/components/UserDueTile";
import { useDuesIOweQuery, useUsersByIdsQuery } from "@/hooks/api";
import { useAuthContext } from "@/providers/auth.provider";
import { DEFAULT_CURRENCY } from "@/types/currency.types";
import { useNavigate } from "@tanstack/react-router";

export default function DuesOwedPage() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { data: dues = [], isLoading } = useDuesIOweQuery(user?.uid);

  const grouped = useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    for (const due of dues) {
      const currency = due.currency ?? DEFAULT_CURRENCY;
      if (!map.has(due.creatorId)) map.set(due.creatorId, new Map());
      const currencyMap = map.get(due.creatorId)!;
      currencyMap.set(currency, (currencyMap.get(currency) ?? 0) + due.amount);
    }
    return map;
  }, [dues]);

  const creatorIds = useMemo(() => Array.from(grouped.keys()), [grouped]);
  const { data: users = [] } = useUsersByIdsQuery(creatorIds);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#5f59f7] border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Dues I Owe" showBack />

      {creatorIds.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-500">You don&apos;t owe anyone! 🎉</p>
      ) : (
        <div className="space-y-3">
          {creatorIds.map((creatorId) => {
            const u = users.find((usr) => usr.uid === creatorId);
            const currencyMap = grouped.get(creatorId) ?? new Map();
            const amounts = Array.from(currencyMap.entries()).map(([currency, total]) => ({ currency, total }));
            return (
              <UserDueTile
                key={creatorId}
                name={u?.name ?? "Loading..."}
                email={u?.email ?? ""}
                amounts={amounts}
                variant="owed"
                onClick={() => navigate({ to: "/dues/owed/$userId", params: { userId: creatorId } })}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
