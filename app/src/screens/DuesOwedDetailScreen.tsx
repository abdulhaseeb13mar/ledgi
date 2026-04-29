import AppLayout from "@/components/AppLayout";
import CustomTabs from "@/components/CustomTabs";
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
  useDuesIOweToUserQuery,
  useRequestResolveMutation,
  useUserQuery,
} from "@/hooks/api";
import { useAuthContext } from "@/providers/auth.provider";
import type { RootStackParamList } from "@/navigation/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

type Props = NativeStackScreenProps<RootStackParamList, "DuesOwedDetail">;

export default function DuesOwedDetailScreen({ route, navigation }: Props) {
  const { userId } = route.params;
  const { user } = useAuthContext();
  const { data: targetUser, refetch: refetchUser } = useUserQuery(userId);
  const {
    data: dues = [],
    isLoading,
    refetch: refetchDues,
  } = useDuesIOweToUserQuery(user?.uid, userId);
  const requestResolve = useRequestResolveMutation();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const activeDues = dues.filter((d) => d.status === "active");
  const resolveRequestedDues = dues.filter(
    (d) => d.status === "resolve_requested",
  );

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onRefresh = async () => {
    await Promise.all([refetchDues(), refetchUser()]);
  };

  const handleRequestConfirm = async () => {
    if (selectedIds.size === 0) {
      Toast.show({ type: "error", text1: "Select at least one due" });
      return;
    }
    try {
      await requestResolve.mutateAsync(Array.from(selectedIds));
      setSelectedIds(new Set());
      Toast.show({ type: "success", text1: "Resolve request sent!" });
    } catch {
      Toast.show({ type: "error", text1: "Failed to send request" });
    }
  };

  if (isLoading) return <LoadingSpinner />;

  const tabs = [
    {
      key: "active",
      label: "Active",
      content:
        activeDues.length === 0 ? (
          <Text style={styles.empty}>No active dues found</Text>
        ) : (
          <View style={styles.list}>
            {activeDues.map((due) => (
              <DueItem
                key={due.id}
                due={due}
                selectable
                selected={selectedIds.has(due.id)}
                onToggle={toggleSelection}
                variant="owed"
              />
            ))}
          </View>
        ),
    },
    {
      key: "pending",
      label: "Pending Confirmation",
      content:
        resolveRequestedDues.length === 0 ? (
          <Text style={styles.empty}>No pending dues found</Text>
        ) : (
          <View style={styles.list}>
            {resolveRequestedDues.map((due) => (
              <DueItem key={due.id} due={due} variant="owed" />
            ))}
          </View>
        ),
    },
  ];

  return (
    <AppLayout navigation={navigation} currentRoute="DuesOwedDetail">
      <PageHeader
        title={`Dues to ${targetUser?.name ?? "..."}`}
        showBack
        refreshFunction={onRefresh}
        titleStyle={{ color: colors.red[500] }}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {dues.length === 0 ? (
          <Text style={styles.empty}>No dues found</Text>
        ) : (
          <CustomTabs tabs={tabs} />
        )}
      </ScrollView>
      {activeDues.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitBtn,
              (selectedIds.size === 0 || requestResolve.isPending) &&
                styles.btnDisabled,
            ]}
            onPress={handleRequestConfirm}
            disabled={selectedIds.size === 0 || requestResolve.isPending}
            activeOpacity={0.8}
          >
            <Text style={styles.submitText}>
              {requestResolve.isPending
                ? "Sending..."
                : `Request ${targetUser?.name ?? "User"} to Confirm Paid`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  list: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  empty: {
    textAlign: "center",
    fontSize: fontSize.sm,
    color: colors.gray[500],
    paddingVertical: spacing["3xl"] * 2,
  },
  footer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  submitBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.xl,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.5 },
  submitText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
});
