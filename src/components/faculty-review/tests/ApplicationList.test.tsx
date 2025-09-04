import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ApplicationList from "../ApplicationList";
import type { Application } from "../types";
import { it, expect, vi } from "vitest";

const items: Application[] = [
  { id: "A-1", name: "A", email: "a@x.com", program: "MBA", submittedAt: new Date().toISOString(), status: "new", history: [] },
  { id: "A-2", name: "B", email: "b@x.com", program: "B.A.", submittedAt: new Date().toISOString(), status: "in-review", history: [] },
];

it("renders and selects", async () => {
  const user = userEvent.setup();
  const onSelect = vi.fn();
  render(<ApplicationList items={items} selectedId={null} onSelect={onSelect} />);
  await user.click(screen.getByText("A"));
  expect(onSelect).toHaveBeenCalledWith("A-1");
});
