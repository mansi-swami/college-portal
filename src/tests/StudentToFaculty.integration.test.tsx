// src/__tests__/StudentToFaculty.integration.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import { describe, it, expect, vi, beforeEach } from "vitest";
// Mock heavy children in dashboard list item rendering
vi.mock("../components/VideoTutorial/VideoPlayer", () => ({ default: () => <div /> }));
vi.mock("../components/faculty-review/FacultyReviewDashboard", async () => {
  const actual = await vi.importActual<any>("../components/faculty-review/FacultyReviewDashboard");
  return actual; // real dashboard
});
vi.mock("../components/UI/DarkModeToggle", () => ({ default: () => <button>toggle</button> }));
vi.mock("../a11y/Announcer", () => ({ default: () => <div /> }));
vi.mock("../components/UI/SkipLink", () => ({ default: () => <div /> }));

beforeEach(() => {
  localStorage.clear();
});

describe("Student submit -> Faculty sees it", () => {
  it("creates a new application and shows it in Faculty tab", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Fill and submit minimal valid form
    await user.type(screen.getByLabelText(/full name/i), "Linus Torvalds");
    await user.type(screen.getByLabelText(/^email$/i), "linus@example.com");
    await user.type(screen.getByLabelText(/phone/i), "1234567890");
    await user.type(screen.getByLabelText(/date of birth/i), "1990-01-01");
    await user.selectOptions(screen.getByLabelText(/program/i), "mba");
    await user.type(screen.getByLabelText(/address/i), "Somewhere 12345");

    await user.click(screen.getByRole("button", { name: /next/i }));
    // Attach PDF
    // (Your DocumentUpload mock might be different; adapt if necessary)
    const uploadBtn = screen.getByRole("button", { name: /mock upload pdf/i });
    await user.click(uploadBtn);

    // Submit
    await user.click(screen.getByRole("button", { name: /submit/i }));

    // Go to Faculty
    await user.click(screen.getByRole("tab", { name: /faculty/i }));

    // Expect the list to contain the submitted name
    expect(await screen.findByText(/linus torvalds/i)).toBeInTheDocument();
  });
});
