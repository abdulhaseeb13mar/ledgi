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
import {
  useAddBankDetailMutation,
  useBankDetailsQuery,
  useDeleteBankDetailMutation,
  useUpdateBankDetailMutation,
  useUpdateUserCurrencyMutation,
} from "@/hooks/api";
import { useAuthContext } from "@/providers/auth.provider";
import { CURRENCIES, DEFAULT_CURRENCY } from "@/types/currency.types";
import type { BankDetail } from "@/types/user.types";
import type { RootStackParamList } from "@/navigation/types";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

type Props = NativeStackScreenProps<RootStackParamList, "Settings">;

const CURRENCY_OPTIONS = CURRENCIES.map((c) => ({
  label: `${c.code} — ${c.name} (${c.symbol})`,
  value: c.code,
}));

interface BankDetailFormState {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

const EMPTY_FORM: BankDetailFormState = {
  bankName: "",
  accountNumber: "",
  accountName: "",
};

function BankDetailFormModal({
  visible,
  initialValues,
  title,
  submitLabel,
  submitting,
  onSubmit,
  onClose,
}: {
  visible: boolean;
  initialValues: BankDetailFormState;
  title: string;
  submitLabel: string;
  submitting: boolean;
  onSubmit: (form: BankDetailFormState) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<BankDetailFormState>(initialValues);

  React.useEffect(() => {
    if (visible) setForm(initialValues);
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalSheet}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={22} color={colors.gray[500]} />
          </TouchableOpacity>
        </View>

        <View style={styles.formBody}>
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Bank Name</Text>
            <TextInput
              style={styles.textInput}
              value={form.bankName}
              onChangeText={(v) => setForm((f) => ({ ...f, bankName: v }))}
              placeholder="e.g. HBL, Meezan Bank"
              placeholderTextColor={colors.gray[400]}
            />
          </View>
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Account Number / IBAN</Text>
            <TextInput
              style={styles.textInput}
              value={form.accountNumber}
              onChangeText={(v) => setForm((f) => ({ ...f, accountNumber: v }))}
              placeholder="e.g. PK36SCBL0000001123456702"
              placeholderTextColor={colors.gray[400]}
              autoCapitalize="characters"
            />
          </View>
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Account Name</Text>
            <TextInput
              style={styles.textInput}
              value={form.accountName}
              onChangeText={(v) => setForm((f) => ({ ...f, accountName: v }))}
              placeholder="e.g. John Doe"
              placeholderTextColor={colors.gray[400]}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.btnDisabled]}
            onPress={() => onSubmit(form)}
            disabled={submitting}
            activeOpacity={0.8}
          >
            <Text style={styles.submitBtnText}>
              {submitting ? "Saving…" : submitLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function SettingsScreen({ navigation }: Props) {
  const { user, appUser, refreshAppUser } = useAuthContext();
  const updateCurrency = useUpdateUserCurrencyMutation(user?.uid ?? "");
  const { data: bankDetails = [], isFetching: bankDetailsLoading } = useBankDetailsQuery(user?.uid);
  const addBankDetail = useAddBankDetailMutation(user?.uid);
  const updateBankDetail = useUpdateBankDetailMutation(user?.uid);
  const deleteBankDetail = useDeleteBankDetailMutation(user?.uid);

  const [selectedCurrency, setSelectedCurrency] = useState<string>(
    appUser?.preferredCurrency ?? DEFAULT_CURRENCY,
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDetail, setEditingDetail] = useState<BankDetail | null>(null);

  const handleSaveCurrency = async () => {
    if (!user) return;
    try {
      await updateCurrency.mutateAsync(selectedCurrency);
      await refreshAppUser();
      Toast.show({ type: "success", text1: "Currency updated!" });
    } catch {
      Toast.show({ type: "error", text1: "Failed to update currency" });
    }
  };

  const handleAdd = async (form: BankDetailFormState) => {
    if (!form.bankName.trim() || !form.accountNumber.trim() || !form.accountName.trim()) {
      Toast.show({ type: "error", text1: "All fields are required" });
      return;
    }
    try {
      await addBankDetail.mutateAsync(form);
      setShowAddModal(false);
      Toast.show({ type: "success", text1: "Bank detail added" });
    } catch {
      Toast.show({ type: "error", text1: "Failed to add bank detail" });
    }
  };

  const handleUpdate = async (form: BankDetailFormState) => {
    if (!editingDetail) return;
    if (!form.bankName.trim() || !form.accountNumber.trim() || !form.accountName.trim()) {
      Toast.show({ type: "error", text1: "All fields are required" });
      return;
    }
    try {
      await updateBankDetail.mutateAsync({ id: editingDetail.id, data: form });
      setEditingDetail(null);
      Toast.show({ type: "success", text1: "Bank detail updated" });
    } catch {
      Toast.show({ type: "error", text1: "Failed to update bank detail" });
    }
  };

  const handleDelete = (detail: BankDetail) => {
    Alert.alert(
      "Delete Bank Detail",
      `Remove "${detail.bankName}" from your bank details?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteBankDetail.mutateAsync(detail.id);
              Toast.show({ type: "success", text1: "Bank detail deleted" });
            } catch {
              Toast.show({ type: "error", text1: "Failed to delete bank detail" });
            }
          },
        },
      ],
    );
  };

  return (
    <AppLayout navigation={navigation} currentRoute="Settings">
      <PageHeader title="Settings" showBack />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Currency */}
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
            onPress={handleSaveCurrency}
            disabled={updateCurrency.isPending}
            activeOpacity={0.8}
          >
            <Text style={styles.saveBtnText}>
              {updateCurrency.isPending ? "Saving…" : "Save Changes"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bank Details */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Bank Details</Text>
              <Text style={[styles.cardDesc, { marginTop: 2 }]}>
                Visible to friends who have added you to their friend list.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setShowAddModal(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={16} color={colors.white} />
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>

          {bankDetailsLoading ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>Loading…</Text>
            </View>
          ) : bankDetails.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No bank details added yet</Text>
              <Text style={styles.emptySubText}>
                Add your bank details to share with friends
              </Text>
            </View>
          ) : (
            <View style={styles.bankList}>
              {bankDetails.map((detail) => (
                <View key={detail.id} style={styles.bankRow}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.bankName} numberOfLines={1}>
                      {detail.bankName}
                    </Text>
                    <Text style={styles.bankAccount} numberOfLines={1}>
                      {detail.accountNumber}
                    </Text>
                    <Text style={styles.bankHolder} numberOfLines={1}>
                      {detail.accountName}
                    </Text>
                  </View>
                  <View style={styles.bankActions}>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => setEditingDetail(detail)}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Ionicons name="pencil-outline" size={16} color={colors.accent} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDelete(detail)}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.red[500]} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Modal */}
      <BankDetailFormModal
        visible={showAddModal}
        initialValues={EMPTY_FORM}
        title="Add Bank Detail"
        submitLabel="Add Bank Detail"
        submitting={addBankDetail.isPending}
        onSubmit={handleAdd}
        onClose={() => setShowAddModal(false)}
      />

      {/* Edit Modal */}
      <BankDetailFormModal
        visible={!!editingDetail}
        initialValues={
          editingDetail
            ? {
                bankName: editingDetail.bankName,
                accountNumber: editingDetail.accountNumber,
                accountName: editingDetail.accountName,
              }
            : EMPTY_FORM
        }
        title="Edit Bank Detail"
        submitLabel="Save Changes"
        submitting={updateBankDetail.isPending}
        onSubmit={handleUpdate}
        onClose={() => setEditingDetail(null)}
      />
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing["3xl"], gap: spacing.lg },
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
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
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
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  addBtnText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  emptyBox: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderStyle: "dashed",
    borderRadius: radius.lg,
    backgroundColor: colors.gray[50],
    paddingVertical: spacing["2xl"],
    alignItems: "center",
    gap: spacing.xs,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
  },
  emptySubText: {
    fontSize: fontSize.xs,
    color: colors.gray[400],
  },
  bankList: { gap: spacing.md },
  bankRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radius.lg,
    backgroundColor: colors.gray[50],
    padding: spacing.md,
  },
  bankName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.gray[900],
  },
  bankAccount: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    fontVariant: ["tabular-nums"],
    marginTop: 2,
  },
  bankHolder: {
    fontSize: fontSize.xs,
    color: colors.gray[600],
    marginTop: 1,
  },
  bankActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  editBtn: {
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  deleteBtn: {
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.red[200],
    backgroundColor: colors.white,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
  },
  modalSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: spacing["3xl"],
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  modalTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.gray[900],
  },
  formBody: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  formField: { gap: spacing.xs },
  fieldLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.gray[600],
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: fontSize.sm,
    color: colors.gray[900],
    backgroundColor: colors.white,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: spacing.xs,
  },
  submitBtnText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
});
