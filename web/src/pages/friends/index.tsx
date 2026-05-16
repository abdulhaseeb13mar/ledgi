import { useMemo, useState } from "react";

import { useAddFriendMutation, useFriendBankDetailsQuery, useFriendsQuery, useRemoveFriendMutation, useSearchUserByEmailQuery } from "@/hooks/api";
import { ScrollablePageLayout } from "@/layouts/ScrollablePageLayout";
import { useAuthContext } from "@/providers/auth.provider";
import type { AppUser } from "@/types/user.types";
import debounce from "lodash.debounce";
import { Check, Copy, Landmark, Loader2, Search, UserMinus, UserPlus, X } from "lucide-react";
import { toast } from "sonner";

function BankDetailsModal({ viewer, friend, onClose }: { viewer: AppUser; friend: AppUser; onClose: () => void }) {
  const { data: bankDetails, isFetching } = useFriendBankDetailsQuery(viewer.uid, friend.uid);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (accountNumber: string, id: string) => {
    await navigator.clipboard.writeText(accountNumber);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative w-full max-w-sm rounded-2xl border border-gray-200 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">{friend.name}'s Bank Details</p>
            <p className="text-xs text-gray-500">{friend.email}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {isFetching ? (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-400">
              <Loader2 size={16} className="animate-spin" />
              Loading…
            </div>
          ) : bankDetails === null ? (
            <div className="rounded-xl bg-amber-50 px-4 py-5 text-center">
              <p className="text-sm font-medium text-amber-700">Not accessible</p>
              <p className="mt-1 text-xs text-amber-600">
                {friend.name} hasn't added you as a friend yet. Bank details are only visible when you're both friends.
              </p>
            </div>
          ) : bankDetails?.length === 0 ? (
            <div className="rounded-xl bg-gray-50 px-4 py-5 text-center">
              <p className="text-sm text-gray-500">{friend.name} hasn't added any bank details yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bankDetails?.map((detail) => (
                <div key={detail.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-900">{detail.bankName}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="flex-1 font-mono text-xs text-gray-500">{detail.accountNumber}</p>
                    <button
                      onClick={() => handleCopy(detail.accountNumber, detail.id)}
                      className="shrink-0 rounded p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
                      title="Copy account number"
                    >
                      {copiedId === detail.id ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                    </button>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-600">{detail.accountName}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FriendsPage() {
  const { user, appUser } = useAuthContext();
  const [inputValue, setInputValue] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [bankDetailsFriend, setBankDetailsFriend] = useState<AppUser | null>(null);

  const { data: friends = [], isFetching: friendsLoading } = useFriendsQuery(user?.uid);
  const { data: searchResult, isFetching: searchLoading } = useSearchUserByEmailQuery(searchEmail, user?.uid);
  const addFriend = useAddFriendMutation(user?.uid);
  const removeFriend = useRemoveFriendMutation(user?.uid);

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchEmail(value);
      }, 300),
    [],
  );

  const handleChange = (value: string) => {
    setInputValue(value);
    debouncedSearch(value);
  };

  const isFriend = (uid: string) => friends.some((f) => f.uid === uid);

  const handleAdd = async (friendUid: string) => {
    try {
      await addFriend.mutateAsync(friendUid);
      setInputValue("");
      setSearchEmail("");
      toast.success("Friend added!");
    } catch {
      toast.error("Failed to add friend");
    }
  };

  const handleRemove = async (friendUid: string) => {
    try {
      await removeFriend.mutateAsync(friendUid);
      toast.success("Friend removed");
    } catch {
      toast.error("Failed to remove friend");
    }
  };

  return (
    <ScrollablePageLayout headerProps={{ title: "Friends", showBack: true }}>
      {/* Search Section */}
      <div className="mb-6">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            value={inputValue}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Search by email address..."
            className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-[#5f59f7] focus:ring-2 focus:ring-[#5f59f7]/20"
          />
        </div>

        {/* Search Result */}
        {searchEmail && searchLoading && (
          <div className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
            <Loader2 size={16} className="animate-spin" />
            Searching...
          </div>
        )}

        {searchEmail && !searchLoading && searchResult && (
          <div className="mt-3 flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">{searchResult.name}</p>
              <p className="text-xs text-gray-500">{searchResult.email}</p>
            </div>
            {isFriend(searchResult.uid) ? (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">Already added</span>
            ) : (
              <button
                onClick={() => handleAdd(searchResult.uid)}
                disabled={addFriend.isPending}
                className="flex items-center gap-1.5 rounded-lg bg-[#01017e] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#01017e]/90 disabled:opacity-60"
              >
                <UserPlus size={14} />
                {addFriend.isPending ? "Adding…" : "Add Friend"}
              </button>
            )}
          </div>
        )}

        {searchEmail && !searchLoading && !searchResult && (
          <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4 text-center text-sm text-gray-500">No users found with this email</div>
        )}
      </div>

      {/* Friends List */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Your Friends ({friends.length})</h2>

        {friendsLoading ? (
          <div className="py-8 text-center text-sm text-gray-400">Loading…</div>
        ) : friends.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-8 text-center">
            <p className="text-sm text-gray-500">No friends added yet</p>
            <p className="mt-1 text-xs text-gray-400">Search by email to add friends</p>
          </div>
        ) : (
          <div className="space-y-2">
            {friends.map((friend) => (
              <div key={friend.uid} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900">{friend.name}</p>
                  <p className="text-xs text-gray-500">{friend.email}</p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    onClick={() => setBankDetailsFriend(friend)}
                    title="View bank details"
                    className="rounded-lg border border-indigo-200 p-2 text-indigo-600 transition-colors hover:bg-indigo-50"
                  >
                    <Landmark size={15} />
                  </button>
                  <button
                    onClick={() => handleRemove(friend.uid)}
                    disabled={removeFriend.isPending}
                    title="Remove friend"
                    className="rounded-lg border border-red-200 p-2 text-red-500 transition-colors hover:bg-red-50 disabled:opacity-60"
                  >
                    <UserMinus size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bank Details Modal */}
      {bankDetailsFriend && appUser && <BankDetailsModal viewer={appUser} friend={bankDetailsFriend} onClose={() => setBankDetailsFriend(null)} />}
    </ScrollablePageLayout>
  );
}
