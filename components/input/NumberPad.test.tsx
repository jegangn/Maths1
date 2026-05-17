import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NumberPad } from "./NumberPad";

describe("NumberPad", () => {
  it("renders digits 0-9 and a confirm button", () => {
    render(<NumberPad onConfirm={() => {}} disabled={false} />);
    for (let d = 0; d <= 9; d++)
      expect(screen.getByTestId(`np-${d}`)).toBeInTheDocument();
    expect(screen.getByTestId("np-confirm")).toBeInTheDocument();
  });

  it("tapping digits builds the value, confirm emits it", () => {
    const onConfirm = vi.fn();
    render(<NumberPad onConfirm={onConfirm} disabled={false} />);
    fireEvent.click(screen.getByTestId("np-1"));
    fireEvent.click(screen.getByTestId("np-3"));
    fireEvent.click(screen.getByTestId("np-confirm"));
    expect(onConfirm).toHaveBeenCalledWith(13);
  });
});
