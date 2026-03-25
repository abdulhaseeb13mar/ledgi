import { DEFAULT_CURRENCY } from "@/types/currency.types";

export function formatAmount(amount: number, currencyCode?: string): string {
  const code = currencyCode || DEFAULT_CURRENCY;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback if the currency code is unrecognized
    return `${code} ${amount.toFixed(2)}`;
  }
}
