import type { Timestamp } from "firebase/firestore";

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  emailLowercase: string;
  createdAt: Timestamp;
}
