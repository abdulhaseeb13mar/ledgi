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
  const [splitMode, setSplitMode] = useState<"split" | "applyAll" | null>(null);

  const applyMode = (users: AppUser[], totalAmt: string, mode: "split" | "applyAll") => {
    const updated: Record<string, string> = {};
    if (mode === "split") {
      const split = (parseFloat(totalAmt) / users.length).toFixed(2);
      for (const u of users) updated[u.uid] = split;
    } else {
      for (const u of users) updated[u.uid] = totalAmt;
    }
    setUserAmounts(updated);
  };

  const handleAmountChange = (val: string) => {
    setAmount(val);
    if (!val) {
      setUserAmounts({});
      return;
    }
    if (splitMode && parseFloat(val) > 0 && selectedUsers.length > 0) {
      applyMode(selectedUsers, val, splitMode);
    }
  };

  const handleSelect = (u: AppUser) => {
    const newUsers = [...selectedUsers, u];
    setSelectedUsers(newUsers);
    if (splitMode && amount && parseFloat(amount) > 0) {
      applyMode(newUsers, amount, splitMode);
    } else {
      setUserAmounts((prev) => ({ ...prev, [u.uid]: amount }));
    }
  };

  const handleRemove = (uid: string) => {
    const newUsers = selectedUsers.filter((u) => u.uid !== uid);
    setSelectedUsers(newUsers);
    if (splitMode && amount && parseFloat(amount) > 0 && newUsers.length > 0) {
      applyMode(newUsers, amount, splitMode);
    } else {
      setUserAmounts((prev) => {
        const next = { ...prev };
        delete next[uid];
        return next;
      });
    }
  };

  const handleApplyToAll = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Enter a total amount first");
      return;
    }
    const newMode = splitMode === "applyAll" ? null : "applyAll";
    setSplitMode(newMode);
    if (newMode === "applyAll" && selectedUsers.length > 0) {
      applyMode(selectedUsers, amount, "applyAll");
    }
  };

  const handleSplitAmount = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Enter a total amount first");
      return;
    }
    const newMode = splitMode === "split" ? null : "split";
    setSplitMode(newMode);
    if (newMode === "split" && selectedUsers.length > 0) {
      applyMode(selectedUsers, amount, "split");
    }
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
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Total Amount</label>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={handleSplitAmount}
                className={`rounded-lg border-2 px-2.5 py-1 text-xs font-medium transition-colors ${splitMode === "split" ? "border-[#5f59f7] bg-[#5f59f7] text-white" : "border-transparent bg-[#5f59f7]/10 text-[#5f59f7] hover:bg-[#5f59f7]/20"}`}
              >
                Split amount
              </button>
              <button
                type="button"
                onClick={handleApplyToAll}
                className={`rounded-lg border-2 px-2.5 py-1 text-xs font-medium transition-colors ${splitMode === "applyAll" ? "border-[#5f59f7] bg-[#5f59f7] text-white" : "border-transparent bg-[#5f59f7]/10 text-[#5f59f7] hover:bg-[#5f59f7]/20"}`}
              >
                Apply to all
              </button>
            </div>
          </div>
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
              onChange={(e) => handleAmountChange(e.target.value)}
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
            <div className="mb-2">
              <label className="text-sm font-medium text-gray-700">User Amounts</label>
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
