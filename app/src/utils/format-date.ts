import type { Timestamp } from "firebase/firestore";

export function formatDate(timestamp: Timestamp | null | undefined): string {
  if (!timestamp) return "";
  const date = timestamp.toDate();
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
