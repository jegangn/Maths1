import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ArrayGrid } from "./ArrayGrid";

describe("ArrayGrid", () => {
  it("renders rows * cols dots", () => {
    render(<ArrayGrid rows={3} cols={4} rotated={false} onRotate={() => {}} />);
    expect(screen.getAllByTestId("ag-dot").length).toBe(12);
  });

  it("clicking rotate fires onRotate", () => {
    const onRotate = vi.fn();
    render(<ArrayGrid rows={3} cols={4} rotated={false} onRotate={onRotate} />);
    fireEvent.click(screen.getByTestId("ag-rotate"));
    expect(onRotate).toHaveBeenCalled();
  });
});
