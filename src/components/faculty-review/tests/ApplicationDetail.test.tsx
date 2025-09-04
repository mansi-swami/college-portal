// src/components/faculty-review/__tests__/ApplicationDetail.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ApplicationDetail from "../ApplicationDetail";
import type { Application } from "../types";
import { it, expect, vi } from "vitest";

const app: Application = {
  id: "A-1",
  name: "Tester",
  email: "t@x.com",
  program: "MBA",
  submittedAt: new Date().toISOString(),
  status: "new",
  history: [],
};

it("fires status and notes callbacks", async () => {
  const user = userEvent.setup();
  const onStatus = vi.fn();
  const onNotes = vi.fn();

  render(<ApplicationDetail app={app} onStatus={onStatus} onNotes={onNotes} />);

  await user.type(screen.getByLabelText(/reviewer notes/i), "Solid");
  expect(onNotes).toHaveBeenLastCalledWith("Solid");

  await user.click(screen.getByRole("button", { name: /accepted/i }));
  expect(onStatus).toHaveBeenCalledWith("accepted", "");
});
