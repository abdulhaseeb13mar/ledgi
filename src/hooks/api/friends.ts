import { friendsKeys } from "./query-keys";
import { addFriend, getFriendIds, getUsersByIds, removeFriend, searchUserByEmail } from "@/services/firestore";
import type { AppUser } from "@/types/user.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useFriendsQuery(userId: string | undefined) {
  return useQuery<AppUser[]>({
    queryKey: friendsKeys.list(userId!),
    queryFn: async () => {
      const ids = await getFriendIds(userId!);
      if (ids.length === 0) return [];
      return getUsersByIds(ids);
    },
    enabled: !!userId,
  });
}

export function useSearchUserByEmailQuery(email: string, currentUserId: string | undefined) {
  return useQuery<AppUser | null>({
    queryKey: friendsKeys.searchByEmail(email),
    queryFn: () => searchUserByEmail(email, currentUserId!),
    enabled: !!email.trim() && !!currentUserId,
  });
}

export function useAddFriendMutation(currentUserId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (friendUid: string) => addFriend(currentUserId!, friendUid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendsKeys.list(currentUserId!) });
    },
  });
}

export function useRemoveFriendMutation(currentUserId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (friendUid: string) => removeFriend(currentUserId!, friendUid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendsKeys.list(currentUserId!) });
    },
  });
}
