import type { Timestamp } from "firebase/firestore";

export interface Due {
  id: string;
  creatorId: string;
  owerId: string;
  amount: number;
  currency?: string;
  description: string;
  status: "active" | "resolve_requested" | "resolved";
  createdAt: Timestamp;
  resolveRequestedAt: Timestamp | null;
}
