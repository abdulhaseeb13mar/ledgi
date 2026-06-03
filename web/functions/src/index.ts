import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { onDocumentCreated } from "firebase-functions/v2/firestore";

initializeApp();
const db = getFirestore();

async function getUserInfo(uid: string): Promise<{ name: string; email: string } | null> {
  const snap = await db.collection("users").doc(uid).get();
  if (!snap.exists) return null;
  const data = snap.data()!;
  return { name: data.name, email: data.email };
}

async function sendMail(to: string, subject: string, text: string): Promise<void> {
  await db.collection("mail").add({ to, message: { subject, text } });
}

// When a due is created → email the person who owes
export const onDueCreated = onDocumentCreated("dues/{dueId}", async (event) => {
  const due = event.data?.data();
  if (!due) return;

  const [creator, ower] = await Promise.all([getUserInfo(due.creatorId), getUserInfo(due.owerId)]);
  if (!creator || !ower) return;

  await sendMail(
    ower.email,
    `${creator.name} added a due for you`,
    `Hi ${ower.name}, ${creator.name} has recorded a due for you: "${due.description}" — ${due.currency} ${due.amount}. Log in to Khaata Ledger to view it.`,
  );
});

// When someone adds you as a friend → email you
export const onFriendAdded = onDocumentCreated("users/{userId}/friends/{friendId}", async (event) => {
  const { userId, friendId } = event.params;

  const [adder, added] = await Promise.all([getUserInfo(userId), getUserInfo(friendId)]);
  if (!adder || !added) return;

  await sendMail(added.email, `${adder.name} added you as a friend`, `Hi ${added.name}, ${adder.name} has added you as a friend on Khaata Ledger.`);
});
