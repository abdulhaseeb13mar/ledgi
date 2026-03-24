import { useMemo, useState } from "react";

import { useSearchUsersQuery } from "@/hooks/api";
import { useAuthContext } from "@/providers/auth.provider";
import type { AppUser } from "@/types/user.types";
import debounce from "lodash.debounce";
import { X } from "lucide-react";

interface UserSearchInputProps {
  selectedUsers: AppUser[];
  onSelect: (user: AppUser) => void;
  onRemove: (uid: string) => void;
}

export function UserSearchInput({ selectedUsers, onSelect, onRemove }: UserSearchInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuthContext();

  const { data: results = [], isLoading } = useSearchUsersQuery(searchQuery, user?.uid);

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

  const handleSelect = (selectedUser: AppUser) => {
    if (!selectedUsers.find((u) => u.uid === selectedUser.uid)) {
      onSelect(selectedUser);
    }
    setInputValue("");
    setSearchQuery("");
  };

  const filteredResults = results.filter((r) => !selectedUsers.find((s) => s.uid === r.uid));

  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search users by name or email..."
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#5f59f7] focus:ring-2 focus:ring-[#5f59f7]/20"
        />
        {inputValue && filteredResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
            {filteredResults.map((u) => (
              <button key={u.uid} type="button" onClick={() => handleSelect(u)} className="flex w-full flex-col px-4 py-3 text-left hover:bg-gray-50">
                <span className="text-sm font-medium text-gray-900">{u.name}</span>
                <span className="text-xs text-gray-500">{u.email}</span>
              </button>
            ))}
          </div>
        )}
        {inputValue && !isLoading && filteredResults.length === 0 && searchQuery && (
          <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-gray-200 bg-white p-4 text-center text-sm text-gray-500 shadow-lg">
            No users found
          </div>
        )}
      </div>

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
