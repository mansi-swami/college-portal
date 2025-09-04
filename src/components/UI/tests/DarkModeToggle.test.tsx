// src/components/UI/__tests__/DarkModeToggle.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DarkModeToggle from "../DarkModeToggle";
import { it, expect } from "vitest";

it("toggles dark class on html", async () => {
  const user = userEvent.setup();
  render(<DarkModeToggle />);
  const html = document.documentElement;

  const btn = screen.getByRole("button");
  const initial = html.classList.contains("dark");
  await user.click(btn);
  expect(html.classList.contains("dark")).toBe(!initial);
});
