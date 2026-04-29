import {
  createUser,
  getUserById,
  getDuesIOwe,
  requestResolve,
  confirmResolve,
  rejectResolve,
} from "../../src/services/firestore";

// Firebase mocks provided in jest.setup.ts
const mockDocRef = {};
const mockBatch = {
  update: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  commit: jest.fn().mockResolvedValue(undefined),
};

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(() => mockDocRef),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  query: jest.fn(),
  collection: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  writeBatch: jest.fn(() => mockBatch),
  serverTimestamp: jest.fn(() => ({ seconds: 0, nanoseconds: 0 })),
  orderBy: jest.fn(),
  limit: jest.fn(),
  startAt: jest.fn(),
  endAt: jest.fn(),
  or: jest.fn(),
  arrayUnion: jest.fn(),
  arrayRemove: jest.fn(),
}));

jest.mock("../../src/lib/firebase", () => ({
  db: {},
  auth: { currentUser: null },
}));

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocs,
  writeBatch,
} from "firebase/firestore";

describe("firestore service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    it("calls setDoc with user data", async () => {
      (setDoc as jest.Mock).mockResolvedValueOnce(undefined);
      await createUser("uid123", "Alice", "alice@example.com");
      expect(setDoc).toHaveBeenCalledTimes(1);
    });

    it("throws when setDoc fails", async () => {
      (setDoc as jest.Mock).mockRejectedValueOnce(new Error("Firestore error"));
      await expect(
        createUser("uid123", "Alice", "alice@example.com"),
      ).rejects.toThrow();
    });
  });

  describe("getUserById", () => {
    it("returns null when doc does not exist", async () => {
      (getDoc as jest.Mock).mockResolvedValueOnce({ exists: () => false });
      const result = await getUserById("uid123");
      expect(result).toBeNull();
    });

    it("returns user data when doc exists", async () => {
      (getDoc as jest.Mock).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          uid: "uid123",
          name: "Alice",
          email: "alice@example.com",
        }),
      });
      const result = await getUserById("uid123");
      expect(result).toMatchObject({ name: "Alice" });
    });
  });

  describe("getDuesIOwe", () => {
    it("returns empty array when no dues", async () => {
      (getDocs as jest.Mock).mockResolvedValueOnce({ docs: [] });
      const result = await getDuesIOwe("uid123");
      expect(result).toEqual([]);
    });

    it("returns mapped dues", async () => {
      const fakeDue = {
        id: "due1",
        data: () => ({
          id: "due1",
          owerId: "uid123",
          creatorId: "creator1",
          amount: 100,
          currency: "PKR",
          description: "Test",
          status: "active",
          createdAt: null,
        }),
      };
      (getDocs as jest.Mock).mockResolvedValueOnce({ docs: [fakeDue] });
      const result = await getDuesIOwe("uid123");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("due1");
    });
  });

  describe("requestResolve", () => {
    it("calls batch.update for each due id and commits", async () => {
      await requestResolve(["due1", "due2"]);
      expect(mockBatch.update).toHaveBeenCalledTimes(2);
      expect(mockBatch.commit).toHaveBeenCalledTimes(1);
    });
  });

  describe("confirmResolve", () => {
    it("calls batch.update for each due id and commits", async () => {
      await confirmResolve(["due1"]);
      expect(mockBatch.update).toHaveBeenCalledTimes(1);
      expect(mockBatch.commit).toHaveBeenCalledTimes(1);
    });
  });

  describe("rejectResolve", () => {
    it("calls batch.update for each due id and commits", async () => {
      await rejectResolve(["due1", "due2", "due3"]);
      expect(mockBatch.update).toHaveBeenCalledTimes(3);
      expect(mockBatch.commit).toHaveBeenCalledTimes(1);
    });
  });
});
