import {
  colors,
  fontSize,
  fontWeight,
  radius,
  spacing,
} from "@/constants/theme";
import { CURRENCIES } from "@/types/currency.types";
import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface PickerModalProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export default function PickerModal({
  value,
  onChange,
  label,
}: PickerModalProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const selectedCurrency = CURRENCIES.find((c) => c.code === value);
  const displayLabel = selectedCurrency
    ? `${selectedCurrency.code} — ${selectedCurrency.name} (${selectedCurrency.symbol})`
    : value;

  const handleDone = () => {
    onChange(tempValue);
    setModalVisible(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setModalVisible(false);
  };

  // On Android, the Picker works inline — we wrap it in a bordered container
  if (Platform.OS === "android") {
    return (
      <View style={styles.androidContainer}>
        {label && <Text style={styles.fieldLabel}>{label}</Text>}
        <View style={styles.androidPickerWrapper}>
          <Picker
            selectedValue={value}
            onValueChange={(v) => onChange(String(v))}
            style={styles.androidPicker}
            dropdownIconColor={colors.gray[500]}
          >
            {CURRENCIES.map((c) => (
              <Picker.Item
                key={c.code}
                label={`${c.code} — ${c.name} (${c.symbol})`}
                value={c.code}
              />
            ))}
          </Picker>
        </View>
      </View>
    );
  }

  // iOS: show a modal with a wheel picker
  return (
    <View>
      {label && <Text style={styles.fieldLabel}>{label}</Text>}
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => {
          setTempValue(value);
          setModalVisible(true);
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.triggerText}>{displayLabel}</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <Pressable style={styles.overlay} onPress={handleCancel} />
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <TouchableOpacity onPress={handleCancel} style={styles.sheetBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDone} style={styles.sheetBtn}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>
          <Picker
            selectedValue={tempValue}
            onValueChange={(v) => setTempValue(String(v))}
            style={styles.iosPicker}
          >
            {CURRENCIES.map((c) => (
              <Picker.Item
                key={c.code}
                label={`${c.code} — ${c.name} (${c.symbol})`}
                value={c.code}
              />
            ))}
          </Picker>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.gray[700],
    marginBottom: 6,
  },
  // Android
  androidContainer: {
    marginBottom: spacing.xs,
  },
  androidPickerWrapper: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.white,
  },
  androidPicker: {
    color: colors.gray[900],
    height: 50,
  },
  // iOS trigger
  trigger: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    backgroundColor: colors.white,
  },
  triggerText: {
    fontSize: fontSize.base,
    color: colors.gray[900],
  },
  // iOS modal
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: spacing["2xl"],
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  sheetBtn: {
    padding: spacing.xs,
  },
  cancelText: {
    fontSize: fontSize.base,
    color: colors.gray[500],
  },
  doneText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  iosPicker: {
    backgroundColor: colors.white,
  },
});
