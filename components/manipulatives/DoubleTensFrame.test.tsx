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

  it("does not render tray dot when interactive=false", () => {
    render(
      <DoubleTensFrame
        leftFilled={3}
        rightFilled={0}
        onAdd={() => {}}
        interactive={false}
      />,
    );
    expect(screen.queryByTestId("dtf-tray-dot")).toBeNull();
  });

  it("right frame dots use orange class when rightColour='orange'", () => {
    render(
      <DoubleTensFrame
        leftFilled={10}
        rightFilled={2}
        onAdd={() => {}}
        interactive={false}
        rightColour="orange"
      />,
    );
    // The right-frame filled cells use data-testid dtf-cell-R-filled
    const rightFilledCells = screen.getAllByTestId("dtf-cell-R-filled");
    expect(rightFilledCells.length).toBe(2);
    // Each filled cell contains a dot div; find them by querying inside the cell
    rightFilledCells.forEach((cell) => {
      const dot = cell.querySelector("div");
      expect(dot).not.toBeNull();
      expect(dot!.className).toContain("bg-orange");
      expect(dot!.className).not.toContain("bg-blue");
    });
  });

  it("right frame dots use blue class when rightColour='blue' (default)", () => {
    render(
      <DoubleTensFrame
        leftFilled={9}
        rightFilled={4}
        onAdd={() => {}}
        interactive={false}
        rightColour="blue"
      />,
    );
    const rightFilledCells = screen.getAllByTestId("dtf-cell-R-filled");
    expect(rightFilledCells.length).toBe(4);
    rightFilledCells.forEach((cell) => {
      const dot = cell.querySelector("div");
      expect(dot).not.toBeNull();
      expect(dot!.className).toContain("bg-blue");
      expect(dot!.className).not.toContain("bg-orange");
    });
  });
});
