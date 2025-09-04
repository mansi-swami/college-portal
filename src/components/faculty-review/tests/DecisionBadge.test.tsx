// src/components/faculty-review/__tests__/DecisionBadge.test.tsx
import { render, screen } from "@testing-library/react";
import DecisionBadge from "../DecisionBadge";
import { it, expect } from "vitest";

it("renders status text", () => {
  render(<DecisionBadge status="accepted" />);
  expect(screen.getByText(/accepted/i)).toBeInTheDocument();
});
