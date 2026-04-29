import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import CustomCheckbox from "../../src/components/CustomCheckbox";

describe("CustomCheckbox", () => {
  it("renders unchecked state", () => {
    render(<CustomCheckbox checked={false} onPress={jest.fn()} />);
    const checkbox = screen.getByTestId("custom-checkbox");
    expect(checkbox).toBeTruthy();
  });

  it("renders checked state with checkmark", () => {
    render(<CustomCheckbox checked={true} onPress={jest.fn()} />);
    const checkbox = screen.getByTestId("custom-checkbox");
    expect(checkbox).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    const onPress = jest.fn();
    render(<CustomCheckbox checked={false} onPress={onPress} />);
    const checkbox = screen.getByTestId("custom-checkbox");
    fireEvent.press(checkbox);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not call onPress when disabled", () => {
    const onPress = jest.fn();
    render(<CustomCheckbox checked={false} onPress={onPress} disabled />);
    const checkbox = screen.getByTestId("custom-checkbox");
    fireEvent.press(checkbox);
    expect(onPress).not.toHaveBeenCalled();
  });
});
