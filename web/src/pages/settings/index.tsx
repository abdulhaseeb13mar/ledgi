import { useState } from "react";

import { PageHeader } from "@/components/PageHeader";
import {
  useAddBankDetailMutation,
  useBankDetailsQuery,
  useDeleteBankDetailMutation,
  useUpdateBankDetailMutation,
  useUpdateUserCurrencyMutation,
} from "@/hooks/api";
import { useAuthContext } from "@/providers/auth.provider";
import { CURRENCIES, DEFAULT_CURRENCY } from "@/types/currency.types";
import type { BankDetail } from "@/types/user.types";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

interface BankDetailFormState {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

const EMPTY_FORM: BankDetailFormState = {
  bankName: "",
  accountNumber: "",
  accountName: "",
};

export default function SettingsPage() {
  const { user, appUser, refreshAppUser } = useAuthContext();
  const updateCurrency = useUpdateUserCurrencyMutation(user?.uid ?? "");
  const { data: bankDetails = [], isFetching: bankDetailsLoading } = useBankDetailsQuery(user?.uid);
  const addBankDetail = useAddBankDetailMutation(user?.uid);
  const updateBankDetail = useUpdateBankDetailMutation(user?.uid);
  const deleteBankDetail = useDeleteBankDetailMutation(user?.uid);

  const [selectedCurrency, setSelectedCurrency] = useState<string>(appUser?.preferredCurrency ?? DEFAULT_CURRENCY);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<BankDetailFormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<BankDetailFormState>(EMPTY_FORM);

  const handleSaveCurrency = async () => {
    if (!user) return;
    try {
      await updateCurrency.mutateAsync(selectedCurrency);
      await refreshAppUser();
      toast.success("Currency updated!");
    } catch {
      toast.error("Failed to update currency");
    }
  };

  const handleAdd = async () => {
    if (!addForm.bankName.trim() || !addForm.accountNumber.trim() || !addForm.accountName.trim()) {
      toast.error("All fields are required");
      return;
    }
    try {
      await addBankDetail.mutateAsync(addForm);
      setAddForm(EMPTY_FORM);
      setShowAddForm(false);
      toast.success("Bank detail added");
    } catch {
      toast.error("Failed to add bank detail");
    }
  };

  const handleStartEdit = (detail: BankDetail) => {
    setEditingId(detail.id);
    setEditForm({
      bankName: detail.bankName,
      accountNumber: detail.accountNumber,
      accountName: detail.accountName,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    if (!editForm.bankName.trim() || !editForm.accountNumber.trim() || !editForm.accountName.trim()) {
      toast.error("All fields are required");
      return;
    }
    try {
      await updateBankDetail.mutateAsync({ id: editingId, data: editForm });
      setEditingId(null);
      toast.success("Bank detail updated");
    } catch {
      toast.error("Failed to update bank detail");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBankDetail.mutateAsync(id);
      toast.success("Bank detail deleted");
    } catch {
      toast.error("Failed to delete bank detail");
    }
  };

  return (
    <div>
      <PageHeader title="Settings" showBack />

      <div className="space-y-6">
        {/* Currency */}
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
              onClick={handleSaveCurrency}
              disabled={updateCurrency.isPending}
              className="w-full rounded-lg bg-[#01017e] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#01017e]/90 disabled:opacity-60"
            >
              {updateCurrency.isPending ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Bank Details */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Bank Details</h2>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-1.5 rounded-lg bg-[#01017e] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#01017e]/90"
              >
                <Plus size={13} />
                Add
              </button>
            )}
          </div>
          <p className="mb-4 text-xs text-gray-500">
            Your bank details are visible to friends who have added you to their friend list.
          </p>

          {/* Add Form */}
          {showAddForm && (
            <div className="mb-4 rounded-xl border border-[#5f59f7]/30 bg-indigo-50/50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">New Bank Detail</p>
                <button onClick={() => { setShowAddForm(false); setAddForm(EMPTY_FORM); }} className="rounded p-1 text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Bank Name</label>
                  <input
                    value={addForm.bankName}
                    onChange={(e) => setAddForm((f) => ({ ...f, bankName: e.target.value }))}
                    placeholder="e.g. HBL, Meezan Bank"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#5f59f7] focus:ring-2 focus:ring-[#5f59f7]/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Account Number / IBAN</label>
                  <input
                    value={addForm.accountNumber}
                    onChange={(e) => setAddForm((f) => ({ ...f, accountNumber: e.target.value }))}
                    placeholder="e.g. PK36SCBL0000001123456702"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#5f59f7] focus:ring-2 focus:ring-[#5f59f7]/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Account Name</label>
                  <input
                    value={addForm.accountName}
                    onChange={(e) => setAddForm((f) => ({ ...f, accountName: e.target.value }))}
                    placeholder="e.g. John Doe"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#5f59f7] focus:ring-2 focus:ring-[#5f59f7]/20"
                  />
                </div>
                <button
                  onClick={handleAdd}
                  disabled={addBankDetail.isPending}
                  className="w-full rounded-lg bg-[#01017e] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#01017e]/90 disabled:opacity-60"
                >
                  {addBankDetail.isPending ? "Adding…" : "Add Bank Detail"}
                </button>
              </div>
            </div>
          )}

          {/* List */}
          {bankDetailsLoading ? (
            <div className="py-6 text-center text-sm text-gray-400">Loading…</div>
          ) : bankDetails.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-8 text-center">
              <p className="text-sm text-gray-500">No bank details added yet</p>
              <p className="mt-1 text-xs text-gray-400">Add your bank details to share with friends</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bankDetails.map((detail) =>
                editingId === detail.id ? (
                  <div key={detail.id} className="rounded-xl border border-[#5f59f7]/30 bg-indigo-50/50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-700">Edit Bank Detail</p>
                      <button onClick={() => setEditingId(null)} className="rounded p-1 text-gray-400 hover:text-gray-600">
                        <X size={16} />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">Bank Name</label>
                        <input
                          value={editForm.bankName}
                          onChange={(e) => setEditForm((f) => ({ ...f, bankName: e.target.value }))}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#5f59f7] focus:ring-2 focus:ring-[#5f59f7]/20"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">Account Number / IBAN</label>
                        <input
                          value={editForm.accountNumber}
                          onChange={(e) => setEditForm((f) => ({ ...f, accountNumber: e.target.value }))}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#5f59f7] focus:ring-2 focus:ring-[#5f59f7]/20"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">Account Name</label>
                        <input
                          value={editForm.accountName}
                          onChange={(e) => setEditForm((f) => ({ ...f, accountName: e.target.value }))}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#5f59f7] focus:ring-2 focus:ring-[#5f59f7]/20"
                        />
                      </div>
                      <button
                        onClick={handleSaveEdit}
                        disabled={updateBankDetail.isPending}
                        className="w-full rounded-lg bg-[#01017e] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#01017e]/90 disabled:opacity-60"
                      >
                        {updateBankDetail.isPending ? "Saving…" : "Save Changes"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div key={detail.id} className="flex items-start justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{detail.bankName}</p>
                      <p className="mt-0.5 text-xs text-gray-500 font-mono">{detail.accountNumber}</p>
                      <p className="mt-0.5 text-xs text-gray-600">{detail.accountName}</p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        onClick={() => handleStartEdit(detail)}
                        className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 hover:text-[#5f59f7]"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(detail.id)}
                        disabled={deleteBankDetail.isPending}
                        className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50 disabled:opacity-60"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
