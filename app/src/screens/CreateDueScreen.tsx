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
  const [splitMode, setSplitMode] = useState<"split" | "applyAll" | null>(null);

  const applyMode = (users: AppUser[], totalAmt: string, mode: "split" | "applyAll") => {
    const updated: Record<string, string> = {};
    if (mode === "split") {
      const split = (parseFloat(totalAmt) / users.length).toFixed(2);
      for (const u of users) updated[u.uid] = split;
    } else {
      for (const u of users) updated[u.uid] = totalAmt;
    }
    setUserAmounts(updated);
  };

  const handleAmountChange = (val: string) => {
    setAmount(val);
    if (!val) {
      setUserAmounts({});
      return;
    }
    if (splitMode && parseFloat(val) > 0 && selectedUsers.length > 0) {
      applyMode(selectedUsers, val, splitMode);
    }
  };

  const handleSelect = (u: AppUser) => {
    const newUsers = [...selectedUsers, u];
    setSelectedUsers(newUsers);
    if (splitMode && amount && parseFloat(amount) > 0) {
      applyMode(newUsers, amount, splitMode);
    } else {
      setUserAmounts((prev) => ({ ...prev, [u.uid]: amount }));
    }
  };

  const handleRemove = (uid: string) => {
    const newUsers = selectedUsers.filter((u) => u.uid !== uid);
    setSelectedUsers(newUsers);
    if (splitMode && amount && parseFloat(amount) > 0 && newUsers.length > 0) {
      applyMode(newUsers, amount, splitMode);
    } else {
      setUserAmounts((prev) => {
        const next = { ...prev };
        delete next[uid];
        return next;
      });
    }
  };

  const handleApplyToAll = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Toast.show({ type: "error", text1: "Enter a total amount first" });
      return;
    }
    const newMode = splitMode === "applyAll" ? null : "applyAll";
    setSplitMode(newMode);
    if (newMode === "applyAll" && selectedUsers.length > 0) {
      applyMode(selectedUsers, amount, "applyAll");
    }
  };

  const handleSplitAmount = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Toast.show({ type: "error", text1: "Enter a total amount first" });
      return;
    }
    const newMode = splitMode === "split" ? null : "split";
    setSplitMode(newMode);
    if (newMode === "split" && selectedUsers.length > 0) {
      applyMode(selectedUsers, amount, "split");
    }
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
            <View style={styles.amountHeader}>
              <Text style={styles.label}>Total Amount</Text>
              <View style={styles.amountBtns}>
                <TouchableOpacity
                  onPress={handleSplitAmount}
                  style={[styles.amountActionBtn, splitMode === "split" && styles.amountActionBtnActive]}
                >
                  <Text style={[styles.amountActionText, splitMode === "split" && styles.amountActionTextActive]}>
                    Split amount
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleApplyToAll}
                  style={[styles.amountActionBtn, splitMode === "applyAll" && styles.amountActionBtnActive]}
                >
                  <Text style={[styles.amountActionText, splitMode === "applyAll" && styles.amountActionTextActive]}>
                    Apply to all
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={handleAmountChange}
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
              <Text style={styles.label}>Amounts per User</Text>
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
  amountHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amountBtns: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  amountActionBtn: {
    backgroundColor: colors.accentLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: "transparent",
  },
  amountActionBtnActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  amountActionText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.accent,
  },
  amountActionTextActive: {
    color: colors.white,
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
