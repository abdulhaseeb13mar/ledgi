import AppLayout from "@/components/AppLayout";
import CustomTabs from "@/components/CustomTabs";
import DueItem from "@/components/DueItem";
import LoadingSpinner from "@/components/LoadingSpinner";
import PageHeader from "@/components/PageHeader";
import { colors, fontSize, spacing } from "@/constants/theme";
import { useDuesUserOwesToMeQuery, useUserQuery } from "@/hooks/api";
import { useAuthContext } from "@/providers/auth.provider";
import type { RootStackParamList } from "@/navigation/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

type Props = NativeStackScreenProps<RootStackParamList, "DuesReceivableDetail">;

export default function DuesReceivableDetailScreen({
  route,
  navigation,
}: Props) {
  const { userId } = route.params;
  const { user } = useAuthContext();
  const { data: targetUser, refetch: refetchUser } = useUserQuery(userId);
  const {
    data: dues = [],
    isLoading,
    refetch: refetchDues,
  } = useDuesUserOwesToMeQuery(user?.uid, userId);

  const activeDues = dues.filter((d) => d.status === "active");
  const resolveRequestedDues = dues.filter(
    (d) => d.status === "resolve_requested",
  );

  const onRefresh = async () => {
    await Promise.all([refetchDues(), refetchUser()]);
  };

  if (isLoading) return <LoadingSpinner />;

  const tabs = [
    {
      key: "active",
      label: "Active",
      content:
        activeDues.length === 0 ? (
          <Text style={styles.empty}>No active dues</Text>
        ) : (
          <View style={styles.list}>
            {activeDues.map((due) => (
              <DueItem key={due.id} due={due} variant="receivable" />
            ))}
          </View>
        ),
    },
    {
      key: "requested",
      label: "Requested",
      content:
        resolveRequestedDues.length === 0 ? (
          <Text style={styles.empty}>No resolve-requested dues</Text>
        ) : (
          <View style={styles.list}>
            {resolveRequestedDues.map((due) => (
              <DueItem key={due.id} due={due} variant="receivable" />
            ))}
          </View>
        ),
    },
  ];

  return (
    <AppLayout navigation={navigation} currentRoute="DuesReceivableDetail">
      <PageHeader
        title={`Dues from ${targetUser?.name ?? "..."}`}
        showBack
        refreshFunction={onRefresh}
        titleStyle={{ color: colors.green[600] }}
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
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing["3xl"], flexGrow: 1 },
  list: { gap: spacing.sm, marginTop: spacing.md },
  empty: {
    textAlign: "center",
    fontSize: fontSize.sm,
    color: colors.gray[500],
    paddingVertical: spacing["3xl"] * 2,
  },
});
