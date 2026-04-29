import AppLayout from "@/components/AppLayout";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  useDuesIOweQuery,
  useDuesOwedToMeQuery,
  useDuesPendingMyConfirmationQuery,
  useDuesPendingOthersConfirmationQuery,
} from "@/hooks/api";
import { useAuthContext } from "@/providers/auth.provider";
import { DEFAULT_CURRENCY } from "@/types/currency.types";
import { formatAmount, groupByCurrency } from "@/utils/format-currency";
import {
  colors,
  fontSize,
  fontWeight,
  radius,
  spacing,
} from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/types";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = NativeStackScreenProps<RootStackParamList, "Dashboard">;

export default function DashboardScreen({ navigation }: Props) {
  const { user } = useAuthContext();
  const { data: duesIOwe = [], isFetching: loadingIOwe } = useDuesIOweQuery(
    user?.uid,
  );
  const { data: duesOwedToMe = [], isFetching: loadingOwedToMe } =
    useDuesOwedToMeQuery(user?.uid);
  const { data: pendingConfirmations = [], isFetching: loadingPending } =
    useDuesPendingMyConfirmationQuery(user?.uid);
  const {
    data: pendingOthersConfirmations = [],
    isFetching: loadingPendingOthers,
  } = useDuesPendingOthersConfirmationQuery(user?.uid);

  const iOweTotals = useMemo(() => groupByCurrency(duesIOwe), [duesIOwe]);
  const owedToMeTotals = useMemo(
    () => groupByCurrency(duesOwedToMe),
    [duesOwedToMe],
  );

  return (
    <AppLayout navigation={navigation} currentRoute="Dashboard">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          {/* Owed to me */}
          <View style={[styles.summaryCard, styles.summaryCardGreen]}>
            <View style={styles.summaryHeader}>
              {loadingOwedToMe ? (
                <ActivityIndicator size="small" color={colors.green[600]} />
              ) : (
                <Ionicons
                  name="arrow-down-circle-outline"
                  size={18}
                  color={colors.green[600]}
                />
              )}
              <Text style={styles.summaryLabelGreen}>Owed to You</Text>
            </View>
            {owedToMeTotals.length === 0 ? (
              <Text style={styles.summaryAmountGreen}>
                {formatAmount(0, DEFAULT_CURRENCY)}
              </Text>
            ) : (
              owedToMeTotals.map((t) => (
                <Text key={t.currency} style={styles.summaryAmountGreen}>
                  {formatAmount(t.total, t.currency)}
                </Text>
              ))
            )}
          </View>

          {/* I owe */}
          <View style={[styles.summaryCard, styles.summaryCardRed]}>
            <View style={styles.summaryHeader}>
              {loadingIOwe ? (
                <ActivityIndicator size="small" color={colors.red[500]} />
              ) : (
                <Ionicons
                  name="arrow-up-circle-outline"
                  size={18}
                  color={colors.red[500]}
                />
              )}
              <Text style={styles.summaryLabelRed}>You Owe</Text>
            </View>
            {iOweTotals.length === 0 ? (
              <Text style={styles.summaryAmountRed}>
                {formatAmount(0, DEFAULT_CURRENCY)}
              </Text>
            ) : (
              iOweTotals.map((t) => (
                <Text key={t.currency} style={styles.summaryAmountRed}>
                  {formatAmount(t.total, t.currency)}
                </Text>
              ))
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {/* Create Due */}
          <TouchableOpacity
            style={styles.actionPrimary}
            onPress={() => navigation.navigate("CreateDue")}
            activeOpacity={0.8}
          >
            <Ionicons
              name="add-circle-outline"
              size={22}
              color={colors.white}
            />
            <View style={styles.actionText}>
              <Text style={styles.actionTitleWhite}>Create a Due</Text>
              <Text style={styles.actionSubtitleWhite}>
                Record a new due on other users
              </Text>
            </View>
          </TouchableOpacity>

          {/* Friends */}
          <TouchableOpacity
            style={[styles.actionOutline, styles.actionIndigo]}
            onPress={() => navigation.navigate("Friends")}
            activeOpacity={0.8}
          >
            <Ionicons
              name="people-outline"
              size={22}
              color={colors.indigo[600]}
            />
            <View style={styles.actionText}>
              <Text style={[styles.actionTitle, { color: colors.indigo[600] }]}>
                Friends
              </Text>
              <Text
                style={[styles.actionSubtitle, { color: colors.indigo[400] }]}
              >
                Manage your friends list
              </Text>
            </View>
          </TouchableOpacity>

          {/* Dues I Owe */}
          <TouchableOpacity
            style={[styles.actionOutline, styles.actionRed]}
            onPress={() => navigation.navigate("DuesOwed")}
            activeOpacity={0.8}
          >
            <Ionicons
              name="arrow-up-circle-outline"
              size={22}
              color={colors.red[600]}
            />
            <View style={styles.actionText}>
              <Text style={[styles.actionTitle, { color: colors.red[600] }]}>
                Dues I Owe
              </Text>
              <Text style={[styles.actionSubtitle, { color: colors.red[400] }]}>
                View dues you owe to others
              </Text>
            </View>
          </TouchableOpacity>

          {/* Dues Owed to Me */}
          <TouchableOpacity
            style={[styles.actionOutline, styles.actionGreen]}
            onPress={() => navigation.navigate("DuesReceivable")}
            activeOpacity={0.8}
          >
            <Ionicons
              name="arrow-down-circle-outline"
              size={22}
              color={colors.green[600]}
            />
            <View style={styles.actionText}>
              <Text style={[styles.actionTitle, { color: colors.green[600] }]}>
                Dues Owed to Me
              </Text>
              <Text
                style={[styles.actionSubtitle, { color: colors.green[500] }]}
              >
                View what others owe you
              </Text>
            </View>
          </TouchableOpacity>

          {/* Confirm Resolved Dues */}
          <TouchableOpacity
            style={[styles.actionOutline, styles.actionGray]}
            onPress={() => navigation.navigate("ConfirmDues")}
            activeOpacity={0.8}
          >
            {loadingPending ? (
              <ActivityIndicator size="small" color={colors.accent} />
            ) : (
              <Ionicons
                name="checkmark-circle-outline"
                size={22}
                color={colors.accent}
              />
            )}
            <View style={styles.actionText}>
              <Text style={[styles.actionTitle, { color: colors.accent }]}>
                Confirm Resolved Dues
              </Text>
              <Text style={styles.actionSubtitle}>
                Confirm dues that have been paid
              </Text>
            </View>
            {pendingConfirmations.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {pendingConfirmations.length > 99
                    ? "99+"
                    : pendingConfirmations.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Pending Confirmations */}
          <TouchableOpacity
            style={[styles.actionOutline, styles.actionGray]}
            onPress={() => navigation.navigate("PendingDues")}
            activeOpacity={0.8}
          >
            {loadingPendingOthers ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons name="time-outline" size={22} color={colors.primary} />
            )}
            <View style={styles.actionText}>
              <Text style={[styles.actionTitle, { color: colors.primary }]}>
                Pending Confirmations
              </Text>
              <Text style={styles.actionSubtitle}>
                Dues waiting for others to confirm
              </Text>
            </View>
            {pendingOthersConfirmations.length > 0 && (
              <View style={[styles.badge, styles.badgePrimary]}>
                <Text style={styles.badgeText}>
                  {pendingOthersConfirmations.length > 99
                    ? "99+"
                    : pendingOthersConfirmations.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing["3xl"],
    gap: spacing.lg,
  },
  summaryRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  summaryCard: {
    flex: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  summaryCardGreen: {
    backgroundColor: colors.green[50],
  },
  summaryCardRed: {
    backgroundColor: colors.red[50],
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  summaryLabelGreen: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.green[600],
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  summaryLabelRed: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.red[500],
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  summaryAmountGreen: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.green[600],
  },
  summaryAmountRed: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.red[600],
  },
  actions: {
    gap: spacing.md,
  },
  actionPrimary: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.accent,
    padding: spacing.lg,
  },
  actionOutline: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  actionIndigo: { borderColor: colors.indigo[200] },
  actionRed: { borderColor: colors.red[200] },
  actionGreen: { borderColor: colors.green[200] },
  actionGray: { borderColor: colors.gray[200] },
  actionText: { flex: 1 },
  actionTitleWhite: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  actionSubtitleWhite: {
    fontSize: fontSize.xs,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  actionTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  actionSubtitle: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    marginTop: 2,
  },
  badge: {
    backgroundColor: colors.red[500],
    borderRadius: radius.full,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xs,
  },
  badgePrimary: {
    backgroundColor: colors.accent,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
});
