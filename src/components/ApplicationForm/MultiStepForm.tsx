import { useEffect, useId, useRef, useState } from "react";
import DocumentUpload from "./DocumentUpload";
import ProfileCompleteness from "./ProfileCompleteness";
import ApplicationPreview from "./ApplicationPreview";
import type { Application } from "../faculty-review/types";

/* -------------------- Types -------------------- */
export type FormState = {
  name: string;
  email: string;
  phone: string;
  dob: string;
  program: string;
  address: string;
  pdf: File | null;
};

type TouchedState = Partial<Record<keyof FormState, boolean>>;

type DraftPayload = Omit<FormState, "pdf"> & {
  pdfName?: string | null;
  savedAt: number;
};

/* -------------------- Constants -------------------- */
const DRAFT_KEY = "application_form_draft_v1";

/* -------------------- Safe storage helpers -------------------- */
  const FACULTY_STORE_KEY = "faculty_review_apps_v1";
function canUseStorage() {
  try {
    const k = "__test__";
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}
function saveToStorage(key: string, value: unknown) {
  if (!canUseStorage()) throw new Error("Storage unavailable");
  localStorage.setItem(key, JSON.stringify(value));
}
function loadFromStorage<T>(key: string): T | null {
  if (!canUseStorage()) return null;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
function removeFromStorage(key: string) {
  if (!canUseStorage()) throw new Error("Storage unavailable");
  localStorage.removeItem(key);
}
function appendApplicationToFacultyStore(app: Application) {
  try {
    const raw = localStorage.getItem(FACULTY_STORE_KEY);
    const list: Application[] = raw ? JSON.parse(raw) : [];
    // prepend newest
    const updated = [app, ...list];
    localStorage.setItem(FACULTY_STORE_KEY, JSON.stringify(updated));
    // notify any listeners (e.g., FacultyReviewDashboard)
    window.dispatchEvent(new CustomEvent("app:submitted", { detail: app }));
  } catch {
    // ignore storage failures for now
  }
}

function makeNewApplicationFromForm(form: {
  name: string; email: string; program: string; phone: string; dob: string; address: string; pdf: File | null;
}): Application {
  return {
    id: `A-${Date.now()}`, // simple unique id
    name: form.name.trim(),
    email: form.email.trim(),
    program: form.program || "Unknown",
    submittedAt: new Date().toISOString(),
    status: "new",
    score: undefined,
    // You can’t persist the File in localStorage; if you want a preview right now:
    // docUrl: form.pdf ? URL.createObjectURL(form.pdf) : undefined,
    docUrl: undefined,
    notes: "",
    history: [{ at: new Date().toISOString(), action: "Submitted", by: "Student" }],
  };
}

/* ============================================================= */

export default function MultiStepForm() {
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    dob: "",
    program: "",
    address: "",
    pdf: null,
  });
  const [touched, setTouched] = useState<TouchedState>({});
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [errorSummary, setErrorSummary] = useState("");
  const [announce, setAnnounce] = useState(""); // aria-live status

  // Draft UI
  const [lastSaved, setLastSaved] = useState<number | null>(null);

  // Preview
  const [previewOpen, setPreviewOpen] = useState(false);

  // IDs & refs (for a11y & focus)
  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const dobId = useId();
  const programId = useId();
  const addressId = useId();

  const nameErrId = useId();
  const emailErrId = useId();
  const phoneErrId = useId();
  const dobErrId = useId();
  const programErrId = useId();
  const addressErrId = useId();
  const pdfErrId = useId();

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  /* -------------------- Validation -------------------- */
  const validateStep1 = (d = form) => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!d.name.trim()) e.name = "Please enter your full name.";
    if (!d.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) e.email = "Please enter a valid email address.";
    if (!d.phone.trim() || !/^[0-9]{10,15}$/.test(d.phone)) e.phone = "Enter a valid phone number (10–15 digits).";
    if (!d.dob) e.dob = "Please provide your date of birth.";
    else if (new Date(d.dob + "T00:00:00") > new Date()) e.dob = "Date of birth cannot be in the future.";
    if (!d.program) e.program = "Please select a program.";
    if (!d.address.trim() || d.address.trim().length < 10) e.address = "Address must be at least 10 characters.";
    return e;
  };

  const validateAll = (d = form) => {
    const e = validateStep1(d);
    if (!d.pdf) e.pdf = "Please upload a PDF.";
    else if (d.pdf.type !== "application/pdf") e.pdf = "Only PDF files are accepted.";
    return e;
  };

  // Revalidate whenever form/step changes; clear banner when fully valid
  useEffect(() => {
    const e = step === 1 ? validateStep1() : validateAll();
    setErrors(e);
    if (Object.keys(e).length === 0) setErrorSummary("");
  }, [form, step]);

  // touched helpers
  const markTouched = (field: keyof FormState) =>
    setTouched((t) => ({ ...t, [field]: true }));
  const showError = (field: keyof FormState) =>
    touched[field] && errors[field];

  // field updater
  const update = <K extends keyof FormState>(key: K) =>
    (val: FormState[K]) => setForm((prev) => ({ ...prev, [key]: val }));

  /* -------------------- Navigation -------------------- */
  const goNext = () => {
    const e = validateStep1();
    setErrors(e);
    setTouched({
      name: true, email: true, phone: true, dob: true, program: true, address: true,
    });
    if (Object.keys(e).length) {
      setErrorSummary("Please fix the errors below.");
      return;
    }
    setErrorSummary("");
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const eAll = validateAll();
    setErrors(eAll);
    setTouched({
      name: true, email: true, phone: true, dob: true,
      program: true, address: true, pdf: true,
    });
    if (Object.keys(eAll).length) {
      setErrorSummary("Please fix the errors below before submitting.");
      return;
    }
    setErrorSummary("");
    const newApp = makeNewApplicationFromForm(form);
    appendApplicationToFacultyStore(newApp);
    alert("Application submitted!");
    // optionally clear draft here if you use it:
    onClearDraft?.();
  };

  /* -------------------- Draft (Save / Restore / Clear) -------------------- */
  const serializeDraft = (d: FormState): DraftPayload => ({
    name: d.name,
    email: d.email,
    phone: d.phone,
    dob: d.dob,
    program: d.program,
    address: d.address,
    pdfName: d.pdf?.name ?? null, // reminder only
    savedAt: Date.now(),
  });

  const onSaveDraft = () => {
    try {
      const payload = serializeDraft(form);
      saveToStorage(DRAFT_KEY, payload);
      setLastSaved(payload.savedAt);
      setAnnounce("Draft saved");
    } catch {
      setAnnounce("Unable to save draft (storage blocked).");
    }
  };

  const onRestoreDraft = () => {
    const payload = loadFromStorage<DraftPayload>(DRAFT_KEY);
    if (!payload) {
      setAnnounce("No saved draft found.");
      return;
    }
    setForm((f) => ({
      ...f,
      name: payload.name ?? "",
      email: payload.email ?? "",
      phone: payload.phone ?? "",
      dob: payload.dob ?? "",
      program: payload.program ?? "",
      address: payload.address ?? "",
      pdf: null, // user must reattach
    }));
    setTouched({});
    setErrors({});
    setErrorSummary("");
    setLastSaved(payload.savedAt ?? null);
    setAnnounce("Draft restored. Please re-attach your PDF.");
  };

  const onClearDraft = () => {
    try {
      removeFromStorage(DRAFT_KEY);
      setLastSaved(null);
      setAnnounce("Draft cleared");
    } catch {
      setAnnounce("Unable to clear draft (storage blocked).");
    }
  };

  /* -------------------- Preview -------------------- */
  const openPreview = () => {
    // If you want to require valid Step 1 before preview, uncomment:
    // const e = validateStep1();
    // setErrors(e);
    // if (Object.keys(e).length) { setErrorSummary("Please fix errors before preview."); return; }
    setPreviewOpen(true);
  };
  const closePreview = () => setPreviewOpen(false);

  const handleConfirmSubmitFromPreview = () => {
    const eAll = validateAll();
    setErrors(eAll);
    if (Object.keys(eAll).length) {
      setErrorSummary("Please fix the errors below before submitting.");
      setPreviewOpen(false);
      return;
    }
    setErrorSummary("");
    alert("Application submitted!");
    setPreviewOpen(false);
    onClearDraft(); // optional
  };

  /* -------------------- Render -------------------- */
  return (
    <form onSubmit={handleSubmit} noValidate className="p-4 border rounded shadow bg-white dark:bg-gray-800">
      <h2 className="font-bold mb-2">Application Form</h2>

      {/* Live region for announcements (draft actions etc.) */}
      <div className="sr-only" aria-live="polite">{announce}</div>

      <ProfileCompleteness form={form} />

      {/* Optional global error banner */}
      {errorSummary && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {errorSummary}
        </div>
      )}

      {/* Progress */}
      <nav className="mb-3" aria-label="Form progress">
        <ol className="flex gap-2 text-sm">
          <li aria-current={step === 1 ? "step" : undefined}
              className={`px-2 py-1 rounded ${step === 1 ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700"}`}>
            1. Personal Info
          </li>
          <li aria-current={step === 2 ? "step" : undefined}
              className={`px-2 py-1 rounded ${step === 2 ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700"}`}>
            2. Documents
          </li>
        </ol>
      </nav>

      {/* Step 1 */}
      {step === 1 && (
        <fieldset className="space-y-3">
          <legend className="font-semibold mb-1">Step 1: Personal Info</legend>

          {/* Name */}
          <div>
            <label htmlFor={nameId} className="block text-sm mb-1">Full name</label>
            <input
              ref={nameRef}
              id={nameId}
              type="text"
              value={form.name}
              onChange={(e) => update("name")(e.target.value)}
              onBlur={() => markTouched("name")}
              aria-invalid={!!showError("name")}
              aria-describedby={showError("name") ? nameErrId : undefined}
              className="border p-2 w-full rounded"
            />
            {showError("name") && (
              <p id={nameErrId} className="text-sm text-red-600">
                {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor={emailId} className="block text-sm mb-1">Email</label>
            <input
              ref={emailRef}
              id={emailId}
              type="email"
              value={form.email}
              onChange={(e) => update("email")(e.target.value)}
              onBlur={() => markTouched("email")}
              aria-invalid={!!showError("email")}
              aria-describedby={showError("email") ? emailErrId : undefined}
              className="border p-2 w-full rounded"
            />
            {showError("email") && (
              <p id={emailErrId} className="text-sm text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor={phoneId} className="block text-sm mb-1">Phone</label>
            <input
              id={phoneId}
              type="tel"
              inputMode="numeric"
              value={form.phone}
              onChange={(e) => update("phone")(e.target.value)}
              onBlur={() => markTouched("phone")}
              aria-invalid={!!showError("phone")}
              aria-describedby={showError("phone") ? phoneErrId : undefined}
              className="border p-2 w-full rounded"
            />
            {showError("phone") && (
              <p id={phoneErrId} className="text-sm text-red-600">
                {errors.phone}
              </p>
            )}
          </div>

          {/* DOB */}
          <div>
            <label htmlFor={dobId} className="block text-sm mb-1">Date of birth</label>
            <input
              id={dobId}
              type="date"
              value={form.dob}
              onChange={(e) => update("dob")(e.target.value)}
              onBlur={() => markTouched("dob")}
              aria-invalid={!!showError("dob")}
              aria-describedby={showError("dob") ? dobErrId : undefined}
              className="border p-2 w-full rounded"
            />
            {showError("dob") && (
              <p id={dobErrId} className="text-sm text-red-600">
                {errors.dob}
              </p>
            )}
          </div>

          {/* Program */}
          <div>
            <label htmlFor={programId} className="block text-sm mb-1">Program</label>
            <select
              id={programId}
              value={form.program}
              onChange={(e) => update("program")(e.target.value)}
              onBlur={() => markTouched("program")}
              aria-invalid={!!showError("program")}
              aria-describedby={showError("program") ? programErrId : undefined}
              className="border p-2 w-full rounded bg-white dark:bg-gray-200 text-gray-900 dark:text-black"
            >
              <option value="">Select a program</option>
              <option value="bsc-cs">B.Sc. Computer Science</option>
              <option value="bcom">B.Com</option>
              <option value="ba">B.A.</option>
              <option value="mba">MBA</option>
            </select>
            {showError("program") && (
              <p id={programErrId} className="text-sm text-red-600">
                {errors.program}
              </p>
            )}
          </div>

          {/* Address */}
          <div>
            <label htmlFor={addressId} className="block text-sm mb-1">Address</label>
            <textarea
              id={addressId}
              rows={3}
              value={form.address}
              onChange={(e) => update("address")(e.target.value)}
              onBlur={() => markTouched("address")}
              aria-invalid={!!showError("address")}
              aria-describedby={showError("address") ? addressErrId : undefined}
              className="border p-2 w-full rounded"
            />
            {showError("address") && (
              <p id={addressErrId} className="text-sm text-red-600">
                {errors.address}
              </p>
            )}
          </div>
        </fieldset>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <fieldset aria-describedby={errors.pdf ? pdfErrId : undefined}>
          <legend className="font-semibold mb-1">Step 2: Upload PDF</legend>
          <DocumentUpload
            onUpload={(f) => {
              setForm({ ...form, pdf: f });
              if (f && f.type === "application/pdf") {
                setErrors((prev) => ({ ...prev, pdf: undefined }));
                setErrorSummary("");
              }
            }}
          />
          {showError("pdf") && (
            <p id={pdfErrId} className="text-sm text-red-600">
              {errors.pdf}
            </p>
          )}
        </fieldset>
      )}

      {/* Bottom actions */}
      <div className="mt-4 flex flex-wrap gap-2 justify-between">
        {step === 2 && (
          <button type="button" onClick={() => setStep(1)} className="px-4 py-2 bg-gray-300 rounded">
            Back
          </button>
        )}

        <div className="ml-auto flex flex-wrap gap-2">
          {/* Draft controls */}
          <button type="button" onClick={onSaveDraft} className="px-4 py-2 border rounded">
            Save draft
          </button>
          <button type="button" onClick={onRestoreDraft} className="px-4 py-2 border rounded">
            Restore
          </button>
          <button type="button" onClick={onClearDraft} className="px-4 py-2 border rounded">
            Clear draft
          </button>

          {/* Preview */}
          <button
            type="button"
            onClick={openPreview}
            className="px-4 py-2 border rounded"
            aria-haspopup="dialog"
            aria-controls="preview-title"
          >
            Preview
          </button>

          {/* Next / Submit */}
          {step === 1 ? (
            <button type="button" onClick={goNext} className="px-4 py-2 bg-blue-600 text-white rounded">
              Next
            </button>
          ) : (
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
              Submit
            </button>
          )}
        </div>
      </div>

      {/* Last-saved hint */}
      {lastSaved && (
        <p className="mt-2 text-xs opacity-75">Last saved: {new Date(lastSaved).toLocaleString()}</p>
      )}

      {/* Preview dialog mount */}
      {previewOpen && (
        <ApplicationPreview
          form={form}
          onClose={closePreview}
          onConfirm={handleConfirmSubmitFromPreview} // or remove if you don't want submit from preview
          onEdit={(section) => {
            setPreviewOpen(false);
            if (section === "personal") setStep(1);
            if (section === "documents") setStep(2);
          }}
        />
      )}
    </form>
  );
}
