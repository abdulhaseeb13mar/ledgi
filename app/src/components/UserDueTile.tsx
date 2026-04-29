import {
  colors,
  fontSize,
  fontWeight,
  radius,
  spacing,
} from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { formatAmount } from "@/utils/format-currency";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CurrencyTotal {
  currency: string;
  total: number;
}

interface UserDueTileProps {
  name: string;
  email: string;
  amounts: CurrencyTotal[];
  variant?: "owed" | "receivable";
  onPress?: () => void;
}

export default function UserDueTile({
  name,
  email,
  amounts,
  variant = "owed",
  onPress,
}: UserDueTileProps) {
  const amountColor = variant === "owed" ? colors.red[500] : colors.green[600];

  return (
    <TouchableOpacity style={styles.tile} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.email} numberOfLines={1}>
          {email}
        </Text>
      </View>
      <View style={styles.right}>
        <View style={styles.amounts}>
          {amounts.map((a) => (
            <Text
              key={a.currency}
              style={[styles.amount, { color: amountColor }]}
            >
              {formatAmount(a.total, a.currency)}
            </Text>
          ))}
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.gray[400]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  info: {
    flex: 1,
    minWidth: 0,
    marginRight: spacing.sm,
  },
  name: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.gray[900],
  },
  email: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    marginTop: 2,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  amounts: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
});
