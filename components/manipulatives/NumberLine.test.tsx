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

  it("showHops renders one arc per hop", () => {
    render(
      <NumberLine
        max={10}
        frogAt={4}
        onHop={() => {}}
        startAt={7}
        hopCount={3}
        hopSize={1}
        direction="backward"
        showHops={true}
      />,
    );
    expect(screen.getAllByTestId("nl-hop-arc").length).toBe(3);
  });

  it("showHops=false renders no arcs", () => {
    render(<NumberLine max={10} frogAt={7} onHop={() => {}} />);
    expect(screen.queryAllByTestId("nl-hop-arc").length).toBe(0);
  });

  it("does not render hop buttons when interactive=false", () => {
    render(
      <NumberLine max={10} frogAt={5} onHop={() => {}} interactive={false} />,
    );
    expect(screen.queryByTestId("nl-hop-left")).toBeNull();
    expect(screen.queryByTestId("nl-hop-right")).toBeNull();
  });
});
