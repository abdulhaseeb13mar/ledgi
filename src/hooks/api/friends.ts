import { friendsKeys } from "./query-keys";
import { EMAIL_REGEX } from "@/constants/misc";
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
  const normalizedEmail = email.trim().toLowerCase();
  const isValidEmail = EMAIL_REGEX.test(normalizedEmail);

  return useQuery<AppUser | null>({
    queryKey: friendsKeys.searchByEmail(normalizedEmail),
    queryFn: () => searchUserByEmail(normalizedEmail, currentUserId!),
    enabled: isValidEmail && !!currentUserId,
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
