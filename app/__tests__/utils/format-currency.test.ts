import { formatAmount, groupByCurrency } from "../../src/utils/format-currency";
import type { Due } from "../../src/types/due.types";

describe("formatAmount", () => {
  it("formats amount correctly for PKR", () => {
    const result = formatAmount(1000, "PKR");
    expect(result).toContain("1,000");
  });

  it("formats amount correctly for USD", () => {
    const result = formatAmount(99.99, "USD");
    expect(result).toContain("99.99");
  });

  it("handles zero amount", () => {
    const result = formatAmount(0, "PKR");
    expect(result).toContain("0");
  });

  it("falls back gracefully for unknown currency", () => {
    const result = formatAmount(500, "XYZ");
    expect(result).toBeTruthy();
  });
});

describe("groupByCurrency", () => {
  it("groups dues by currency and sums totals", () => {
    const dues: Partial<Due>[] = [
      {
        id: "1",
        currency: "PKR",
        amount: 100,
        status: "active",
        creatorId: "a",
        owerId: "b",
        description: "d",
        createdAt: null as any,
      },
      {
        id: "2",
        currency: "PKR",
        amount: 200,
        status: "active",
        creatorId: "a",
        owerId: "b",
        description: "d",
        createdAt: null as any,
      },
      {
        id: "3",
        currency: "USD",
        amount: 50,
        status: "active",
        creatorId: "a",
        owerId: "b",
        description: "d",
        createdAt: null as any,
      },
    ];
    const result = groupByCurrency(dues as Due[]);
    expect(result).toHaveLength(2);
    const pkr = result.find((r) => r.currency === "PKR");
    expect(pkr?.total).toBe(300);
    const usd = result.find((r) => r.currency === "USD");
    expect(usd?.total).toBe(50);
  });

  it("returns empty array for no dues", () => {
    const result = groupByCurrency([]);
    expect(result).toHaveLength(0);
  });

  it("uses DEFAULT_CURRENCY for dues without currency", () => {
    const dues: Partial<Due>[] = [
      {
        id: "1",
        amount: 100,
        status: "active",
        creatorId: "a",
        owerId: "b",
        description: "d",
        createdAt: null as any,
      },
    ];
    const result = groupByCurrency(dues as Due[]);
    expect(result).toHaveLength(1);
    expect(result[0].total).toBe(100);
  });
});
