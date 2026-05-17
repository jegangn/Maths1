import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PlaceValueBlocks } from "./PlaceValueBlocks";

describe("PlaceValueBlocks", () => {
  it("renders the requested tens and ones", () => {
    render(<PlaceValueBlocks tens={2} ones={4} onChange={() => {}} />);
    expect(screen.getAllByTestId("pv-rod").length).toBe(2);
    expect(screen.getAllByTestId("pv-cube").length).toBe(4);
  });

  it("clicking add-rod increments tens", () => {
    const onChange = vi.fn();
    render(<PlaceValueBlocks tens={1} ones={3} onChange={onChange} />);
    fireEvent.click(screen.getByTestId("pv-add-rod"));
    expect(onChange).toHaveBeenCalledWith({ tens: 2, ones: 3 });
  });

  it("clicking add-cube increments ones", () => {
    const onChange = vi.fn();
    render(<PlaceValueBlocks tens={1} ones={3} onChange={onChange} />);
    fireEvent.click(screen.getByTestId("pv-add-cube"));
    expect(onChange).toHaveBeenCalledWith({ tens: 1, ones: 4 });
  });
});
