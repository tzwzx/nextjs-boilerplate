import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

describe("Home page", () => {
  test("renders the hero heading", () => {
    const expectedTitle = "Next.js Boilerplate";
    const headingLevel = 1;

    render(<Home />);

    expect(
      screen.getByRole("heading", { level: headingLevel, name: expectedTitle })
    ).toBeDefined();
  });
});
