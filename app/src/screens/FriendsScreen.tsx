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
  useFriendsQuery,
  useRemoveFriendMutation,
  useSearchUserByEmailQuery,
} from "@/hooks/api";
import { useAuthContext } from "@/providers/auth.provider";
import type { RootStackParamList } from "@/navigation/types";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import debounce from "lodash.debounce";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

type Props = NativeStackScreenProps<RootStackParamList, "Friends">;

export default function FriendsScreen({ navigation }: Props) {
  const { user } = useAuthContext();
  const [inputValue, setInputValue] = useState("");
  const [searchEmail, setSearchEmail] = useState("");

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
                  <TouchableOpacity
                    onPress={() => handleRemove(f.uid)}
                    disabled={removeFriend.isPending}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name="person-remove-outline"
                      size={18}
                      color={colors.red[400]}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
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
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[100],
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    padding: spacing.md,
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentLight,
    justifyContent: "center",
    alignItems: "center",
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
});
