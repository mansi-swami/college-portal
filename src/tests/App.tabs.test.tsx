// src/__tests__/App.tabs.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import App from "../App";

// Mock children to keep test cheap
vi.mock("../components/ApplicationForm/MultiStepForm", () => ({ default: () => <div>FORM</div> }));
vi.mock("../components/VideoTutorial/VideoPlayer", () => ({ default: () => <div>VIDEO</div> }));
vi.mock("../components/faculty-review/FacultyReviewDashboard", () => ({ default: () => <div>FACULTY DASHBOARD</div> }));
vi.mock("../components/UI/DarkModeToggle", () => ({ default: () => <button>Toggle theme</button> }));
vi.mock("../components/ChatBot/ChatWindow", () => ({ default: () => <div /> })); // if referenced elsewhere
vi.mock("../a11y/Announcer", () => ({ default: () => <div /> }));
vi.mock("../components/UI/SkipLink", () => ({ default: () => <div /> }));

describe("App tabs", () => {
  it("shows Student by default and can switch to Faculty", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Student panel
    expect(screen.getByRole("tab", { name: /student/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("VIDEO")).toBeInTheDocument();
    expect(screen.getByText("FORM")).toBeInTheDocument();

    // Switch to Faculty
    await user.click(screen.getByRole("tab", { name: /faculty/i }));
    expect(screen.getByRole("tab", { name: /faculty/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("FACULTY DASHBOARD")).toBeInTheDocument();
  });
});
