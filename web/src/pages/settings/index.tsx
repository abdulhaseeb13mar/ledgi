import { useState } from "react";

import { PageHeader } from "@/components/PageHeader";
import { useUpdateUserCurrencyMutation } from "@/hooks/api";
import { useAuthContext } from "@/providers/auth.provider";
import { CURRENCIES, DEFAULT_CURRENCY } from "@/types/currency.types";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user, appUser, refreshAppUser } = useAuthContext();
  const updateCurrency = useUpdateUserCurrencyMutation(user?.uid ?? "");

  const [selectedCurrency, setSelectedCurrency] = useState<string>(appUser?.preferredCurrency ?? DEFAULT_CURRENCY);

  const handleSave = async () => {
    if (!user) return;
    try {
      await updateCurrency.mutateAsync(selectedCurrency);
      await refreshAppUser();
      toast.success("Currency updated!");
    } catch {
      toast.error("Failed to update currency");
    }
  };

  return (
    <div>
      <PageHeader title="Settings" showBack />

      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-sm font-semibold text-gray-700">Default Currency</h2>
          <p className="mb-4 text-xs text-gray-500">
            This will be the default currency when creating a new due. Each due stores its own currency, so existing dues are not affected.
          </p>

          <div className="flex flex-col gap-4">
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#5f59f7] focus:ring-2 focus:ring-[#5f59f7]/20"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.name} ({c.symbol})
                </option>
              ))}
            </select>

            <button
              onClick={handleSave}
              disabled={updateCurrency.isPending}
              className="w-full rounded-lg bg-[#01017e] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#01017e]/90 disabled:opacity-60"
            >
              {updateCurrency.isPending ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
