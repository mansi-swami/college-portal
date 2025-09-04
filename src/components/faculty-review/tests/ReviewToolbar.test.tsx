// src/components/faculty-review/__tests__/ReviewToolbar.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReviewToolbar from "../ReviewToolbar";
import { it, expect, vi } from "vitest";

it("calls onChange for filters", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(
    <ReviewToolbar
      status="all"
      program="all"
      q=""
      sort="recent"
      onChange={onChange}
      programs={["MBA","B.A."]}
    />
  );

  await user.type(screen.getByRole("textbox", { name: /search/i }), "anna");
  expect(onChange).toHaveBeenCalledWith({ q: "anna" });

  await user.selectOptions(screen.getByDisplayValue("all"), "new");
  expect(onChange).toHaveBeenCalledWith({ status: "new" });

  await user.selectOptions(screen.getAllByRole("combobox")[1], "MBA");
  expect(onChange).toHaveBeenCalledWith({ program: "MBA" });
});
