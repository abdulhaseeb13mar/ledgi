import type { Timestamp } from "firebase/firestore";

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  emailLowercase: string;
  createdAt: Timestamp;
  preferredCurrency?: string;
}

export interface BankDetail {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  createdAt: Timestamp;
}
