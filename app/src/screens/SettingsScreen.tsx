import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import PickerModal from "@/components/PickerModal";
import {
  colors,
  fontSize,
  fontWeight,
  radius,
  spacing,
} from "@/constants/theme";
import { useUpdateUserCurrencyMutation } from "@/hooks/api";
import { useAuthContext } from "@/providers/auth.provider";
import { CURRENCIES, DEFAULT_CURRENCY } from "@/types/currency.types";
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

type Props = NativeStackScreenProps<RootStackParamList, "Settings">;

const CURRENCY_OPTIONS = CURRENCIES.map((c) => ({
  label: `${c.code} — ${c.name} (${c.symbol})`,
  value: c.code,
}));

export default function SettingsScreen({ navigation }: Props) {
  const { user, appUser, refreshAppUser } = useAuthContext();
  const updateCurrency = useUpdateUserCurrencyMutation(user?.uid ?? "");
  const [selectedCurrency, setSelectedCurrency] = useState<string>(
    appUser?.preferredCurrency ?? DEFAULT_CURRENCY,
  );

  const handleSave = async () => {
    if (!user) return;
    try {
      await updateCurrency.mutateAsync(selectedCurrency);
      await refreshAppUser();
      Toast.show({ type: "success", text1: "Currency updated!" });
    } catch {
      Toast.show({ type: "error", text1: "Failed to update currency" });
    }
  };

  return (
    <AppLayout navigation={navigation} currentRoute="Settings">
      <PageHeader title="Settings" showBack />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Default Currency</Text>
          <Text style={styles.cardDesc}>
            This will be the default currency when creating a new due. Each due
            stores its own currency, so existing dues are not affected.
          </Text>

          <PickerModal
            value={selectedCurrency}
            onChange={setSelectedCurrency}
            label={
              CURRENCY_OPTIONS.find((o) => o.value === selectedCurrency)
                ?.label ?? selectedCurrency
            }
            options={CURRENCY_OPTIONS}
          />

          <TouchableOpacity
            style={[
              styles.saveBtn,
              updateCurrency.isPending && styles.btnDisabled,
            ]}
            onPress={handleSave}
            disabled={updateCurrency.isPending}
            activeOpacity={0.8}
          >
            <Text style={styles.saveBtnText}>
              {updateCurrency.isPending ? "Saving…" : "Save Changes"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing["3xl"] },
  card: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    padding: spacing.xl,
    gap: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.gray[700],
  },
  cardDesc: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    lineHeight: 18,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.6 },
  saveBtnText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
});
