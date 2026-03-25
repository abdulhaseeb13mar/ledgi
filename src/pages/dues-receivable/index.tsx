import { useMemo } from "react";

import { PageHeader } from "@/components/PageHeader";
import { UserDueTile } from "@/components/UserDueTile";
import { useDuesOwedToMeQuery, useUsersByIdsQuery } from "@/hooks/api";
import { useAuthContext } from "@/providers/auth.provider";
import { DEFAULT_CURRENCY } from "@/types/currency.types";
import { useNavigate } from "@tanstack/react-router";

export default function DuesReceivablePage() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { data: dues = [], isLoading } = useDuesOwedToMeQuery(user?.uid);

  const grouped = useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    for (const due of dues) {
      const currency = due.currency ?? DEFAULT_CURRENCY;
      if (!map.has(due.owerId)) map.set(due.owerId, new Map());
      const currencyMap = map.get(due.owerId)!;
      currencyMap.set(currency, (currencyMap.get(currency) ?? 0) + due.amount);
    }
    return map;
  }, [dues]);

  const owerIds = useMemo(() => Array.from(grouped.keys()), [grouped]);
  const { data: users = [] } = useUsersByIdsQuery(owerIds);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#5f59f7] border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Dues Owed to Me" showBack />

      {owerIds.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-500">No one owes you anything</p>
      ) : (
        <div className="space-y-3">
          {owerIds.map((owerId) => {
            const u = users.find((usr) => usr.uid === owerId);
            const currencyMap = grouped.get(owerId) ?? new Map();
            const amounts = Array.from(currencyMap.entries()).map(([currency, total]) => ({ currency, total }));
            return (
              <UserDueTile
                key={owerId}
                name={u?.name ?? "Loading..."}
                email={u?.email ?? ""}
                amounts={amounts}
                variant="receivable"
                onClick={() =>
                  navigate({
                    to: "/dues/receivable/$userId",
                    params: { userId: owerId },
                  })
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
