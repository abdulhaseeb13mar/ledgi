import { useMemo, useState } from "react";

import { EMAIL_REGEX } from "@/constants/misc";
import { useAddFriendMutation, useFriendsQuery, useSearchUserByEmailQuery, useSearchUsersQuery } from "@/hooks/api";
import { useAuthContext } from "@/providers/auth.provider";
import type { AppUser } from "@/types/user.types";
import debounce from "lodash.debounce";
import { Plus, UserCheck, X } from "lucide-react";
import { toast } from "sonner";

interface UserSearchInputProps {
  selectedUsers: AppUser[];
  onSelect: (user: AppUser) => void;
  onRemove: (uid: string) => void;
}

interface SearchResult {
  user: AppUser;
  type: "friend" | "global" | "search";
  isFriend?: boolean;
}

export function UserSearchInput({ selectedUsers, onSelect, onRemove }: UserSearchInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [addedFriends, setAddedFriends] = useState<Set<string>>(new Set());
  const { user } = useAuthContext();

  const isValidEmailQuery = EMAIL_REGEX.test(searchQuery);

  const { data: friends = [] } = useFriendsQuery(user?.uid);
  const { data: globalResults = [], isLoading: isSearchLoading } = useSearchUsersQuery(isValidEmailQuery ? searchQuery : "", user?.uid);
  const { data: emailSearchResult, isLoading: isEmailSearchLoading } = useSearchUserByEmailQuery(searchQuery, user?.uid);
  const addFriendMutation = useAddFriendMutation(user?.uid);

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchQuery(value);
      }, 300),
    [],
  );

  const handleChange = (value: string) => {
    setInputValue(value);
    debouncedSearch(value);
  };

  const handleSelectUser = (selectedUser: AppUser) => {
    if (!selectedUsers.find((u) => u.uid === selectedUser.uid)) {
      onSelect(selectedUser);
    }
    setInputValue("");
    setSearchQuery("");
  };

  const handleAddFriend = async (friendUid: string) => {
    try {
      await addFriendMutation.mutateAsync(friendUid);
      setAddedFriends((prev) => new Set([...prev, friendUid]));
      toast.success("Friend added!");
    } catch {
      toast.error("Failed to add friend");
    }
  };

  // Build search results
  const getSearchResults = (): SearchResult[] => {
    if (!inputValue.trim()) return [];

    const results: SearchResult[] = [];
    const seen = new Set<string>();

    // Check if search looks like an email
    const isEmailSearch = inputValue.includes("@");

    // Add friends that match search
    friends.forEach((friend) => {
      if (friend.name.toLowerCase().includes(inputValue.toLowerCase()) || friend.email.toLowerCase().includes(inputValue.toLowerCase())) {
        if (!seen.has(friend.uid)) {
          results.push({ user: friend, type: "friend", isFriend: true });
          seen.add(friend.uid);
        }
      }
    });

    // If email search and result found globally, add it
    if (isEmailSearch && emailSearchResult && !seen.has(emailSearchResult.uid)) {
      const isFriend = friends.some((f) => f.uid === emailSearchResult.uid);
      if (!isFriend) {
        results.push({ user: emailSearchResult, type: "global", isFriend: false });
        seen.add(emailSearchResult.uid);
      }
    }

    // Add other global search results
    globalResults.forEach((result) => {
      if (!seen.has(result.uid)) {
        const isFriend = friends.some((f) => f.uid === result.uid);
        results.push({ user: result, type: "search", isFriend });
        seen.add(result.uid);
      }
    });

    return results;
  };

  const searchResults = getSearchResults();
  const filteredResults = searchResults.filter((r) => !selectedUsers.find((s) => s.uid === r.user.uid));
  const isLoading = isSearchLoading || isEmailSearchLoading;

  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search friends by name or email..."
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#5f59f7] focus:ring-2 focus:ring-[#5f59f7]/20"
        />

        {/* Dropdown Menu */}
        {inputValue && (
          <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
            {isLoading && (
              <div className="p-4 text-center text-sm text-gray-500">
                <span className="inline-block animate-spin">⌛</span> Loading...
              </div>
            )}

            {!isLoading && filteredResults.length > 0 ? (
              <div>
                {/* Group by type */}
                {filteredResults.some((r) => r.type === "friend") && (
                  <div>
                    <div className="border-b border-gray-100 px-4 py-2 text-xs font-semibold uppercase text-gray-500">Friends</div>
                    {filteredResults
                      .filter((r) => r.type === "friend")
                      .map(({ user: u }) => (
                        <button
                          key={u.uid}
                          type="button"
                          onClick={() => handleSelectUser(u)}
                          className="flex w-full flex-col px-4 py-3 text-left hover:bg-gray-50"
                        >
                          <span className="text-sm font-medium text-gray-900">{u.name}</span>
                          <span className="text-xs text-gray-500">{u.email}</span>
                        </button>
                      ))}
                  </div>
                )}

                {/* Global search results */}
                {filteredResults.some((r) => r.type === "global" || r.type === "search") && (
                  <div>
                    {filteredResults.some((r) => r.type === "friend") && (
                      <div className="border-b border-gray-100 px-4 py-2 text-xs font-semibold uppercase text-gray-500">Other Users</div>
                    )}
                    {filteredResults
                      .filter((r) => r.type === "global" || r.type === "search")
                      .map(({ user: u }) => (
                        <div key={u.uid} className="flex items-center justify-between gap-2 border-b border-gray-50 px-4 py-3 hover:bg-gray-50">
                          <button type="button" onClick={() => handleSelectUser(u)} className="min-w-0 flex-1 text-left">
                            <span className="text-sm font-medium text-gray-900">{u.name}</span>
                            <span className="block text-xs text-gray-500">{u.email}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddFriend(u.uid)}
                            disabled={addedFriends.has(u.uid) || addFriendMutation.isPending}
                            className="shrink-0 rounded-lg p-2 transition-colors hover:bg-[#5f59f7]/10 disabled:opacity-50"
                            title={addedFriends.has(u.uid) ? "Added to friends" : "Add as friend"}
                          >
                            {addedFriends.has(u.uid) ? <UserCheck size={16} className="text-green-500" /> : <Plus size={16} className="text-[#5f59f7]" />}
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ) : !isLoading && !!inputValue ? (
              <div className="p-4 text-center text-sm text-gray-500">No users found</div>
            ) : null}
          </div>
        )}
      </div>

      {/* Friends List - shown when no search query */}
      {!inputValue && friends.filter((f) => !selectedUsers.find((s) => s.uid === f.uid)).length > 0 && (
        <div className="pt-2">
          <p className="mb-3 text-xs font-semibold uppercase text-gray-500">Your Friends</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {friends
              .filter((f) => !selectedUsers.find((s) => s.uid === f.uid))
              .map((u) => (
                <button
                  key={u.uid}
                  type="button"
                  onClick={() => handleSelectUser(u)}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 text-left shadow-sm transition-colors hover:border-[#5f59f7]/30 hover:bg-[#5f59f7]/5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#5f59f7]/10 text-sm font-semibold text-[#5f59f7]">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{u.name}</p>
                    <p className="truncate text-xs text-gray-500">{u.email}</p>
                  </div>
                  <Plus size={16} className="text-gray-400" />
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Selected Users */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedUsers.map((u) => (
            <span key={u.uid} className="inline-flex items-center gap-1.5 rounded-full bg-[#5f59f7]/10 px-3 py-1.5 text-sm font-medium text-[#5f59f7]">
              {u.name}
              <button type="button" onClick={() => onRemove(u.uid)} className="rounded-full p-0.5 hover:bg-[#5f59f7]/20">
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
