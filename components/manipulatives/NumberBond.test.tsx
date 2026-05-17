import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NumberBond } from "./NumberBond";

describe("NumberBond", () => {
  it("renders three circles", () => {
    render(
      <NumberBond whole={null} partA={null} partB={null} onSet={() => {}} />,
    );
    expect(screen.getByTestId("nb-whole")).toBeInTheDocument();
    expect(screen.getByTestId("nb-part-a")).toBeInTheDocument();
    expect(screen.getByTestId("nb-part-b")).toBeInTheDocument();
  });

  it("clicking a circle prompts entry via onSet", () => {
    const onSet = vi.fn();
    render(<NumberBond whole={null} partA={null} partB={null} onSet={onSet} />);
    fireEvent.click(screen.getByTestId("nb-whole"));
    expect(onSet).toHaveBeenCalledWith("whole");
  });
});
