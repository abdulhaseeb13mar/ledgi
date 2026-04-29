import { auth } from "@/lib/firebase";
import { signOut as firebaseSignOut } from "firebase/auth";

export function getCurrentUser() {
  return auth.currentUser;
}

export function isAuthenticated() {
  return !!auth.currentUser;
}

export async function signOut() {
  await firebaseSignOut(auth);
}
