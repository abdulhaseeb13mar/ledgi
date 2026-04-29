import React from "react";
import { render, screen } from "@testing-library/react-native";
import UserDueTile from "../../src/components/UserDueTile";

describe("UserDueTile", () => {
  const defaultProps = {
    name: "Alice",
    email: "alice@example.com",
    amounts: [{ currency: "PKR", total: 1500 }],
    variant: "owed" as const,
    onPress: jest.fn(),
  };

  it("renders name and email", () => {
    render(<UserDueTile {...defaultProps} />);
    expect(screen.getByText("Alice")).toBeTruthy();
    expect(screen.getByText("alice@example.com")).toBeTruthy();
  });

  it("renders amount text", () => {
    render(<UserDueTile {...defaultProps} />);
    // Should contain amount info
    const amountElements = screen.getAllByText(/1,500|1500/);
    expect(amountElements.length).toBeGreaterThan(0);
  });

  it("renders receivable variant without error", () => {
    render(<UserDueTile {...defaultProps} variant="receivable" />);
    expect(screen.getByText("Alice")).toBeTruthy();
  });

  it("renders multiple currencies", () => {
    render(
      <UserDueTile
        {...defaultProps}
        amounts={[
          { currency: "PKR", total: 1000 },
          { currency: "USD", total: 50 },
        ]}
      />,
    );
    expect(screen.getByText("Alice")).toBeTruthy();
  });
});
