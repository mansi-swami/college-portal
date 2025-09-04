import { useEffect, useMemo, useRef, useState } from "react";

type Note = {
  id: string;
  time: number;        // seconds in video
  text: string;
  createdAt: number;
  updatedAt: number;
};

type NotesProps = {
  /** Return current video time (in seconds) */
  getCurrentTime: () => number;
  /** Seek video to a specific time */
  onSeek: (time: number) => void;
  /** Optional storage key if you want multiple videos */
  storageKey?: string;
};

const DEFAULT_STORAGE_KEY = "video_notes_v1";

function secondsToTimestamp(sec: number) {
  if (!isFinite(sec)) return "00:00";
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  const m = Math.floor((sec / 60) % 60).toString().padStart(2, "0");
  const h = Math.floor(sec / 3600);
  return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
}

export default function Notes({
  getCurrentTime,
  onSeek,
  storageKey = DEFAULT_STORAGE_KEY,
}: NotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setNotes(JSON.parse(raw));
    } catch {/* ignore */}
  }, [storageKey]);

  // Save
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(notes));
    } catch {/* ignore */}
  }, [notes, storageKey]);

  const addNote = () => {
    const text = draft.trim();
    if (!text) return;
    const time = getCurrentTime();
    const now = Date.now();
    const newNote: Note = {
      id: crypto.randomUUID(),
      time,
      text,
      createdAt: now,
      updatedAt: now,
    };
    setNotes((prev) => [newNote, ...prev]);
    setDraft("");
  };

  const updateNote = (id: string, text: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, text, updatedAt: Date.now() } : n))
    );
  };

  const removeNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (n) =>
        n.text.toLowerCase().includes(q) ||
        secondsToTimestamp(n.time).includes(q)
    );
  }, [notes, query]);

  const insertTimestampInDraft = () => {
    const stamp = secondsToTimestamp(getCurrentTime());
    setDraft((d) => (d ? `${d} [${stamp}]` : `[${stamp}] `));
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(notes, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "video-notes.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = async (file?: File) => {
    try {
      const f = file ?? fileInputRef.current?.files?.[0];
      if (!f) return;
      const text = await f.text();
      const parsed = JSON.parse(text) as Note[];
      // naive validation
      if (!Array.isArray(parsed)) return;
      setNotes(parsed);
    } catch {/* ignore */}
  };

  // Keyboard shortcut: Ctrl/Cmd+Enter to add note
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const cmdEnter = (e.ctrlKey || e.metaKey) && e.key === "Enter";
      if (cmdEnter) {
        e.preventDefault();
        addNote();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [draft]);

  return (
    <aside className="h-full flex flex-col border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-r-lg">
      {/* Header */}
      <div className="p-3 flex items-center gap-2">
        <h3 className="text-base font-semibold">Notes</h3>
        <div className="ml-auto flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes…"
            className="border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-gray-100"
            aria-label="Search notes"
          />
          <button
            onClick={exportJSON}
            className="px-2 py-1 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Export JSON"
          >
            Export
          </button>
          <label className="px-2 py-1 text-sm border rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
            Import
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => importJSON(e.target.files?.[0])}
            />
          </label>
        </div>
      </div>

      {/* Composer */}
      <div className="px-3 pb-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          placeholder="Write a note…"
          className="w-full resize-none border rounded px-3 py-2 bg-white dark:bg-gray-200 text-gray-900 dark:text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Note text"
        />
        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={insertTimestampInDraft}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Insert current time as timestamp"
          >
            Insert timestamp
          </button>
          <button
            onClick={addNote}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            title="Add note (Ctrl/Cmd+Enter)"
          >
            Add (⌘/Ctrl+Enter)
          </button>
        </div>
      </div>

      {/* Notes list */}
      <div
        className="flex-1 overflow-y-auto px-2 pb-3 space-y-2"
        role="list"
        aria-label="Notes list"
      >
        {filtered.length === 0 && (
          <div className="px-2 py-4 text-sm text-gray-500 dark:text-gray-400">
            No notes yet. Add one with the current video timestamp.
          </div>
        )}

        {filtered.map((n) => {
          const isEditing = editingId === n.id;
          return (
            <div
              key={n.id}
              role="listitem"
              className="group rounded border border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-800"
            >
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                <button
                  onClick={() => onSeek(n.time)}
                  className="px-2 py-0.5 rounded border hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Seek to time"
                >
                  {secondsToTimestamp(n.time)}
                </button>
                <span className="ml-auto opacity-70">
                  {new Date(n.updatedAt).toLocaleString()}
                </span>
              </div>

              {!isEditing ? (
                <p className="mt-1 text-sm whitespace-pre-wrap break-words text-gray-900 dark:text-gray-100">
                  {n.text}
                </p>
              ) : (
                <textarea
                  defaultValue={n.text}
                  autoFocus
                  rows={3}
                  onBlur={(e) => {
                    updateNote(n.id, e.target.value.trim());
                    setEditingId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setEditingId(null);
                    }
                    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                      e.currentTarget.blur();
                    }
                  }}
                  className="mt-1 w-full resize-none border rounded px-2 py-1 bg-white dark:bg-gray-200 text-gray-900 dark:text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              )}

              <div className="mt-2 flex items-center gap-2 opacity-90">
                <button
                  onClick={() => setEditingId(isEditing ? null : n.id)}
                  className="px-2 py-1 text-xs border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {isEditing ? "Save" : "Edit"}
                </button>
                <button
                  onClick={() => removeNote(n.id)}
                  className="px-2 py-1 text-xs border rounded hover:bg-red-50 dark:hover:bg-red-900/30"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    const stamp = secondsToTimestamp(getCurrentTime());
                    updateNote(n.id, `${n.text}\n[+ ${stamp}]`);
                  }}
                  className="ml-auto px-2 py-1 text-xs border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Append current timestamp"
                >
                  + timestamp
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
