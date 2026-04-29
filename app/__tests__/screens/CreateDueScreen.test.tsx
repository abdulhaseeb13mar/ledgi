import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import CreateDueScreen from "../../src/screens/CreateDueScreen";

const mockCreateDues = jest.fn();

jest.mock("../../src/hooks/api", () => ({
  useCreateDuesMutation: () => ({
    mutateAsync: mockCreateDues,
    isPending: false,
  }),
  useFriendsQuery: () => ({ data: [] }),
  useSearchUsersQuery: () => ({ data: [], isLoading: false }),
  useSearchUserByEmailQuery: () => ({ data: null, isLoading: false }),
  useAddFriendMutation: () => ({ mutateAsync: jest.fn(), isPending: false }),
}));

jest.mock("../../src/providers/auth.provider", () => ({
  useAuthContext: () => ({
    user: { uid: "creator1" },
    appUser: { preferredCurrency: "PKR" },
    loading: false,
  }),
  AuthProvider: ({ children }: any) => children,
}));

jest.mock("../../src/components/AppLayout", () => {
  const { View } = require("react-native");
  return ({ children }: any) => <View>{children}</View>;
});

jest.mock("../../src/components/PageHeader", () => () => null);
jest.mock("../../src/components/HamburgerMenu", () => () => null);

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

const Toast = require("react-native-toast-message").default;

describe("CreateDueScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders description input", () => {
    render(
      <CreateDueScreen navigation={mockNavigation as any} route={{} as any} />,
    );
    expect(
      screen.getByPlaceholderText("e.g. Dinner at restaurant"),
    ).toBeTruthy();
  });

  it("shows error when submitting without description", async () => {
    render(
      <CreateDueScreen navigation={mockNavigation as any} route={{} as any} />,
    );
    fireEvent.press(screen.getByText("Create Due"));
    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error",
          text1: "Enter a description",
        }),
      );
    });
  });

  it("shows error when no users selected", async () => {
    render(
      <CreateDueScreen navigation={mockNavigation as any} route={{} as any} />,
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("e.g. Dinner at restaurant"),
      "Test due",
    );
    fireEvent.press(screen.getByText("Create Due"));
    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error",
          text1: "Select at least one user",
        }),
      );
    });
  });

  it("renders Create Due button", () => {
    render(
      <CreateDueScreen navigation={mockNavigation as any} route={{} as any} />,
    );
    expect(screen.getByText("Create Due")).toBeTruthy();
  });
});
