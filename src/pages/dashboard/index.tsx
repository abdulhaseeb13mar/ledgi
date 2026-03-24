import { PageHeader } from "@/components/PageHeader";
import { useDuesIOweQuery, useDuesOwedToMeQuery } from "@/hooks/api";
import { useAuthContext } from "@/providers/auth.provider";
import { Link } from "@tanstack/react-router";
import { ArrowDownLeft, ArrowUpRight, CheckCircle, Clock, PlusCircle } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuthContext();
  const { data: duesIOwe = [] } = useDuesIOweQuery(user?.uid);
  const { data: duesOwedToMe = [] } = useDuesOwedToMeQuery(user?.uid);

  const totalIOwe = duesIOwe.reduce((sum, d) => sum + d.amount, 0);
  const totalOwedToMe = duesOwedToMe.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div>
      <PageHeader title="Dashboard" />

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-red-50 p-4">
          <div className="flex items-center gap-2 text-red-500">
            <ArrowUpRight size={18} />
            <span className="text-xs font-medium uppercase tracking-wide">You Owe</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-red-600">${totalIOwe.toFixed(2)}</p>
        </div>

        <div className="rounded-xl bg-green-50 p-4">
          <div className="flex items-center gap-2 text-green-600">
            <ArrowDownLeft size={18} />
            <span className="text-xs font-medium uppercase tracking-wide">Owed to You</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-green-600">${totalOwedToMe.toFixed(2)}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Link to="/dues/create" className="flex w-full items-center gap-3 rounded-xl bg-[#01017e] p-4 text-white transition-colors hover:bg-[#01017e]/90">
          <PlusCircle size={22} />
          <div>
            <p className="font-semibold">Create a Due</p>
            <p className="text-xs text-white/70">Record a new due on other users</p>
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
          className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-[#5f59f7] transition-colors hover:bg-gray-50"
        >
          <CheckCircle size={22} />
          <div>
            <p className="font-semibold">Confirm Resolved Dues</p>
            <p className="text-xs text-gray-500">Confirm dues that have been paid</p>
          </div>
        </Link>

        <Link
          to="/dues/pending"
          className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-[#0159f8] transition-colors hover:bg-gray-50"
        >
          <Clock size={22} />
          <div>
            <p className="font-semibold">Pending Confirmations</p>
            <p className="text-xs text-gray-500">Dues waiting for others to confirm</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
