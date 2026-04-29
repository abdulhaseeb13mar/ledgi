export const duesKeys = {
  all: ["dues"] as const,
  iOwe: (userId: string) => [...duesKeys.all, "i-owe", userId] as const,
  owedToMe: (userId: string) =>
    [...duesKeys.all, "owed-to-me", userId] as const,
  iOweToUser: (myId: string, userId: string) =>
    [...duesKeys.all, "i-owe-to-user", myId, userId] as const,
  userOwesToMe: (myId: string, userId: string) =>
    [...duesKeys.all, "user-owes-to-me", myId, userId] as const,
  pendingMyConfirmation: (userId: string) =>
    [...duesKeys.all, "pending-my-confirmation", userId] as const,
  pendingOthersConfirmation: (userId: string) =>
    [...duesKeys.all, "pending-others-confirmation", userId] as const,
};

export const usersKeys = {
  all: ["users"] as const,
  search: (query: string) => [...usersKeys.all, "search", query] as const,
  detail: (userId: string) => [...usersKeys.all, "detail", userId] as const,
  byIds: (ids: string[]) =>
    [...usersKeys.all, "by-ids", ...ids.sort()] as const,
};

export const friendsKeys = {
  all: ["friends"] as const,
  list: (userId: string) => [...friendsKeys.all, "list", userId] as const,
  searchByEmail: (email: string) =>
    [...friendsKeys.all, "search-email", email] as const,
};
