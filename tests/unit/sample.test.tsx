import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";

describe("Home page", () => {
  it("renders the hero heading", () => {
    const expectedTitle = "Hello World";
    const headingLevel = 1;

    render(<Home />);

    expect(
      screen.getByRole("heading", { level: headingLevel, name: expectedTitle })
    ).toBeDefined();
  });
});
