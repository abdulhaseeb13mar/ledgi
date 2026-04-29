import React from "react";
import { render, screen } from "@testing-library/react-native";
import DashboardScreen from "../../src/screens/DashboardScreen";

// Mock all hooks
jest.mock("../../src/hooks/api", () => ({
  useDuesIOweQuery: () => ({ data: [], isFetching: false }),
  useDuesOwedToMeQuery: () => ({ data: [], isFetching: false }),
  useDuesPendingMyConfirmationQuery: () => ({ data: [], isFetching: false }),
  useDuesPendingOthersConfirmationQuery: () => ({
    data: [],
    isFetching: false,
  }),
}));

jest.mock("../../src/providers/auth.provider", () => ({
  useAuthContext: () => ({
    user: { uid: "user1" },
    appUser: null,
    loading: false,
  }),
  AuthProvider: ({ children }: any) => children,
}));

// Mock AppLayout to render children only
jest.mock("../../src/components/AppLayout", () => {
  const { View } = require("react-native");
  return ({ children }: any) => <View>{children}</View>;
});

// Mock HamburgerMenu, PageHeader
jest.mock("../../src/components/HamburgerMenu", () => () => null);
jest.mock("../../src/components/PageHeader", () => () => null);

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

describe("DashboardScreen", () => {
  it("renders summary cards", () => {
    render(
      <DashboardScreen navigation={mockNavigation as any} route={{} as any} />,
    );
    expect(screen.getByText("Owed to You")).toBeTruthy();
    expect(screen.getByText("You Owe")).toBeTruthy();
  });

  it("renders all action buttons", () => {
    render(
      <DashboardScreen navigation={mockNavigation as any} route={{} as any} />,
    );
    expect(screen.getByText("Create a Due")).toBeTruthy();
    expect(screen.getByText("Friends")).toBeTruthy();
    expect(screen.getByText("Dues I Owe")).toBeTruthy();
    expect(screen.getByText("Dues Owed to Me")).toBeTruthy();
    expect(screen.getByText("Confirm Resolved Dues")).toBeTruthy();
    expect(screen.getByText("Pending Confirmations")).toBeTruthy();
  });
});
