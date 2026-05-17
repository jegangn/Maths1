import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressBar } from "./ProgressBar";

describe("ProgressBar", () => {
  it("renders total dots and fills the first n", () => {
    render(<ProgressBar total={5} filled={2} />);
    expect(screen.getAllByTestId("pb-dot").length).toBe(5);
    expect(screen.getAllByTestId("pb-dot-filled").length).toBe(2);
  });
});
