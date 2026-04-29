import {
  confirmResolve,
  createDues,
  getDuesIOwe,
  getDuesIOweToUser,
  getDuesOwedToMe,
  getDuesPendingMyConfirmation,
  getDuesPendingOthersConfirmation,
  getDuesUserOwesToMe,
  rejectResolve,
  requestResolve,
} from "@/services/firestore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { duesKeys } from "./query-keys";

export function useDuesIOweQuery(userId: string | undefined) {
  return useQuery({
    queryKey: duesKeys.iOwe(userId!),
    queryFn: () => getDuesIOwe(userId!),
    enabled: !!userId,
  });
}

export function useDuesOwedToMeQuery(userId: string | undefined) {
  return useQuery({
    queryKey: duesKeys.owedToMe(userId!),
    queryFn: () => getDuesOwedToMe(userId!),
    enabled: !!userId,
  });
}

export function useDuesIOweToUserQuery(
  myId: string | undefined,
  userId: string,
) {
  return useQuery({
    queryKey: duesKeys.iOweToUser(myId!, userId),
    queryFn: () => getDuesIOweToUser(myId!, userId),
    enabled: !!myId,
  });
}

export function useDuesUserOwesToMeQuery(
  myId: string | undefined,
  userId: string,
) {
  return useQuery({
    queryKey: duesKeys.userOwesToMe(myId!, userId),
    queryFn: () => getDuesUserOwesToMe(myId!, userId),
    enabled: !!myId,
  });
}

export function useDuesPendingMyConfirmationQuery(userId: string | undefined) {
  return useQuery({
    queryKey: duesKeys.pendingMyConfirmation(userId!),
    queryFn: () => getDuesPendingMyConfirmation(userId!),
    enabled: !!userId,
  });
}

export function useDuesPendingOthersConfirmationQuery(
  userId: string | undefined,
) {
  return useQuery({
    queryKey: duesKeys.pendingOthersConfirmation(userId!),
    queryFn: () => getDuesPendingOthersConfirmation(userId!),
    enabled: !!userId,
  });
}

export function useCreateDuesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      creatorId: string;
      entries: { owerId: string; amount: number }[];
      description: string;
      currency: string;
    }) =>
      createDues(args.creatorId, args.entries, args.description, args.currency),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: duesKeys.all });
    },
  });
}

export function useRequestResolveMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dueIds: string[]) => requestResolve(dueIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: duesKeys.all });
    },
  });
}

export function useConfirmResolveMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dueIds: string[]) => confirmResolve(dueIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: duesKeys.all });
    },
  });
}

export function useRejectResolveMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dueIds: string[]) => rejectResolve(dueIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: duesKeys.all });
    },
  });
}
