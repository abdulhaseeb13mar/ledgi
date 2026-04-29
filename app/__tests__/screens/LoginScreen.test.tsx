import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import LoginScreen from "../../src/screens/auth/LoginScreen";

jest.mock("../../src/lib/firebase", () => ({
  auth: { currentUser: null },
  db: {},
}));

jest.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: jest.fn(),
  getReactNativePersistence: jest.fn(),
  initializeAuth: jest.fn(() => ({ currentUser: null })),
}));

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

jest.mock("../../src/providers/auth.provider", () => ({
  useAuthContext: () => ({ user: null, loading: false }),
  AuthProvider: ({ children }: any) => children,
}));

describe("LoginScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders email and password inputs", () => {
    render(
      <LoginScreen navigation={mockNavigation as any} route={{} as any} />,
    );
    expect(screen.getByPlaceholderText("you@example.com")).toBeTruthy();
    expect(screen.getByPlaceholderText("••••••••")).toBeTruthy();
  });

  it("renders Sign In button", () => {
    render(
      <LoginScreen navigation={mockNavigation as any} route={{} as any} />,
    );
    expect(screen.getByText("Sign In")).toBeTruthy();
  });

  it("calls signInWithEmailAndPassword with input values", async () => {
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
      user: { uid: "u1" },
    });
    render(
      <LoginScreen navigation={mockNavigation as any} route={{} as any} />,
    );

    fireEvent.changeText(
      screen.getByPlaceholderText("you@example.com"),
      "test@test.com",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("••••••••"),
      "password123",
    );
    fireEvent.press(screen.getByText("Sign In"));

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        "test@test.com",
        "password123",
      );
    });
  });

  it("shows error toast on invalid credentials", async () => {
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce(
      new Error("auth/wrong-password"),
    );
    const Toast = require("react-native-toast-message").default;

    render(
      <LoginScreen navigation={mockNavigation as any} route={{} as any} />,
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("you@example.com"),
      "bad@test.com",
    );
    fireEvent.changeText(screen.getByPlaceholderText("••••••••"), "wrongpass");
    fireEvent.press(screen.getByText("Sign In"));

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({ type: "error" }),
      );
    });
  });

  it("navigates to Register screen", () => {
    render(
      <LoginScreen navigation={mockNavigation as any} route={{} as any} />,
    );
    fireEvent.press(screen.getByText("Register"));
    expect(mockNavigation.navigate).toHaveBeenCalledWith("Register");
  });

  it("navigates to ForgotPassword screen", () => {
    render(
      <LoginScreen navigation={mockNavigation as any} route={{} as any} />,
    );
    fireEvent.press(screen.getByText("Forgot password?"));
    expect(mockNavigation.navigate).toHaveBeenCalledWith("ForgotPassword");
  });
});
