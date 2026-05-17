import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EqualGroups } from "./EqualGroups";

describe("EqualGroups", () => {
  it("renders N plates with M cookies each", () => {
    render(
      <EqualGroups
        plates={3}
        perPlate={4}
        countedPlates={0}
        onCount={() => {}}
      />,
    );
    expect(screen.getAllByTestId("eg-plate").length).toBe(3);
    expect(screen.getAllByTestId("eg-cookie").length).toBe(12);
  });

  it("tapping a plate calls onCount", () => {
    const onCount = vi.fn();
    render(
      <EqualGroups
        plates={3}
        perPlate={4}
        countedPlates={0}
        onCount={onCount}
      />,
    );
    fireEvent.click(screen.getAllByTestId("eg-plate")[0]);
    expect(onCount).toHaveBeenCalledWith(1);
  });
});
