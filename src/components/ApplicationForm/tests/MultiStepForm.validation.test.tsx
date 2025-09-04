// src/__tests__/MultiStepForm.validation.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MultiStepForm from "../MultiStepForm";
import { describe, it, expect, vi } from "vitest";

// Light mocks
vi.mock("../components/ApplicationForm/DocumentUpload", () => ({
  default: ({ onUpload }: { onUpload: (f: File|null)=>void }) => (
    <button onClick={() => onUpload(new File(["%PDF"], "x.pdf", { type: "application/pdf" }))}>Mock Upload PDF</button>
  ),
}));
vi.mock("../components/ApplicationForm/ProfileCompleteness", () => ({ default: () => <div /> }));
vi.mock("../components/ApplicationForm/ApplicationPreview", () => ({ default: () => <div>PREVIEW DIALOG</div> }));

describe("MultiStepForm", () => {
  it("shows errors only after blur / next", async () => {
    const user = userEvent.setup();
    render(<MultiStepForm />);

    const name = screen.getByLabelText(/full name/i);
    await user.type(name, "A"); // not blurred -> no error
    expect(screen.queryByText(/please enter your full name/i)).not.toBeInTheDocument();

    await user.clear(name);
    await user.tab(); // blur
    expect(screen.getByText(/please enter your full name/i)).toBeInTheDocument();

    // Try Next triggers all required errors
    await user.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
  });

  it("navigates to Step 2 when valid and allows PDF upload", async () => {
    const user = userEvent.setup();
    render(<MultiStepForm />);

    await user.type(screen.getByLabelText(/full name/i), "Ada Lovelace");
    await user.type(screen.getByLabelText(/^email$/i), "ada@example.com");
    await user.type(screen.getByLabelText(/phone/i), "1234567890");
    await user.type(screen.getByLabelText(/date of birth/i), "2000-01-01");
    await user.selectOptions(screen.getByLabelText(/program/i), "mba");
    await user.type(screen.getByLabelText(/address/i), "123 Baker Street");

    await user.click(screen.getByRole("button", { name: /next/i }));
    // Step 2 shows upload
    await user.click(screen.getByRole("button", { name: /mock upload pdf/i }));
    expect(screen.queryByText(/please upload a pdf/i)).not.toBeInTheDocument();
  });

  it("saves and restores draft", async () => {
    const user = userEvent.setup();
    render(<MultiStepForm />);

    await user.type(screen.getByLabelText(/full name/i), "Grace Hopper");
    await user.click(screen.getByRole("button", { name: /save draft/i }));
    expect(screen.getByText(/last saved:/i)).toBeInTheDocument();

    await user.clear(screen.getByLabelText(/full name/i));
    await user.click(screen.getByRole("button", { name: /restore/i }));
    expect(screen.getByLabelText(/full name/i)).toHaveValue("Grace Hopper");

    await user.click(screen.getByRole("button", { name: /clear draft/i }));
    // No throw => good. (storage cleared)
  });

  it("opens preview", async () => {
    const user = userEvent.setup();
    render(<MultiStepForm />);
    await user.click(screen.getByRole("button", { name: /preview/i }));
    expect(screen.getByText(/preview dialog/i)).toBeInTheDocument();
  });
});
