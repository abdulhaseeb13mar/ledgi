import {
  colors,
  fontSize,
  fontWeight,
  radius,
  spacing,
} from "@/constants/theme";
import { EMAIL_REGEX } from "@/constants/misc";
import {
  useAddFriendMutation,
  useFriendsQuery,
  useSearchUserByEmailQuery,
  useSearchUsersQuery,
} from "@/hooks/api";
import { useAuthContext } from "@/providers/auth.provider";
import type { AppUser } from "@/types/user.types";
import { Ionicons } from "@expo/vector-icons";
import debounce from "lodash.debounce";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

interface UserSearchInputProps {
  selectedUsers: AppUser[];
  onSelect: (user: AppUser) => void;
  onRemove: (uid: string) => void;
}

interface SearchResult {
  user: AppUser;
  type: "friend" | "global" | "search";
  isFriend?: boolean;
}

export default function UserSearchInput({
  selectedUsers,
  onSelect,
  onRemove,
}: UserSearchInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [addedFriends, setAddedFriends] = useState<Set<string>>(new Set());
  const { user } = useAuthContext();

  const isValidEmailQuery = EMAIL_REGEX.test(searchQuery);

  const { data: friends = [] } = useFriendsQuery(user?.uid);
  const { data: globalResults = [], isLoading: isSearchLoading } =
    useSearchUsersQuery(isValidEmailQuery ? searchQuery : "", user?.uid);
  const { data: emailSearchResult, isLoading: isEmailSearchLoading } =
    useSearchUserByEmailQuery(searchQuery, user?.uid);
  const addFriendMutation = useAddFriendMutation(user?.uid);

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchQuery(value);
      }, 300),
    [],
  );

  const handleChange = (value: string) => {
    setInputValue(value);
    debouncedSearch(value);
  };

  const handleSelectUser = (selectedUser: AppUser) => {
    if (!selectedUsers.find((u) => u.uid === selectedUser.uid)) {
      onSelect(selectedUser);
    }
    setInputValue("");
    setSearchQuery("");
  };

  const handleAddFriend = async (friendUid: string) => {
    try {
      await addFriendMutation.mutateAsync(friendUid);
      setAddedFriends((prev) => new Set([...prev, friendUid]));
      Toast.show({ type: "success", text1: "Friend added!" });
    } catch {
      Toast.show({ type: "error", text1: "Failed to add friend" });
    }
  };

  const getSearchResults = (): SearchResult[] => {
    if (!inputValue.trim()) return [];

    const results: SearchResult[] = [];
    const seen = new Set<string>();
    const isEmailSearch = inputValue.includes("@");

    friends.forEach((friend) => {
      if (
        friend.name.toLowerCase().includes(inputValue.toLowerCase()) ||
        friend.email.toLowerCase().includes(inputValue.toLowerCase())
      ) {
        if (!seen.has(friend.uid)) {
          results.push({ user: friend, type: "friend", isFriend: true });
          seen.add(friend.uid);
        }
      }
    });

    if (
      isEmailSearch &&
      emailSearchResult &&
      !seen.has(emailSearchResult.uid)
    ) {
      const isFriend = friends.some((f) => f.uid === emailSearchResult.uid);
      if (!isFriend) {
        results.push({
          user: emailSearchResult,
          type: "global",
          isFriend: false,
        });
        seen.add(emailSearchResult.uid);
      }
    }

    globalResults.forEach((result) => {
      if (!seen.has(result.uid)) {
        const isFriend = friends.some((f) => f.uid === result.uid);
        results.push({ user: result, type: "search", isFriend });
        seen.add(result.uid);
      }
    });

    return results;
  };

  const searchResults = getSearchResults();
  const filteredResults = searchResults.filter(
    (r) => !selectedUsers.find((s) => s.uid === r.user.uid),
  );
  const isLoading = isSearchLoading || isEmailSearchLoading;

  const availableFriends = friends.filter(
    (f) => !selectedUsers.find((s) => s.uid === f.uid),
  );

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.inputWrapper}>
        <Ionicons
          name="search-outline"
          size={18}
          color={colors.gray[400]}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          value={inputValue}
          onChangeText={handleChange}
          placeholder="Search friends by name or email..."
          placeholderTextColor={colors.gray[400]}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="default"
        />
      </View>

      {/* Search Results Dropdown */}
      {inputValue.trim() ? (
        <View style={styles.dropdown}>
          {isLoading && (
            <View style={styles.dropdownRow}>
              <ActivityIndicator size="small" color={colors.accent} />
              <Text style={styles.dropdownMeta}> Loading...</Text>
            </View>
          )}

          {!isLoading && filteredResults.length === 0 && (
            <View style={styles.dropdownRow}>
              <Text style={styles.dropdownMeta}>No users found</Text>
            </View>
          )}

          {!isLoading && filteredResults.length > 0 && (
            <FlatList
              data={filteredResults}
              keyExtractor={(item) => item.user.uid}
              scrollEnabled={false}
              renderItem={({ item }) => {
                const { user: u, type } = item;
                const isFriend = type === "friend";
                return (
                  <View style={styles.resultRow}>
                    <TouchableOpacity
                      style={styles.resultInfo}
                      onPress={() => handleSelectUser(u)}
                      activeOpacity={0.7}
                    >
                      {!isFriend && (
                        <Text style={styles.sectionLabel}>
                          {type === "friend" ? "FRIEND" : "OTHER USER"}
                        </Text>
                      )}
                      <Text style={styles.resultName}>{u.name}</Text>
                      <Text style={styles.resultEmail}>{u.email}</Text>
                    </TouchableOpacity>
                    {!isFriend && (
                      <TouchableOpacity
                        onPress={() => handleAddFriend(u.uid)}
                        disabled={
                          addedFriends.has(u.uid) || addFriendMutation.isPending
                        }
                        style={styles.addFriendBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        {addedFriends.has(u.uid) ? (
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color={colors.green[600]}
                          />
                        ) : (
                          <Ionicons
                            name="person-add-outline"
                            size={20}
                            color={colors.accent}
                          />
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                );
              }}
            />
          )}
        </View>
      ) : availableFriends.length > 0 ? (
        /* Friends List when no search query */
        <View style={styles.friendsSection}>
          <Text style={styles.friendsSectionLabel}>YOUR FRIENDS</Text>
          {availableFriends.map((u) => (
            <TouchableOpacity
              key={u.uid}
              style={styles.friendItem}
              onPress={() => handleSelectUser(u)}
              activeOpacity={0.7}
            >
              <View style={styles.friendAvatar}>
                <Text style={styles.friendAvatarText}>
                  {u.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.friendInfo}>
                <Text style={styles.resultName} numberOfLines={1}>
                  {u.name}
                </Text>
                <Text style={styles.resultEmail} numberOfLines={1}>
                  {u.email}
                </Text>
              </View>
              <Ionicons name="add" size={18} color={colors.gray[400]} />
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      {/* Selected Users Pills */}
      {selectedUsers.length > 0 && (
        <View style={styles.pillsContainer}>
          {selectedUsers.map((u) => (
            <View key={u.uid} style={styles.pill}>
              <Text style={styles.pillText}>{u.name}</Text>
              <TouchableOpacity
                onPress={() => onRemove(u.uid)}
                hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
              >
                <Ionicons name="close" size={14} color={colors.accent} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radius.md,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: 13,
    fontSize: fontSize.base,
    color: colors.gray[900],
  },
  dropdown: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radius.md,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    overflow: "hidden",
  },
  dropdownRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    justifyContent: "center",
  },
  dropdownMeta: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
  },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.gray[400],
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[50],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  resultInfo: {
    flex: 1,
    minWidth: 0,
  },
  resultName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.gray[900],
  },
  resultEmail: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    marginTop: 1,
  },
  addFriendBtn: {
    padding: spacing.xs,
  },
  friendsSection: {
    gap: spacing.sm,
  },
  friendsSectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.gray[500],
    letterSpacing: 0.5,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.gray[100],
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
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
  friendInfo: {
    flex: 1,
    minWidth: 0,
  },
  pillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.accentLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  pillText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.accent,
  },
});
