import { useMemo } from "react";

import { PageHeader } from "@/components/PageHeader";
import { useDuesIOweQuery, useDuesOwedToMeQuery, useDuesPendingMyConfirmationQuery, useDuesPendingOthersConfirmationQuery } from "@/hooks/api";
import { useAuthContext } from "@/providers/auth.provider";
import { DEFAULT_CURRENCY } from "@/types/currency.types";
import { formatAmount } from "@/utils/format-currency";
import { Link } from "@tanstack/react-router";
import { ArrowDownLeft, ArrowUpRight, CheckCircle, Clock, Loader2, PlusCircle, Users } from "lucide-react";

function groupByCurrency(dues: { amount: number; currency?: string }[]): { currency: string; total: number }[] {
  const map = new Map<string, number>();
  for (const due of dues) {
    const c = due.currency ?? DEFAULT_CURRENCY;
    map.set(c, (map.get(c) ?? 0) + due.amount);
  }
  return Array.from(map.entries()).map(([currency, total]) => ({ currency, total }));
}

export default function DashboardPage() {
  const { user } = useAuthContext();
  const { data: duesIOwe = [], isFetching: isLoadingDuesIOwe } = useDuesIOweQuery(user?.uid);
  const { data: duesOwedToMe = [], isFetching: isLoadingDuesOwedToMe } = useDuesOwedToMeQuery(user?.uid);
  const { data: pendingConfirmations = [], isFetching: isLoadingPendingConfirmations } = useDuesPendingMyConfirmationQuery(user?.uid);
  const { data: pendingOthersConfirmations = [], isFetching: isLoadingPendingOthersConfirmations } = useDuesPendingOthersConfirmationQuery(user?.uid);

  const iOweTotals = useMemo(() => groupByCurrency(duesIOwe), [duesIOwe]);
  const owedToMeTotals = useMemo(() => groupByCurrency(duesOwedToMe), [duesOwedToMe]);

  return (
    <div>
      <PageHeader title="" />

      {/* Summary Cards */}

      <div className="mb-4 grid grid-cols-1 gap-3">
        <div className="rounded-xl bg-green-50 p-4">
          <div className="flex items-center gap-2 text-green-600">
            {isLoadingDuesOwedToMe ? <Loader2 size={18} className="animate-spin" /> : <ArrowDownLeft size={18} />}
            <span className="text-xs font-medium uppercase tracking-wide">Total Owed to You</span>
          </div>
          <div className="mt-2 flex flex-col gap-0.5">
            {owedToMeTotals.length === 0 ? (
              <p className="text-xl font-bold text-green-600">{formatAmount(0, DEFAULT_CURRENCY)}</p>
            ) : (
              owedToMeTotals.map((t) => (
                <p key={t.currency} className="text-xl font-bold text-green-600">
                  {formatAmount(t.total, t.currency)}
                </p>
              ))
            )}
          </div>
        </div>
        <div className="rounded-xl bg-red-50 p-4">
          <div className="flex items-center gap-2 text-red-500">
            {isLoadingDuesIOwe ? <Loader2 size={18} className="animate-spin" /> : <ArrowUpRight size={18} />}
            <span className="text-xs font-medium uppercase tracking-wide">Total You Owe</span>
          </div>
          <div className="mt-2 flex flex-col gap-0.5">
            {iOweTotals.length === 0 ? (
              <p className="text-xl font-bold text-red-600">{formatAmount(0, DEFAULT_CURRENCY)}</p>
            ) : (
              iOweTotals.map((t) => (
                <p key={t.currency} className="text-xl font-bold text-red-600">
                  {formatAmount(t.total, t.currency)}
                </p>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Link to="/dues/create" className="flex w-full items-center gap-3 rounded-xl bg-secondary p-4 text-white transition-colors hover:bg-[#01017e]/90">
          <PlusCircle size={22} />
          <div>
            <p className="font-semibold">Create a Due</p>
            <p className="text-xs text-white/70">Record a new due on other users</p>
          </div>
        </Link>

        <Link
          to="/friends"
          className="flex w-full items-center gap-3 rounded-xl border border-indigo-200 bg-white p-4 text-indigo-600 transition-colors hover:bg-indigo-50"
        >
          <Users size={22} />
          <div>
            <p className="font-semibold">Friends</p>
            <p className="text-xs text-indigo-400">Manage your friends list</p>
          </div>
        </Link>

        <Link
          to="/dues/owed"
          className="flex w-full items-center gap-3 rounded-xl border border-red-200 bg-white p-4 text-red-600 transition-colors hover:bg-red-50"
        >
          <ArrowUpRight size={22} />
          <div>
            <p className="font-semibold">Dues I Owe</p>
            <p className="text-xs text-red-400">View dues you owe to others</p>
          </div>
        </Link>

        <Link
          to="/dues/receivable"
          className="flex w-full items-center gap-3 rounded-xl border border-green-200 bg-white p-4 text-green-600 transition-colors hover:bg-green-50"
        >
          <ArrowDownLeft size={22} />
          <div>
            <p className="font-semibold">Dues Owed to Me</p>
            <p className="text-xs text-green-500">View what others owe you</p>
          </div>
        </Link>

        <Link
          to="/dues/confirm"
          className="relative flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-[#5f59f7] transition-colors hover:bg-gray-50"
        >
          {isLoadingPendingConfirmations ? <Loader2 size={22} className="animate-spin" /> : <CheckCircle size={22} />}
          <div>
            <p className="font-semibold">Confirm Resolved Dues</p>
            <p className="text-xs text-gray-500">Confirm dues that have been paid</p>
          </div>
          {pendingConfirmations.length > 0 && (
            <div className="absolute -right-1 -top-1 flex h-5.5 min-w-5.5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white shadow-sm ring-2 ring-white">
              {pendingConfirmations.length > 99 ? "99+" : pendingConfirmations.length}
            </div>
          )}
        </Link>

        <Link
          to="/dues/pending"
          className="relative flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-[#0159f8] transition-colors hover:bg-gray-50"
        >
          {isLoadingPendingOthersConfirmations ? <Loader2 size={22} className="animate-spin" /> : <Clock size={22} />}
          <div>
            <p className="font-semibold">Pending Confirmations</p>
            <p className="text-xs text-gray-500">Dues waiting for others to confirm</p>
          </div>
          {pendingOthersConfirmations.length > 0 && (
            <div className="absolute -right-1 -top-1 flex h-5.5 min-w-5.5 items-center justify-center rounded-full bg-secondary px-1.5 text-xs font-bold text-white shadow-sm ring-2 ring-white">
              {pendingOthersConfirmations.length > 99 ? "99+" : pendingOthersConfirmations.length}
            </div>
          )}
        </Link>
      </div>
    </div>
  );
}
