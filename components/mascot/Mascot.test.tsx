import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Mascot } from "./Mascot";

describe("Mascot", () => {
  it("shows the requested emotion sprite", () => {
    render(<Mascot emotion="happy" />);
    expect(screen.getByTestId("mascot-img")).toHaveAttribute(
      "src",
      expect.stringContaining("happy.svg"),
    );
  });

  it("idle is the default", () => {
    render(<Mascot />);
    expect(screen.getByTestId("mascot-img")).toHaveAttribute(
      "src",
      expect.stringContaining("idle.svg"),
    );
  });
});
