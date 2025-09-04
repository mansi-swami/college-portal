import { useEffect, useRef } from "react";

export type FormState = {
  name: string;
  email: string;
  phone: string;
  dob: string;
  program: string;
  address: string;
  pdf: File | null;
};

type Props = {
  form: FormState;
  onClose: () => void;
  onEdit: (section: "personal" | "documents") => void;
  onConfirm?: () => void; // optional: submit from preview
};

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-2 border-b border-gray-200 dark:border-gray-700">
      <div className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</div>
      <div className="col-span-2 text-sm text-gray-900 dark:text-gray-100 break-words whitespace-pre-wrap">
        {value && value.trim() ? value : <span className="opacity-60">—</span>}
      </div>
    </div>
  );
}

export default function ApplicationPreview({ form, onClose, onEdit, onConfirm }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLButtonElement>(null);

  // Focus management and ESC to close
  useEffect(() => {
    firstFocusRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Simple focus trap
  useEffect(() => {
    const trap = (e: FocusEvent) => {
      const root = dialogRef.current;
      if (!root) return;
      const focusables = root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.target === document.body) first.focus();
      const onKeydown = (ev: KeyboardEvent) => {
        if (ev.key !== "Tab") return;
        if (ev.shiftKey && document.activeElement === first) {
          ev.preventDefault();
          last.focus();
        } else if (!ev.shiftKey && document.activeElement === last) {
          ev.preventDefault();
          first.focus();
        }
      };
      root.addEventListener("keydown", onKeydown);
      return () => root.removeEventListener("keydown", onKeydown);
    };
    window.addEventListener("focus", trap, true);
    return () => window.removeEventListener("focus", trap, true);
  }, []);

  const downloadJSON = () => {
    const payload = {
      ...form,
      pdf: form.pdf ? { name: form.pdf.name, type: form.pdf.type, size: form.pdf.size } : null,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "application-preview.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const printPage = () => window.print();

  const pdfName = form.pdf?.name ?? null;
  const pdfOk = !!form.pdf && form.pdf.type === "application/pdf";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-title"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-3xl rounded-xl bg-white dark:bg-gray-900 shadow-xl outline outline-1 outline-gray-200 dark:outline-gray-700"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 id="preview-title" className="text-lg font-semibold">Application Preview</h3>
          <button
            ref={firstFocusRef}
            onClick={onClose}
            className="px-3 py-1 rounded border hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close preview"
          >
            Close
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto px-4 py-3">
          <div className="mb-3 flex items-center gap-2">
            <button
              onClick={() => onEdit("personal")}
              className="px-3 py-1 text-sm rounded border hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Edit personal info
            </button>
            <button
              onClick={() => onEdit("documents")}
              className="px-3 py-1 text-sm rounded border hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Edit documents
            </button>
            <div className="ml-auto flex gap-2">
              <button onClick={downloadJSON} className="px-3 py-1 text-sm rounded border hover:bg-gray-100 dark:hover:bg-gray-800">
                Download JSON
              </button>
              <button onClick={printPage} className="px-3 py-1 text-sm rounded border hover:bg-gray-100 dark:hover:bg-gray-800">
                Print
              </button>
            </div>
          </div>

          <section aria-labelledby="sec-personal" className="mb-4">
            <h4 id="sec-personal" className="text-base font-semibold mb-2">Personal Information</h4>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
              <Row label="Full name" value={form.name} />
              <Row label="Email" value={form.email} />
              <Row label="Phone" value={form.phone} />
              <Row label="Date of birth" value={form.dob} />
              <Row label="Program" value={form.program} />
              <Row label="Address" value={form.address} />
            </div>
          </section>

          <section aria-labelledby="sec-docs" className="mb-2">
            <h4 id="sec-docs" className="text-base font-semibold mb-2">Documents</h4>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
              <Row label="Transcript (PDF)" value={pdfName ?? "Not attached"} />
              {!pdfOk && (
                <p className="mt-2 text-xs text-amber-700 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded px-2 py-1">
                  Reminder: attach a valid PDF before submitting.
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onClose} className="px-4 py-2 rounded border hover:bg-gray-100 dark:hover:bg-gray-800">
            Back
          </button>
          {onConfirm && (
            <button onClick={onConfirm} className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700">
              Confirm & Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
