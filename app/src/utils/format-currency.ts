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

export function groupByCurrency(
  dues: { amount: number; currency?: string }[],
): { currency: string; total: number }[] {
  const map = new Map<string, number>();
  for (const due of dues) {
    const c = due.currency ?? DEFAULT_CURRENCY;
    map.set(c, (map.get(c) ?? 0) + due.amount);
  }
  return Array.from(map.entries()).map(([currency, total]) => ({
    currency,
    total,
  }));
}
