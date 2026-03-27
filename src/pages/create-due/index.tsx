import { useState } from "react";

import { UserSearchInput } from "@/components/UserSearchInput";
import { useCreateDuesMutation } from "@/hooks/api";
import { ScrollablePageLayout } from "@/layouts/ScrollablePageLayout";
import { useAuthContext } from "@/providers/auth.provider";
import { CURRENCIES, DEFAULT_CURRENCY } from "@/types/currency.types";
import type { AppUser } from "@/types/user.types";
import { useNavigate } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function CreateDuePage() {
  const { user, appUser } = useAuthContext();
  const navigate = useNavigate();
  const createDues = useCreateDuesMutation();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState<string>(appUser?.preferredCurrency ?? DEFAULT_CURRENCY);
  const [selectedUsers, setSelectedUsers] = useState<AppUser[]>([]);
  const [userAmounts, setUserAmounts] = useState<Record<string, string>>({});

  const handleSelect = (u: AppUser) => {
    setSelectedUsers((prev) => [...prev, u]);
    setUserAmounts((prev) => ({ ...prev, [u.uid]: amount }));
  };

  const handleRemove = (uid: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.uid !== uid));
    setUserAmounts((prev) => {
      const next = { ...prev };
      delete next[uid];
      return next;
    });
  };

  const handleApplyToAll = () => {
    if (!amount) {
      toast.error("Enter an amount first");
      return;
    }
    const updated: Record<string, string> = {};
    for (const u of selectedUsers) {
      updated[u.uid] = amount;
    }
    setUserAmounts(updated);
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error("Enter a description");
      return;
    }
    if (selectedUsers.length === 0) {
      toast.error("Select at least one user");
      return;
    }

    const entries = selectedUsers.map((u) => ({
      owerId: u.uid,
      amount: parseFloat(userAmounts[u.uid] || "0"),
    }));

    if (entries.some((e) => !e.amount || e.amount <= 0)) {
      toast.error("All amounts must be greater than 0");
      return;
    }

    try {
      await createDues.mutateAsync({
        creatorId: user!.uid,
        entries,
        description: description.trim(),
        currency,
      });
      toast.success("Dues created!");
      navigate({ to: "/" });
    } catch {
      toast.error("Failed to create dues");
    }
  };

  const renderSubmitSection = () => (
    <button
      onClick={handleSubmit}
      disabled={createDues.isPending}
      className="w-full rounded-xl bg-[#01017e] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#01017e]/90 disabled:opacity-50"
    >
      {createDues.isPending ? "Creating..." : "Create Due"}
    </button>
  );

  return (
    <ScrollablePageLayout headerProps={{ title: "Create Due", showBack: true }} submitSection={renderSubmitSection()}>
      <div className="space-y-5">
        {/* Description */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Dinner at restaurant"
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#5f59f7] focus:ring-2 focus:ring-[#5f59f7]/20"
          />
        </div>

        {/* Amount + Currency */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Amount</label>
          <div className="flex gap-2">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-3 text-sm outline-none focus:border-[#5f59f7] focus:ring-2 focus:ring-[#5f59f7]/20"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="min-w-0 flex-1 rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#5f59f7] focus:ring-2 focus:ring-[#5f59f7]/20"
            />
          </div>
        </div>

        {/* User Search */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Select Users</label>
          <UserSearchInput selectedUsers={selectedUsers} onSelect={handleSelect} onRemove={handleRemove} />
        </div>

        {/* Selected Users with individual amounts */}
        {selectedUsers.length > 0 && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">User Amounts</label>
              <button
                type="button"
                onClick={handleApplyToAll}
                className="rounded-lg bg-[#5f59f7]/10 px-3 py-1.5 text-xs font-medium text-[#5f59f7] hover:bg-[#5f59f7]/20"
              >
                Apply {currency} {amount || "0"} to all
              </button>
            </div>
            <div className="space-y-2">
              {selectedUsers.map((u) => (
                <div key={u.uid} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{u.name}</p>
                    <p className="truncate text-xs text-gray-500">{u.email}</p>
                  </div>
                  <input
                    type="number"
                    value={userAmounts[u.uid] ?? ""}
                    onChange={(e) =>
                      setUserAmounts((prev) => ({
                        ...prev,
                        [u.uid]: e.target.value,
                      }))
                    }
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-right text-sm outline-none focus:border-[#5f59f7]"
                  />
                  <button type="button" onClick={() => handleRemove(u.uid)} className="p-1 text-red-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ScrollablePageLayout>
  );
}
