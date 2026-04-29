import { useMemo, useState } from "react";

import { useAddFriendMutation, useFriendsQuery, useRemoveFriendMutation, useSearchUserByEmailQuery } from "@/hooks/api";
import { ScrollablePageLayout } from "@/layouts/ScrollablePageLayout";
import { useAuthContext } from "@/providers/auth.provider";
import debounce from "lodash.debounce";
import { Loader2, Search, UserMinus, UserPlus } from "lucide-react";
import { toast } from "sonner";

export default function FriendsPage() {
  const { user } = useAuthContext();
  const [inputValue, setInputValue] = useState("");
  const [searchEmail, setSearchEmail] = useState("");

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
              <div key={friend.uid} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{friend.name}</p>
                  <p className="text-xs text-gray-500">{friend.email}</p>
                </div>
                <button
                  onClick={() => handleRemove(friend.uid)}
                  disabled={removeFriend.isPending}
                  className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
                >
                  <UserMinus size={14} />
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </ScrollablePageLayout>
  );
}
