import CustomCheckbox from "@/components/CustomCheckbox";
import {
  colors,
  fontSize,
  fontWeight,
  radius,
  spacing,
} from "@/constants/theme";
import type { Due } from "@/types/due.types";
import { formatAmount } from "@/utils/format-currency";
import { formatDate } from "@/utils/format-date";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface DueItemProps {
  due: Due;
  selectable?: boolean;
  selected?: boolean;
  onToggle?: (id: string) => void;
  showUser?: string;
  variant?: "owed" | "receivable";
}

export default function DueItem({
  due,
  selectable = false,
  selected = false,
  onToggle,
  showUser,
  variant = "owed",
}: DueItemProps) {
  const amountColor = variant === "owed" ? colors.red[500] : colors.green[600];

  const content = (
    <View style={[styles.card, selected && styles.cardSelected]}>
      {selectable && (
        <CustomCheckbox checked={selected} onPress={() => onToggle?.(due.id)} />
      )}
      <View style={styles.body}>
        <Text style={styles.description} numberOfLines={2}>
          {due.description}
        </Text>
        {showUser ? <Text style={styles.meta}>{showUser}</Text> : null}
        <Text style={styles.date}>{formatDate(due.createdAt)}</Text>
        {due.status === "resolve_requested" && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Resolve Requested</Text>
          </View>
        )}
      </View>
      <Text style={[styles.amount, { color: amountColor }]}>
        {formatAmount(due.amount, due.currency)}
      </Text>
    </View>
  );

  if (selectable) {
    return (
      <TouchableOpacity onPress={() => onToggle?.(due.id)} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.gray[100],
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  cardSelected: {
    borderColor: colors.accent,
    borderWidth: 2,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  description: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.gray[900],
    marginBottom: 2,
  },
  meta: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    marginBottom: 2,
  },
  date: {
    fontSize: fontSize.xs,
    color: colors.gray[400],
    marginTop: 2,
  },
  badge: {
    marginTop: spacing.xs,
    alignSelf: "flex-start",
    backgroundColor: colors.yellow[100],
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.yellow[700],
  },
  amount: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
});
