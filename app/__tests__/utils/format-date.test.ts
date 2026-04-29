import { formatDate } from "../../src/utils/format-date";

// Mock Firestore Timestamp shape
const mockTimestamp = (seconds: number) => ({
  seconds,
  nanoseconds: 0,
  toDate: () => new Date(seconds * 1000),
});

describe("formatDate", () => {
  it("formats a valid timestamp", () => {
    const ts = mockTimestamp(1700000000) as any;
    const result = formatDate(ts);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("returns fallback for null", () => {
    const result = formatDate(null as any);
    expect(result).toBe("");
  });

  it("returns fallback for undefined", () => {
    const result = formatDate(undefined as any);
    expect(result).toBe("");
  });
});
