import { colors, radius } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface CustomCheckboxProps {
  checked: boolean;
  onPress?: () => void;
  disabled?: boolean;
}

export default function CustomCheckbox({
  checked,
  onPress,
  disabled,
}: CustomCheckboxProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[styles.box, checked && styles.boxChecked]}
      testID="custom-checkbox"
    >
      {checked && <Ionicons name="checkmark" size={12} color={colors.white} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 18,
    height: 18,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  boxChecked: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
});
