import React from "react";
import { render, screen } from "@testing-library/react-native";
import DueItem from "../../src/components/DueItem";
import type { Due } from "../../src/types/due.types";

const baseDue: Due = {
  id: "due1",
  owerId: "user1",
  creatorId: "creator1",
  amount: 500,
  currency: "PKR",
  description: "Coffee",
  status: "active",
  createdAt: {
    seconds: 1700000000,
    nanoseconds: 0,
    toDate: () => new Date(1700000000000),
  } as any,
};

describe("DueItem", () => {
  it("renders description", () => {
    render(<DueItem due={baseDue} variant="owed" />);
    expect(screen.getByText("Coffee")).toBeTruthy();
  });

  it("shows resolve_requested badge", () => {
    const due = { ...baseDue, status: "resolve_requested" as const };
    render(<DueItem due={due} variant="owed" />);
    expect(screen.getByText("Resolve Requested")).toBeTruthy();
  });

  it("renders selectable with checkbox", () => {
    render(
      <DueItem
        due={baseDue}
        variant="owed"
        selectable
        selected={false}
        onToggle={jest.fn()}
      />,
    );
    const checkbox = screen.getByTestId("custom-checkbox");
    expect(checkbox).toBeTruthy();
  });

  it("renders selected state", () => {
    render(
      <DueItem
        due={baseDue}
        variant="owed"
        selectable
        selected={true}
        onToggle={jest.fn()}
      />,
    );
    const checkbox = screen.getByTestId("custom-checkbox");
    expect(checkbox).toBeTruthy();
  });

  it("renders showUser text", () => {
    render(<DueItem due={baseDue} variant="owed" showUser="Alice" />);
    expect(screen.getByText("Alice")).toBeTruthy();
  });
});
