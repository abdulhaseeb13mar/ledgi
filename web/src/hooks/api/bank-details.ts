import { bankDetailsKeys } from "./query-keys";
import {
  addBankDetail,
  deleteBankDetail,
  getBankDetails,
  getFriendBankDetails,
  updateBankDetail,
} from "@/services/firestore";
import type { BankDetail } from "@/types/user.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useBankDetailsQuery(userId: string | undefined) {
  return useQuery<BankDetail[]>({
    queryKey: bankDetailsKeys.list(userId!),
    queryFn: () => getBankDetails(userId!),
    enabled: !!userId,
  });
}

export function useFriendBankDetailsQuery(
  viewerId: string | undefined,
  friendId: string | undefined,
) {
  return useQuery<BankDetail[] | null>({
    queryKey: bankDetailsKeys.friendList(viewerId!, friendId!),
    queryFn: () => getFriendBankDetails(viewerId!, friendId!),
    enabled: !!viewerId && !!friendId,
  });
}

export function useAddBankDetailMutation(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { bankName: string; accountNumber: string; accountName: string }) =>
      addBankDetail(userId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bankDetailsKeys.list(userId!) });
    },
  });
}

export function useUpdateBankDetailMutation(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { bankName: string; accountNumber: string; accountName: string } }) =>
      updateBankDetail(userId!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bankDetailsKeys.list(userId!) });
    },
  });
}

export function useDeleteBankDetailMutation(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bankDetailId: string) => deleteBankDetail(userId!, bankDetailId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bankDetailsKeys.list(userId!) });
    },
  });
}
