import AppLayout from "@/components/AppLayout";
import LoadingSpinner from "@/components/LoadingSpinner";
import PageHeader from "@/components/PageHeader";
import {
  colors,
  fontSize,
  fontWeight,
  radius,
  spacing,
} from "@/constants/theme";
import {
  useAddFriendMutation,
  useFriendBankDetailsQuery,
  useFriendsQuery,
  useRemoveFriendMutation,
  useSearchUserByEmailQuery,
} from "@/hooks/api";
import { useAuthContext } from "@/providers/auth.provider";
import type { AppUser } from "@/types/user.types";
import type { RootStackParamList } from "@/navigation/types";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import debounce from "lodash.debounce";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

type Props = NativeStackScreenProps<RootStackParamList, "Friends">;

function BankDetailsModal({
  viewer,
  friend,
  onClose,
}: {
  viewer: AppUser;
  friend: AppUser;
  onClose: () => void;
}) {
  const { data: bankDetails, isFetching } = useFriendBankDetailsQuery(
    viewer.uid,
    friend.uid,
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (accountNumber: string, id: string) => {
    await Clipboard.setStringAsync(accountNumber);
    setCopiedId(id);
    Toast.show({ type: "success", text1: "Account number copied" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose} />
      <View style={styles.modalSheet}>
        <View style={styles.modalHeader}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.modalTitle} numberOfLines={1}>
              {friend.name}'s Bank Details
            </Text>
            <Text style={styles.modalSubtitle} numberOfLines={1}>
              {friend.email}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={22} color={colors.gray[500]} />
          </TouchableOpacity>
        </View>

        <View style={styles.modalBody}>
          {isFetching || bankDetails === undefined ? (
            <View style={styles.modalCenter}>
              <ActivityIndicator size="small" color={colors.accent} />
              <Text style={styles.loadingText}>Loading…</Text>
            </View>
          ) : bankDetails === null ? (
            <View style={styles.accessDeniedBox}>
              <Ionicons name="lock-closed-outline" size={22} color={colors.yellow[700]} />
              <Text style={styles.accessDeniedTitle}>Not accessible</Text>
              <Text style={styles.accessDeniedDesc}>
                {friend.name} hasn't added you as a friend yet. Bank details are only visible to mutual friends.
              </Text>
            </View>
          ) : bankDetails.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                {friend.name} hasn't added any bank details yet.
              </Text>
            </View>
          ) : (
            <View style={styles.bankList}>
              {bankDetails.map((detail) => (
                <View key={detail.id} style={styles.bankCard}>
                  <Text style={styles.bankName}>{detail.bankName}</Text>
                  <View style={styles.accountRow}>
                    <Text style={[styles.bankAccount, { flex: 1 }]} numberOfLines={1}>
                      {detail.accountNumber}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleCopy(detail.accountNumber, detail.id)}
                      style={styles.copyBtn}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Ionicons
                        name={copiedId === detail.id ? "checkmark-outline" : "copy-outline"}
                        size={14}
                        color={copiedId === detail.id ? colors.green[600] : colors.gray[400]}
                      />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.bankHolder}>{detail.accountName}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

export default function FriendsScreen({ navigation }: Props) {
  const { user, appUser } = useAuthContext();
  const [inputValue, setInputValue] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [bankDetailsFriend, setBankDetailsFriend] = useState<AppUser | null>(null);

  const {
    data: friends = [],
    isFetching: friendsLoading,
    refetch,
  } = useFriendsQuery(user?.uid);
  const { data: searchResult, isFetching: searchLoading } =
    useSearchUserByEmailQuery(searchEmail, user?.uid);
  const addFriend = useAddFriendMutation(user?.uid);
  const removeFriend = useRemoveFriendMutation(user?.uid);

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchEmail(value);
      }, 300),
    [],
  );

  const handleChange = (value: string) => {
    setInputValue(value);
    debouncedSearch(value);
  };

  const isFriend = (uid: string) => friends.some((f) => f.uid === uid);

  const handleAdd = async (friendUid: string) => {
    try {
      await addFriend.mutateAsync(friendUid);
      setInputValue("");
      setSearchEmail("");
      Toast.show({ type: "success", text1: "Friend added!" });
    } catch {
      Toast.show({ type: "error", text1: "Failed to add friend" });
    }
  };

  const handleRemove = async (friendUid: string) => {
    try {
      await removeFriend.mutateAsync(friendUid);
      Toast.show({ type: "success", text1: "Friend removed" });
    } catch {
      Toast.show({ type: "error", text1: "Failed to remove friend" });
    }
  };

  return (
    <AppLayout navigation={navigation} currentRoute="Friends">
      <PageHeader title="Friends" showBack refreshFunction={refetch} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search */}
        <View style={styles.searchWrapper}>
          <Ionicons
            name="search-outline"
            size={18}
            color={colors.gray[400]}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            value={inputValue}
            onChangeText={handleChange}
            placeholder="Search by email address..."
            placeholderTextColor={colors.gray[400]}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Search result */}
        {searchEmail && searchLoading && (
          <View style={styles.resultCard}>
            <ActivityIndicator size="small" color={colors.accent} />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        )}

        {searchEmail && !searchLoading && searchResult && (
          <View style={styles.resultCard}>
            <View style={styles.resultInfo}>
              <Text style={styles.resultName}>{searchResult.name}</Text>
              <Text style={styles.resultEmail}>{searchResult.email}</Text>
            </View>
            {isFriend(searchResult.uid) ? (
              <View style={styles.alreadyAdded}>
                <Text style={styles.alreadyAddedText}>Already added</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.addBtn,
                  addFriend.isPending && styles.btnDisabled,
                ]}
                onPress={() => handleAdd(searchResult.uid)}
                disabled={addFriend.isPending}
              >
                <Ionicons
                  name="person-add-outline"
                  size={14}
                  color={colors.white}
                />
                <Text style={styles.addBtnText}>
                  {addFriend.isPending ? "Adding…" : "Add"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {searchEmail && !searchLoading && !searchResult && (
          <View style={[styles.resultCard, styles.noResultCard]}>
            <Text style={styles.noResultText}>
              No users found with this email
            </Text>
          </View>
        )}

        {/* Friends list */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>YOUR FRIENDS</Text>
          {friendsLoading && friends.length === 0 ? (
            <LoadingSpinner />
          ) : friends.length === 0 ? (
            <Text style={styles.emptyText}>
              No friends yet. Search above to add some!
            </Text>
          ) : (
            <View style={styles.friendsList}>
              {friends.map((f) => (
                <View key={f.uid} style={styles.friendRow}>
                  <View style={styles.friendAvatar}>
                    <Text style={styles.friendAvatarText}>
                      {f.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName} numberOfLines={1}>
                      {f.name}
                    </Text>
                    <Text style={styles.friendEmail} numberOfLines={1}>
                      {f.email}
                    </Text>
                  </View>
                  <View style={styles.friendActions}>
                    <TouchableOpacity
                      style={styles.bankBtn}
                      onPress={() => setBankDetailsFriend(f)}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Ionicons
                        name="card-outline"
                        size={16}
                        color={colors.indigo[600]}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() => handleRemove(f.uid)}
                      disabled={removeFriend.isPending}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Ionicons
                        name="person-remove-outline"
                        size={16}
                        color={colors.red[400]}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {bankDetailsFriend && appUser && (
        <BankDetailsModal
          viewer={appUser}
          friend={bankDetailsFriend}
          onClose={() => setBankDetailsFriend(null)}
        />
      )}
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing["3xl"], gap: spacing.xl },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radius.md,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
  },
  searchIcon: { marginRight: spacing.sm },
  searchInput: {
    flex: 1,
    paddingVertical: 13,
    fontSize: fontSize.sm,
    color: colors.gray[900],
  },
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  noResultCard: {
    justifyContent: "center",
  },
  loadingText: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
  },
  resultInfo: { flex: 1, minWidth: 0 },
  resultName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.gray[900],
  },
  resultEmail: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    marginTop: 2,
  },
  alreadyAdded: {
    backgroundColor: colors.green[100],
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  alreadyAddedText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.green[700],
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
  btnDisabled: { opacity: 0.6 },
  noResultText: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    textAlign: "center",
  },
  section: { gap: spacing.sm },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.gray[500],
    letterSpacing: 0.5,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    textAlign: "center",
    paddingVertical: spacing.xl,
  },
  friendsList: { gap: spacing.md },
  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray[100],
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    padding: spacing.md,
  },
  friendAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.accentLight,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  friendAvatarText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.accent,
  },
  friendInfo: { flex: 1, minWidth: 0 },
  friendName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.gray[900],
  },
  friendEmail: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    marginTop: 2,
  },
  friendActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flexShrink: 0,
  },
  bankBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.indigo[200],
    backgroundColor: colors.indigo[50],
    justifyContent: "center",
    alignItems: "center",
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.red[200],
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
  },
  modalSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: spacing["3xl"],
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
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
  modalSubtitle: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    marginTop: 1,
  },
  modalBody: {
    padding: spacing.xl,
  },
  modalCenter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing["2xl"],
  },
  accessDeniedBox: {
    borderRadius: radius.lg,
    backgroundColor: colors.yellow[100],
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.sm,
  },
  accessDeniedTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.yellow[700],
  },
  accessDeniedDesc: {
    fontSize: fontSize.xs,
    color: colors.yellow[700],
    textAlign: "center",
    lineHeight: 17,
  },
  emptyBox: {
    paddingVertical: spacing["2xl"],
    alignItems: "center",
  },
  bankList: { gap: spacing.md },
  bankCard: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radius.lg,
    backgroundColor: colors.gray[50],
    padding: spacing.md,
    gap: 3,
  },
  bankName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.gray[900],
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  bankAccount: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    fontVariant: ["tabular-nums"],
  },
  copyBtn: {
    padding: spacing.xs,
    borderRadius: radius.sm,
    flexShrink: 0,
  },
  bankHolder: {
    fontSize: fontSize.xs,
    color: colors.gray[600],
  },
});
