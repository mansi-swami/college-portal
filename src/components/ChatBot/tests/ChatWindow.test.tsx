// src/components/ChatBot/__tests__/ChatWindow.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChatWindow from "../ChatWindow";
import { it, expect, vi } from "vitest";

// If ChatWindow uses setTimeout, use fake timers
vi.useFakeTimers();

it("sends a message and resolves typing", async () => {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<ChatWindow />);

  await user.type(screen.getByLabelText(/message/i), "hello");
  await user.keyboard("{Enter}");

  // shows typing
  expect(screen.getByText(/ai is typing/i)).toBeInTheDocument();

  // advance fake time to resolve AI response (e.g., 900ms in your code)
  vi.advanceTimersByTime(1000);

  // typing gone, echoed message shown
  expect(screen.queryByText(/ai is typing/i)).not.toBeInTheDocument();
  expect(screen.getByText(/you said/i)).toBeInTheDocument();
});
