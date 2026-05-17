import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NumberLine } from "./NumberLine";

describe("NumberLine", () => {
  it("renders ticks 0..max", () => {
    render(<NumberLine max={10} frogAt={0} onHop={() => {}} />);
    expect(screen.getAllByTestId("nl-tick").length).toBe(11);
  });

  it("clicking hop-right calls onHop with +1", () => {
    const onHop = vi.fn();
    render(<NumberLine max={10} frogAt={3} onHop={onHop} />);
    fireEvent.click(screen.getByTestId("nl-hop-right"));
    expect(onHop).toHaveBeenCalledWith(4);
  });

  it("clicking hop-left calls onHop with -1", () => {
    const onHop = vi.fn();
    render(<NumberLine max={10} frogAt={3} onHop={onHop} />);
    fireEvent.click(screen.getByTestId("nl-hop-left"));
    expect(onHop).toHaveBeenCalledWith(2);
  });
});
