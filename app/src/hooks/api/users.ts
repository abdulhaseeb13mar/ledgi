import {
  getUserById,
  getUsersByIds,
  searchUsers,
  updateUserCurrency,
} from "@/services/firestore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersKeys } from "./query-keys";

export function useSearchUsersQuery(
  searchQuery: string,
  currentUserId: string | undefined,
) {
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

export function useUpdateUserCurrencyMutation(uid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (currency: string) => updateUserCurrency(uid, currency),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(uid) });
    },
  });
}
