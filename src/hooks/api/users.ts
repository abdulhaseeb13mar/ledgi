import { usersKeys } from "./query-keys";
import { getUserById, getUsersByIds, searchUsers } from "@/services/firestore";
import { useQuery } from "@tanstack/react-query";

export function useSearchUsersQuery(searchQuery: string, currentUserId: string | undefined) {
  return useQuery({
    queryKey: usersKeys.search(searchQuery),
    queryFn: () => searchUsers(searchQuery, currentUserId!),
    enabled: !!searchQuery.trim() && !!currentUserId,
  });
}

export function useUserQuery(userId: string | undefined) {
  return useQuery({
    queryKey: usersKeys.detail(userId!),
    queryFn: () => getUserById(userId!),
    enabled: !!userId,
  });
}

export function useUsersByIdsQuery(uids: string[]) {
  return useQuery({
    queryKey: usersKeys.byIds(uids),
    queryFn: () => getUsersByIds(uids),
    enabled: uids.length > 0,
  });
}
