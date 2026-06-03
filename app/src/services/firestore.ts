import { db } from "@/lib/firebase";
import { DEFAULT_CURRENCY } from "@/types/currency.types";
import type { Due } from "@/types/due.types";
import type { AppUser, BankDetail } from "@/types/user.types";
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
  const dueDocs = await Promise.all(
    dueIds.map((id) => getDoc(doc(db, "dues", id))),
  );
  const dues = dueDocs.map((d) => d.data() as Due).filter(Boolean);

  const batch = writeBatch(db);
  for (const id of dueIds) {
    batch.update(doc(db, "dues", id), {
      status: "resolve_requested",
      resolveRequestedAt: serverTimestamp(),
    });
  }
  await batch.commit();

  const owerId = dues[0]?.owerId;
  if (!owerId) return;
  const ower = await getUserById(owerId);
  if (!ower) return;

  const byCreator = new Map<string, Due[]>();
  for (const due of dues) {
    const list = byCreator.get(due.creatorId) ?? [];
    list.push(due);
    byCreator.set(due.creatorId, list);
  }

  const creators = await getUsersByIds([...byCreator.keys()]);
  const creatorMap = new Map(creators.map((u) => [u.uid, u]));

  const mailBatch = writeBatch(db);
  for (const [creatorId, creatorDues] of byCreator) {
    const creator = creatorMap.get(creatorId);
    if (!creator) continue;
    const count = creatorDues.length;
    const label = count === 1 ? "a due" : `${count} dues`;
    const duesList = creatorDues
      .map((d) => `• "${d.description}" — ${d.currency ? `${d.currency} ` : ""}${d.amount}`)
      .join("\n");
    mailBatch.set(doc(collection(db, "mail")), {
      to: creator.email,
      message: {
        subject: `${ower.name} is requesting to settle ${label}`,
        text: `Hi ${creator.name}, ${ower.name} has marked the following ${label} as paid and is requesting your confirmation:\n\n${duesList}\n\nLog in to Khaata Ledger to confirm or reject: https://khaata-ledger.web.app`,
      },
    });
  }
  await mailBatch.commit();
}

export async function confirmResolve(dueIds: string[]): Promise<void> {
  const dueDocs = await Promise.all(
    dueIds.map((id) => getDoc(doc(db, "dues", id))),
  );
  const dues = dueDocs.map((d) => d.data() as Due).filter(Boolean);

  const batch = writeBatch(db);
  for (const id of dueIds) {
    batch.update(doc(db, "dues", id), { status: "resolved" });
  }
  await batch.commit();

  const creatorId = dues[0]?.creatorId;
  if (!creatorId) return;
  const creator = await getUserById(creatorId);
  if (!creator) return;

  const byOwer = new Map<string, Due[]>();
  for (const due of dues) {
    const list = byOwer.get(due.owerId) ?? [];
    list.push(due);
    byOwer.set(due.owerId, list);
  }

  const owers = await getUsersByIds([...byOwer.keys()]);
  const owerMap = new Map(owers.map((u) => [u.uid, u]));

  const mailBatch = writeBatch(db);
  for (const [owerId, owerDues] of byOwer) {
    const ower = owerMap.get(owerId);
    if (!ower) continue;
    const count = owerDues.length;
    const duesList = owerDues
      .map((d) => `• "${d.description}" — ${d.currency ? `${d.currency} ` : ""}${d.amount}`)
      .join("\n");
    mailBatch.set(doc(collection(db, "mail")), {
      to: ower.email,
      message: {
        subject: `${creator.name} confirmed ${count === 1 ? "a due" : `${count} dues`} as settled`,
        text: `Hi ${ower.name}, ${creator.name} has confirmed the following ${count === 1 ? "due" : "dues"} as settled:\n\n${duesList}`,
      },
    });
  }
  await mailBatch.commit();
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

// ─── Bank Details ─────────────────────────────────────────

export async function getBankDetails(userId: string): Promise<BankDetail[]> {
  const snap = await getDocs(
    collection(db, "users", userId, "bankDetails"),
  );
  return snap.docs
    .map((d) => d.data() as BankDetail)
    .sort(
      (a, b) =>
        (a.createdAt?.toMillis?.() ?? 0) - (b.createdAt?.toMillis?.() ?? 0),
    );
}

export async function addBankDetail(
  userId: string,
  data: { bankName: string; accountNumber: string; accountName: string },
): Promise<void> {
  const ref = doc(collection(db, "users", userId, "bankDetails"));
  await setDoc(ref, { ...data, id: ref.id, createdAt: serverTimestamp() });
}

export async function updateBankDetail(
  userId: string,
  bankDetailId: string,
  data: { bankName: string; accountNumber: string; accountName: string },
): Promise<void> {
  await updateDoc(
    doc(db, "users", userId, "bankDetails", bankDetailId),
    data,
  );
}

export async function deleteBankDetail(
  userId: string,
  bankDetailId: string,
): Promise<void> {
  await deleteDoc(doc(db, "users", userId, "bankDetails", bankDetailId));
}

// viewerId can see friendId's bank details only if friendId has added viewerId as a friend.
// bankDetailVisibility/{viewerId} can override this (future per-friend control).
export async function getFriendBankDetails(
  viewerId: string,
  friendId: string,
): Promise<BankDetail[] | null> {
  const friendSnap = await getDoc(
    doc(db, "users", friendId, "friends", viewerId),
  );
  if (!friendSnap.exists()) return null;

  const visibilitySnap = await getDoc(
    doc(db, "users", friendId, "bankDetailVisibility", viewerId),
  );
  if (visibilitySnap.exists() && visibilitySnap.data().visible === false)
    return null;

  return getBankDetails(friendId);
}

// For future per-friend visibility control
export async function setBankDetailVisibility(
  userId: string,
  friendId: string,
  visible: boolean,
): Promise<void> {
  await setDoc(
    doc(db, "users", userId, "bankDetailVisibility", friendId),
    { visible },
  );
}
