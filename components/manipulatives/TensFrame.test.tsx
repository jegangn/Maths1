import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TensFrame } from "./TensFrame";

describe("TensFrame", () => {
  it("renders 10 empty cells", () => {
    render(<TensFrame filled={0} onChange={() => {}} mode="fill" />);
    expect(screen.getAllByTestId("tf-cell").length).toBe(10);
  });

  it("renders n filled cells when filled=n", () => {
    render(<TensFrame filled={4} onChange={() => {}} mode="fill" />);
    expect(screen.getAllByTestId("tf-cell-filled").length).toBe(4);
  });

  it("calls onChange when a tray dot is tapped (fill mode)", () => {
    const onChange = vi.fn();
    render(<TensFrame filled={2} onChange={onChange} mode="fill" />);
    fireEvent.click(screen.getByTestId("tf-tray-dot"));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("calls onChange when a filled cell is tapped (take-away mode)", () => {
    const onChange = vi.fn();
    render(<TensFrame filled={5} onChange={onChange} mode="take-away" />);
    fireEvent.click(screen.getAllByTestId("tf-cell-filled")[0]);
    expect(onChange).toHaveBeenCalledWith(4);
  });
});
