import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DoubleTensFrame } from "./DoubleTensFrame";

describe("DoubleTensFrame", () => {
  it("renders 20 cells total", () => {
    render(<DoubleTensFrame leftFilled={0} rightFilled={0} onAdd={() => {}} />);
    expect(screen.getAllByTestId(/dtf-cell/).length).toBe(20);
  });

  it("first 10 dots fill the left frame, then spill into right", () => {
    const onAdd = vi.fn();
    const { rerender } = render(
      <DoubleTensFrame leftFilled={9} rightFilled={0} onAdd={onAdd} />,
    );
    fireEvent.click(screen.getByTestId("dtf-tray-dot"));
    expect(onAdd).toHaveBeenCalledWith({ left: 10, right: 0 });
    rerender(<DoubleTensFrame leftFilled={10} rightFilled={0} onAdd={onAdd} />);
    fireEvent.click(screen.getByTestId("dtf-tray-dot"));
    expect(onAdd).toHaveBeenLastCalledWith({ left: 10, right: 1 });
  });
});
