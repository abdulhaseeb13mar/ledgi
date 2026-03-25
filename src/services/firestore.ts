import { db } from "@/lib/firebase";
import { DEFAULT_CURRENCY } from "@/types/currency.types";
import type { Due } from "@/types/due.types";
import type { AppUser } from "@/types/user.types";
import { collection, doc, documentId, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc, where, writeBatch } from "firebase/firestore";

// ─── Users ───────────────────────────────────────────────

export async function createUser(uid: string, name: string, email: string): Promise<void> {
  await setDoc(doc(db, "users", uid), {
    uid,
    name,
    email,
    emailLowercase: email.toLowerCase(),
    createdAt: serverTimestamp(),
    preferredCurrency: DEFAULT_CURRENCY,
  });
}

export async function updateUserCurrency(uid: string, currency: string): Promise<void> {
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

export async function searchUsers(searchQuery: string, currentUserId: string): Promise<AppUser[]> {
  if (!searchQuery.trim()) return [];
  const lower = searchQuery.toLowerCase();

  // Search by email prefix
  const emailQ = query(collection(db, "users"), where("emailLowercase", ">=", lower), where("emailLowercase", "<=", lower + "\uf8ff"));

  // Search by name prefix (case-sensitive start)
  const nameQ = query(collection(db, "users"), where("name", ">=", searchQuery), where("name", "<=", searchQuery + "\uf8ff"));

  const [emailSnap, nameSnap] = await Promise.all([getDocs(emailQ), getDocs(nameQ)]);

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

// ─── Dues ────────────────────────────────────────────────

export async function createDues(creatorId: string, entries: { owerId: string; amount: number }[], description: string, currency: string): Promise<void> {
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
  const q = query(collection(db, "dues"), where("owerId", "==", userId), where("status", "in", ["active", "resolve_requested"]), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Due);
}

export async function getDuesOwedToMe(userId: string): Promise<Due[]> {
  const q = query(
    collection(db, "dues"),
    where("creatorId", "==", userId),
    where("status", "in", ["active", "resolve_requested"]),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Due);
}

export async function getDuesIOweToUser(myId: string, creatorId: string): Promise<Due[]> {
  const q = query(
    collection(db, "dues"),
    where("owerId", "==", myId),
    where("creatorId", "==", creatorId),
    where("status", "in", ["active", "resolve_requested"]),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Due);
}

export async function getDuesUserOwesToMe(myId: string, owerId: string): Promise<Due[]> {
  const q = query(
    collection(db, "dues"),
    where("creatorId", "==", myId),
    where("owerId", "==", owerId),
    where("status", "in", ["active", "resolve_requested"]),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Due);
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
    batch.update(doc(db, "dues", id), {
      status: "resolved",
    });
  }
  await batch.commit();
}

export async function getDuesPendingMyConfirmation(userId: string): Promise<Due[]> {
  const q = query(collection(db, "dues"), where("creatorId", "==", userId), where("status", "==", "resolve_requested"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Due);
}

export async function getDuesPendingOthersConfirmation(userId: string): Promise<Due[]> {
  const q = query(collection(db, "dues"), where("owerId", "==", userId), where("status", "==", "resolve_requested"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Due);
}
