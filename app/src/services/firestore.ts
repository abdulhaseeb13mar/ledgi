import { db } from "@/lib/firebase";
import { DEFAULT_CURRENCY } from "@/types/currency.types";
import type { Due } from "@/types/due.types";
import type { AppUser } from "@/types/user.types";
import {
  collection,
  deleteDoc,
  doc,
  documentId,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

const OPEN_DUE_STATUSES: Due["status"][] = ["active", "resolve_requested"];

function getTimestampMs(value: Due["createdAt"] | null | undefined): number {
  return value?.toMillis?.() ?? 0;
}

function sortByNewestCreatedAt(a: Due, b: Due): number {
  return getTimestampMs(b.createdAt) - getTimestampMs(a.createdAt);
}

// ─── Users ───────────────────────────────────────────────

export async function createUser(
  uid: string,
  name: string,
  email: string,
): Promise<void> {
  await setDoc(doc(db, "users", uid), {
    uid,
    name,
    email,
    emailLowercase: email.toLowerCase(),
    createdAt: serverTimestamp(),
    preferredCurrency: DEFAULT_CURRENCY,
  });
}

export async function updateUserCurrency(
  uid: string,
  currency: string,
): Promise<void> {
  await updateDoc(doc(db, "users", uid), { preferredCurrency: currency });
}

export async function getUserById(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as AppUser) : null;
}

export async function getUsersByIds(uids: string[]): Promise<AppUser[]> {
  if (uids.length === 0) return [];
  // Firestore 'in' queries max 30 items per batch
  const results: AppUser[] = [];
  for (let i = 0; i < uids.length; i += 30) {
    const batch = uids.slice(i, i + 30);
    const q = query(collection(db, "users"), where(documentId(), "in", batch));
    const snap = await getDocs(q);
    snap.forEach((d) => results.push(d.data() as AppUser));
  }
  return results;
}

export async function searchUsers(
  searchQuery: string,
  currentUserId: string,
): Promise<AppUser[]> {
  if (!searchQuery.trim()) return [];
  const lower = searchQuery.toLowerCase();

  const emailQ = query(
    collection(db, "users"),
    where("emailLowercase", ">=", lower),
    where("emailLowercase", "<=", lower + "\uf8ff"),
  );

  const nameQ = query(
    collection(db, "users"),
    where("name", ">=", searchQuery),
    where("name", "<=", searchQuery + "\uf8ff"),
  );

  const [emailSnap, nameSnap] = await Promise.all([
    getDocs(emailQ),
    getDocs(nameQ),
  ]);

  const map = new Map<string, AppUser>();
  emailSnap.forEach((d) => {
    const user = d.data() as AppUser;
    if (user.uid !== currentUserId) map.set(user.uid, user);
  });
  nameSnap.forEach((d) => {
    const user = d.data() as AppUser;
    if (user.uid !== currentUserId) map.set(user.uid, user);
  });

  return Array.from(map.values());
}

export async function searchUserByEmail(
  email: string,
  currentUserId: string,
): Promise<AppUser | null> {
  if (!email.trim()) return null;
  const lower = email.toLowerCase();
  const q = query(
    collection(db, "users"),
    where("emailLowercase", "==", lower),
  );
  const snap = await getDocs(q);
  for (const d of snap.docs) {
    const user = d.data() as AppUser;
    if (user.uid !== currentUserId) return user;
  }
  return null;
}

// ─── Dues ────────────────────────────────────────────────

export async function createDues(
  creatorId: string,
  entries: { owerId: string; amount: number }[],
  description: string,
  currency: string,
): Promise<void> {
  const batch = writeBatch(db);
  for (const entry of entries) {
    const ref = doc(collection(db, "dues"));
    batch.set(ref, {
      id: ref.id,
      creatorId,
      owerId: entry.owerId,
      amount: entry.amount,
      currency,
      description,
      status: "active",
      createdAt: serverTimestamp(),
      resolveRequestedAt: null,
    });
  }
  await batch.commit();
}

export async function getDuesIOwe(userId: string): Promise<Due[]> {
  const q = query(collection(db, "dues"), where("owerId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => d.data() as Due)
    .filter((due) => OPEN_DUE_STATUSES.includes(due.status))
    .sort(sortByNewestCreatedAt);
}

export async function getDuesOwedToMe(userId: string): Promise<Due[]> {
  const q = query(collection(db, "dues"), where("creatorId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => d.data() as Due)
    .filter((due) => OPEN_DUE_STATUSES.includes(due.status))
    .sort(sortByNewestCreatedAt);
}

export async function getDuesIOweToUser(
  myId: string,
  creatorId: string,
): Promise<Due[]> {
  const q = query(collection(db, "dues"), where("owerId", "==", myId));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => d.data() as Due)
    .filter(
      (due) =>
        due.creatorId === creatorId && OPEN_DUE_STATUSES.includes(due.status),
    )
    .sort(sortByNewestCreatedAt);
}

export async function getDuesUserOwesToMe(
  myId: string,
  owerId: string,
): Promise<Due[]> {
  const q = query(collection(db, "dues"), where("creatorId", "==", myId));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => d.data() as Due)
    .filter(
      (due) => due.owerId === owerId && OPEN_DUE_STATUSES.includes(due.status),
    )
    .sort(sortByNewestCreatedAt);
}

export async function requestResolve(dueIds: string[]): Promise<void> {
  const batch = writeBatch(db);
  for (const id of dueIds) {
    batch.update(doc(db, "dues", id), {
      status: "resolve_requested",
      resolveRequestedAt: serverTimestamp(),
    });
  }
  await batch.commit();
}

export async function confirmResolve(dueIds: string[]): Promise<void> {
  const batch = writeBatch(db);
  for (const id of dueIds) {
    batch.update(doc(db, "dues", id), { status: "resolved" });
  }
  await batch.commit();
}

export async function rejectResolve(dueIds: string[]): Promise<void> {
  const batch = writeBatch(db);
  for (const id of dueIds) {
    batch.update(doc(db, "dues", id), {
      status: "active",
      resolveRequestedAt: null,
    });
  }
  await batch.commit();
}

export async function getDuesPendingMyConfirmation(
  userId: string,
): Promise<Due[]> {
  const q = query(
    collection(db, "dues"),
    where("creatorId", "==", userId),
    where("status", "==", "resolve_requested"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Due).sort(sortByNewestCreatedAt);
}

export async function getDuesPendingOthersConfirmation(
  userId: string,
): Promise<Due[]> {
  const q = query(
    collection(db, "dues"),
    where("owerId", "==", userId),
    where("status", "==", "resolve_requested"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Due).sort(sortByNewestCreatedAt);
}

// ─── Friends ─────────────────────────────────────────────

export async function addFriend(
  currentUserId: string,
  friendUid: string,
): Promise<void> {
  await setDoc(doc(db, "users", currentUserId, "friends", friendUid), {
    uid: friendUid,
    createdAt: serverTimestamp(),
  });
}

export async function removeFriend(
  currentUserId: string,
  friendUid: string,
): Promise<void> {
  await deleteDoc(doc(db, "users", currentUserId, "friends", friendUid));
}

export async function getFriendIds(currentUserId: string): Promise<string[]> {
  const snap = await getDocs(collection(db, "users", currentUserId, "friends"));
  return snap.docs.map((d) => d.id);
}
