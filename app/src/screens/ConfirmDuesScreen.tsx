import AppLayout from "@/components/AppLayout";
import DueItem from "@/components/DueItem";
import LoadingSpinner from "@/components/LoadingSpinner";
import PageHeader from "@/components/PageHeader";
import {
  colors,
  fontSize,
  fontWeight,
  radius,
  spacing,
} from "@/constants/theme";
import {
  useConfirmResolveMutation,
  useDuesPendingMyConfirmationQuery,
  useRejectResolveMutation,
  useUsersByIdsQuery,
} from "@/hooks/api";
import { useAuthContext } from "@/providers/auth.provider";
import type { RootStackParamList } from "@/navigation/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

type Props = NativeStackScreenProps<RootStackParamList, "ConfirmDues">;

export default function ConfirmDuesScreen({ navigation }: Props) {
  const { user } = useAuthContext();
  const {
    data: dues = [],
    isLoading,
    refetch: refetchDues,
  } = useDuesPendingMyConfirmationQuery(user?.uid);
  const confirmResolve = useConfirmResolveMutation();
  const rejectResolve = useRejectResolveMutation();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const owerIds = useMemo(
    () => [...new Set(dues.map((d) => d.owerId))],
    [dues],
  );
  const { data: users = [], refetch: refetchUsers } =
    useUsersByIdsQuery(owerIds);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onRefresh = async () => {
    await Promise.all([
      refetchDues(),
      owerIds.length > 0 ? refetchUsers() : Promise.resolve(),
    ]);
  };

  const handleConfirm = async () => {
    if (selectedIds.size === 0) {
      Toast.show({ type: "error", text1: "Select at least one due" });
      return;
    }
    try {
      await confirmResolve.mutateAsync(Array.from(selectedIds));
      setSelectedIds(new Set());
      Toast.show({ type: "success", text1: "Dues confirmed as resolved!" });
    } catch {
      Toast.show({ type: "error", text1: "Failed to confirm" });
    }
  };

  const handleReject = async () => {
    if (selectedIds.size === 0) {
      Toast.show({ type: "error", text1: "Select at least one due" });
      return;
    }
    try {
      await rejectResolve.mutateAsync(Array.from(selectedIds));
      setSelectedIds(new Set());
      Toast.show({ type: "success", text1: "Resolve requests rejected" });
    } catch {
      Toast.show({ type: "error", text1: "Failed to reject requests" });
    }
  };

  if (isLoading) return <LoadingSpinner />;

  const isMutating = confirmResolve.isPending || rejectResolve.isPending;

  return (
    <AppLayout navigation={navigation} currentRoute="ConfirmDues">
      <PageHeader
        title="Confirm Resolved Dues"
        showBack
        refreshFunction={onRefresh}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {dues.length === 0 ? (
          <Text style={styles.empty}>No dues pending confirmation</Text>
        ) : (
          <View style={styles.list}>
            {dues.map((due) => {
              const ower = users.find((u) => u.uid === due.owerId);
              return (
                <DueItem
                  key={due.id}
                  due={due}
                  selectable
                  selected={selectedIds.has(due.id)}
                  onToggle={toggleSelection}
                  showUser={ower?.name}
                  variant="receivable"
                />
              );
            })}
          </View>
        )}
      </ScrollView>
      {dues.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.rejectBtn,
              (selectedIds.size === 0 || isMutating) && styles.btnDisabled,
            ]}
            onPress={handleReject}
            disabled={selectedIds.size === 0 || isMutating}
            activeOpacity={0.8}
          >
            <Text style={styles.btnText}>
              {rejectResolve.isPending
                ? "Rejecting..."
                : `Reject (${selectedIds.size})`}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.confirmBtn,
              (selectedIds.size === 0 || isMutating) && styles.btnDisabled,
            ]}
            onPress={handleConfirm}
            disabled={selectedIds.size === 0 || isMutating}
            activeOpacity={0.8}
          >
            <Text style={styles.btnText}>
              {confirmResolve.isPending
                ? "Confirming..."
                : `Confirm (${selectedIds.size})`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing["3xl"], flexGrow: 1 },
  empty: {
    textAlign: "center",
    fontSize: fontSize.sm,
    color: colors.gray[500],
    paddingTop: spacing["3xl"] * 2,
  },
  list: { gap: spacing.sm, marginTop: spacing.md },
  footer: {
    flexDirection: "row",
    gap: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: colors.red[600],
    borderRadius: radius.xl,
    paddingVertical: 14,
    alignItems: "center",
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: colors.green[600],
    borderRadius: radius.xl,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  btnDisabled: { opacity: 0.5 },
});
