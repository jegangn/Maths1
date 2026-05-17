import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AnswerTiles } from "./AnswerTiles";

describe("AnswerTiles", () => {
  it("renders one tile per option in shuffled order", () => {
    render(
      <AnswerTiles options={[5, 7, 6]} onPick={() => {}} disabled={false} />,
    );
    expect(screen.getAllByTestId("at-tile").length).toBe(3);
  });

  it("clicking a tile calls onPick with its value", () => {
    const onPick = vi.fn();
    render(
      <AnswerTiles options={[5, 7, 6]} onPick={onPick} disabled={false} />,
    );
    fireEvent.click(screen.getAllByTestId("at-tile")[0]);
    expect(onPick).toHaveBeenCalled();
  });

  it("does not call onPick when disabled", () => {
    const onPick = vi.fn();
    render(<AnswerTiles options={[5, 7, 6]} onPick={onPick} disabled />);
    fireEvent.click(screen.getAllByTestId("at-tile")[0]);
    expect(onPick).not.toHaveBeenCalled();
  });
});
