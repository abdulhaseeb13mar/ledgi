import AppLayout from "@/components/AppLayout";
import DueItem from "@/components/DueItem";
import LoadingSpinner from "@/components/LoadingSpinner";
import PageHeader from "@/components/PageHeader";
import { colors, fontSize, spacing } from "@/constants/theme";
import {
  useDuesPendingOthersConfirmationQuery,
  useUsersByIdsQuery,
} from "@/hooks/api";
import { useAuthContext } from "@/providers/auth.provider";
import type { RootStackParamList } from "@/navigation/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

type Props = NativeStackScreenProps<RootStackParamList, "PendingDues">;

export default function PendingDuesScreen({ navigation }: Props) {
  const { user } = useAuthContext();
  const {
    data: dues = [],
    isLoading,
    refetch: refetchDues,
  } = useDuesPendingOthersConfirmationQuery(user?.uid);

  const creatorIds = useMemo(
    () => [...new Set(dues.map((d) => d.creatorId))],
    [dues],
  );
  const { data: users = [], refetch: refetchUsers } =
    useUsersByIdsQuery(creatorIds);

  const onRefresh = async () => {
    await Promise.all([
      refetchDues(),
      creatorIds.length > 0 ? refetchUsers() : Promise.resolve(),
    ]);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <AppLayout navigation={navigation} currentRoute="PendingDues">
      <PageHeader
        title="Pending Confirmations"
        showBack
        refreshFunction={onRefresh}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {dues.length === 0 ? (
          <Text style={styles.empty}>No pending confirmations</Text>
        ) : (
          <View style={styles.list}>
            {dues.map((due) => {
              const creator = users.find((u) => u.uid === due.creatorId);
              return (
                <DueItem
                  key={due.id}
                  due={due}
                  showUser={
                    creator
                      ? `Waiting for ${creator.name}`
                      : "Waiting for creator"
                  }
                  variant="owed"
                />
              );
            })}
          </View>
        )}
      </ScrollView>
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
});
