import AppLayout from "@/components/AppLayout";
import LoadingSpinner from "@/components/LoadingSpinner";
import PageHeader from "@/components/PageHeader";
import UserDueTile from "@/components/UserDueTile";
import { colors, fontSize, spacing } from "@/constants/theme";
import { useDuesOwedToMeQuery, useUsersByIdsQuery } from "@/hooks/api";
import { useAuthContext } from "@/providers/auth.provider";
import { DEFAULT_CURRENCY } from "@/types/currency.types";
import type { RootStackParamList } from "@/navigation/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = NativeStackScreenProps<RootStackParamList, "DuesReceivable">;

export default function DuesReceivableScreen({ navigation }: Props) {
  const { user } = useAuthContext();
  const {
    data: dues = [],
    isLoading,
    refetch: refetchDues,
  } = useDuesOwedToMeQuery(user?.uid);
  const [refreshing, setRefreshing] = useState(false);

  const grouped = useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    for (const due of dues) {
      const currency = due.currency ?? DEFAULT_CURRENCY;
      const oweId = due.owerId;
      if (!map.has(oweId)) map.set(oweId, new Map());
      const currencyMap = map.get(oweId)!;
      currencyMap.set(currency, (currencyMap.get(currency) ?? 0) + due.amount);
    }
    return map;
  }, [dues]);

  const owerIds = useMemo(() => Array.from(grouped.keys()), [grouped]);
  const { data: users = [], refetch: refetchUsers } =
    useUsersByIdsQuery(owerIds);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchDues(),
        owerIds.length > 0 ? refetchUsers() : Promise.resolve(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <AppLayout navigation={navigation} currentRoute="DuesReceivable">
      <PageHeader
        title="Dues Owed to Me"
        showBack
        refreshFunction={onRefresh}
        titleStyle={{ color: colors.green[600] }}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {owerIds.length === 0 ? (
          <Text style={styles.empty}>No one owes you right now!</Text>
        ) : (
          <View style={styles.list}>
            {owerIds.map((owerId) => {
              const u = users.find((usr) => usr.uid === owerId);
              const currencyMap = grouped.get(owerId) ?? new Map();
              const amounts = Array.from(currencyMap.entries()).map(
                ([currency, total]) => ({ currency, total }),
              );
              return (
                <UserDueTile
                  key={owerId}
                  name={u?.name ?? "Loading..."}
                  email={u?.email ?? ""}
                  amounts={amounts}
                  variant="receivable"
                  onPress={() =>
                    navigation.navigate("DuesReceivableDetail", {
                      userId: owerId,
                    })
                  }
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
  list: { gap: spacing.md, marginTop: spacing.md },
});
