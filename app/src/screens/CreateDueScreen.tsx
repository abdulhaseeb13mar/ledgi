import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import PickerModal from "@/components/PickerModal";
import UserSearchInput from "@/components/UserSearchInput";
import {
  colors,
  fontSize,
  fontWeight,
  radius,
  spacing,
} from "@/constants/theme";
import { useCreateDuesMutation } from "@/hooks/api";
import { useAuthContext } from "@/providers/auth.provider";
import { CURRENCIES, DEFAULT_CURRENCY } from "@/types/currency.types";
import type { AppUser } from "@/types/user.types";
import type { RootStackParamList } from "@/navigation/types";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

type Props = NativeStackScreenProps<RootStackParamList, "CreateDue">;

const CURRENCY_OPTIONS = CURRENCIES.map((c) => ({
  label: `${c.code} — ${c.name}`,
  value: c.code,
}));

export default function CreateDueScreen({ navigation }: Props) {
  const { user, appUser } = useAuthContext();
  const createDues = useCreateDuesMutation();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState<string>(
    appUser?.preferredCurrency ?? DEFAULT_CURRENCY,
  );
  const [selectedUsers, setSelectedUsers] = useState<AppUser[]>([]);
  const [userAmounts, setUserAmounts] = useState<Record<string, string>>({});

  const handleSelect = (u: AppUser) => {
    setSelectedUsers((prev) => [...prev, u]);
    setUserAmounts((prev) => ({ ...prev, [u.uid]: amount }));
  };

  const handleRemove = (uid: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.uid !== uid));
    setUserAmounts((prev) => {
      const next = { ...prev };
      delete next[uid];
      return next;
    });
  };

  const handleApplyToAll = () => {
    if (!amount) {
      Toast.show({ type: "error", text1: "Enter an amount first" });
      return;
    }
    const updated: Record<string, string> = {};
    for (const u of selectedUsers) updated[u.uid] = amount;
    setUserAmounts(updated);
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Toast.show({ type: "error", text1: "Enter a description" });
      return;
    }
    if (selectedUsers.length === 0) {
      Toast.show({ type: "error", text1: "Select at least one user" });
      return;
    }
    const entries = selectedUsers.map((u) => ({
      owerId: u.uid,
      amount: parseFloat(userAmounts[u.uid] || "0"),
    }));
    if (entries.some((e) => !e.amount || e.amount <= 0)) {
      Toast.show({
        type: "error",
        text1: "All amounts must be greater than 0",
      });
      return;
    }
    try {
      await createDues.mutateAsync({
        creatorId: user!.uid,
        entries,
        description: description.trim(),
        currency,
      });
      Toast.show({ type: "success", text1: "Dues created!" });
      navigation.navigate("Dashboard");
    } catch {
      Toast.show({ type: "error", text1: "Failed to create dues" });
    }
  };

  return (
    <AppLayout navigation={navigation} currentRoute="CreateDue">
      <PageHeader title="Create Due" showBack />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={120}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Description */}
          <View style={styles.field}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.input}
              value={description}
              onChangeText={setDescription}
              placeholder="e.g. Dinner at restaurant"
              placeholderTextColor={colors.gray[400]}
              returnKeyType="next"
            />
          </View>

          {/* Currency */}
          <View style={styles.field}>
            <Text style={styles.label}>Currency</Text>
            <PickerModal
              value={currency}
              onChange={setCurrency}
              label={
                CURRENCY_OPTIONS.find((o) => o.value === currency)?.label ??
                currency
              }
              options={CURRENCY_OPTIONS}
            />
          </View>

          {/* Amount */}
          <View style={styles.field}>
            <Text style={styles.label}>Default Amount</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={colors.gray[400]}
              keyboardType="decimal-pad"
              returnKeyType="done"
            />
          </View>

          {/* Users */}
          <View style={styles.field}>
            <Text style={styles.label}>Add Users</Text>
            <UserSearchInput
              selectedUsers={selectedUsers}
              onSelect={handleSelect}
              onRemove={handleRemove}
            />
          </View>

          {/* Per-user amounts */}
          {selectedUsers.length > 0 && (
            <View style={styles.field}>
              <View style={styles.perUserHeader}>
                <Text style={styles.label}>Amounts per User</Text>
                <TouchableOpacity
                  onPress={handleApplyToAll}
                  style={styles.applyAllBtn}
                >
                  <Text style={styles.applyAllText}>Apply to All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.perUserList}>
                {selectedUsers.map((u) => (
                  <View key={u.uid} style={styles.perUserRow}>
                    <View style={styles.userInfo}>
                      <Text style={styles.perUserName} numberOfLines={1}>
                        {u.name}
                      </Text>
                      <Text style={styles.perUserEmail} numberOfLines={1}>
                        {u.email}
                      </Text>
                    </View>
                    <TextInput
                      style={styles.perUserInput}
                      value={userAmounts[u.uid] ?? ""}
                      onChangeText={(v) =>
                        setUserAmounts((prev) => ({ ...prev, [u.uid]: v }))
                      }
                      placeholder="0.00"
                      placeholderTextColor={colors.gray[400]}
                      keyboardType="decimal-pad"
                    />
                    <TouchableOpacity
                      onPress={() => handleRemove(u.uid)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color={colors.red[400]}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Submit */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              createDues.isPending && styles.btnDisabled,
            ]}
            onPress={handleSubmit}
            disabled={createDues.isPending}
            activeOpacity={0.8}
          >
            <Text style={styles.submitText}>
              {createDues.isPending ? "Creating..." : "Create Due"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    paddingBottom: spacing["3xl"],
    gap: spacing.xl,
  },
  field: { gap: spacing.xs },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.gray[700],
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 13,
    fontSize: fontSize.base,
    color: colors.gray[900],
    backgroundColor: colors.white,
  },
  perUserHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  applyAllBtn: {
    backgroundColor: colors.accentLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  applyAllText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.accent,
  },
  perUserList: { gap: spacing.sm },
  perUserRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[100],
    borderRadius: radius.md,
    backgroundColor: colors.white,
    padding: spacing.md,
  },
  userInfo: { flex: 1, minWidth: 0 },
  perUserName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.gray[900],
  },
  perUserEmail: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
  },
  perUserInput: {
    width: 80,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: fontSize.sm,
    color: colors.gray[900],
    textAlign: "right",
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  btnDisabled: { opacity: 0.5 },
  submitText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
});
