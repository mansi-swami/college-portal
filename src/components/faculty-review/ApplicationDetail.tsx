import { useMemo, useState } from "react";
import DecisionBadge from "./DecisionBadge";
import type { Application, ReviewStatus } from "./types";

type Props = {
  app: Application | null;
  onStatus: (status: ReviewStatus, comment?: string) => void;
  onNotes: (notes: string) => void;
};

export default function ApplicationDetail({ app, onStatus, onNotes }: Props) {
  const [comment, setComment] = useState("");
  const canAct = !!app;

  const timeline = useMemo(() => app?.history ?? [], [app]);

  if (!app) {
    return <div className="p-4 opacity-70">Select an application to review.</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
        <h3 className="text-lg font-semibold">{app.name}</h3>
        <span className="text-xs opacity-70">({app.id})</span>
        <span className="ml-auto"><DecisionBadge status={app.status} /></span>
      </div>

      <div className="grid gap-4 p-4 md:grid-cols-2">
        {/* Left: metadata & notes */}
        <div className="space-y-3">
          <div className="rounded border p-3 border-gray-200 dark:border-gray-700">
            <h4 className="font-medium mb-2">Applicant</h4>
            <dl className="text-sm grid grid-cols-3 gap-y-1">
              <dt className="opacity-70">Email</dt><dd className="col-span-2">{app.email}</dd>
              <dt className="opacity-70">Program</dt><dd className="col-span-2">{app.program}</dd>
              <dt className="opacity-70">Submitted</dt><dd className="col-span-2">{new Date(app.submittedAt).toLocaleString()}</dd>
              {typeof app.score === "number" && (<><dt className="opacity-70">Score</dt><dd className="col-span-2">{app.score}</dd></>)}
            </dl>
          </div>

          <div className="rounded border p-3 border-gray-200 dark:border-gray-700">
            <h4 className="font-medium mb-2">Reviewer notes</h4>
            <textarea
              value={app.notes ?? ""}
              onChange={(e) => onNotes(e.target.value)}
              rows={6}
              className="w-full border rounded p-2 bg-white dark:bg-gray-800"
              aria-label="Reviewer notes"
            />
          </div>

          <div className="rounded border p-3 border-gray-200 dark:border-gray-700">
            <h4 className="font-medium mb-2">Actions</h4>
            <div className="flex flex-wrap gap-2">
              {(["accepted","waitlisted","rejected","changes-requested","in-review"] as ReviewStatus[]).map(s => (
                <button
                  key={s}
                  disabled={!canAct}
                  onClick={() => onStatus(s, comment)}
                  className="px-3 py-1 rounded border hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="mt-2">
              <label className="text-sm block mb-1">Comment (optional)</label>
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border rounded p-2 bg-white dark:bg-gray-800"
                placeholder="Short note about your decision…"
              />
            </div>
          </div>
        </div>

        {/* Right: document preview + timeline */}
        <div className="space-y-3">
          <div className="rounded border p-3 border-gray-200 dark:border-gray-700">
            <h4 className="font-medium mb-2">Document preview</h4>
            {app.docUrl ? (
              <iframe
                title="Document preview"
                src={app.docUrl}
                className="w-full h-72 rounded border"
              />
            ) : (
              <div className="h-72 grid place-items-center bg-gray-50 dark:bg-gray-800 rounded border">
                <p className="text-sm opacity-70">No PDF attached (placeholder)</p>
              </div>
            )}
          </div>

          <div className="rounded border p-3 border-gray-200 dark:border-gray-700">
            <h4 className="font-medium mb-2">Timeline</h4>
            <ul className="text-sm space-y-2">
              {timeline.map((t, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 h-2 w-2 rounded-full bg-blue-500" />
                  <div>
                    <div className="font-medium">{t.action}</div>
                    <div className="opacity-70">{new Date(t.at).toLocaleString()} • {t.by}</div>
                    {t.comment && <div className="opacity-90">“{t.comment}”</div>}
                  </div>
                </li>
              ))}
              {timeline.length === 0 && <li className="opacity-70">No events yet.</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
