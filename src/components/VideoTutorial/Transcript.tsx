import { useEffect, useMemo, useRef, useState } from "react";
import type { TranscriptSegment } from "./types";

export function secondsToTimestamp(sec: number) {
  if (!isFinite(sec)) return "00:00";
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  const m = Math.floor((sec / 60) % 60).toString().padStart(2, "0");
  const h = Math.floor(sec / 3600);
  return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
}

type TranscriptProps = {
  segments: TranscriptSegment[];
  currentTime: number;
  onSeek: (time: number) => void;
};

export default function Transcript({ segments, currentTime, onSeek }: TranscriptProps) {
  const [query, setQuery] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  // Determine which segment is "active" based on current time
  const activeId = useMemo(() => {
    const seg = segments.find(s => currentTime >= s.start && currentTime < s.end);
    return seg?.id ?? null;
  }, [segments, currentTime]);

  // Filter by search query
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return segments;
    return segments.filter(s => s.text.toLowerCase().includes(q));
  }, [segments, query]);

  // Auto-scroll the active item into view
  useEffect(() => {
    if (!activeId || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLDivElement>(`[data-segid="${activeId}"]`);
    if (el) {
      const { top, bottom } = el.getBoundingClientRect();
      const parent = listRef.current.getBoundingClientRect();
      const isVisible = top >= parent.top && bottom <= parent.bottom;
      if (!isVisible) {
        el.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [activeId]);

  return (
    <div className="border-t border-gray-200 dark:border-gray-700">
      {/* Header & search */}
      <div className="px-4 pt-3 pb-2 flex items-center gap-2">
        <h3 className="text-base font-semibold">Transcript</h3>
        <div className="ml-auto flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search transcript…"
            className="border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-gray-100"
            aria-label="Search transcript"
          />
          <span className="text-xs opacity-70">{filtered.length} results</span>
        </div>
      </div>

      {/* Transcript list */}
      <div
        ref={listRef}
        className="max-h-72 overflow-y-auto px-2 pb-3"
        role="list"
        aria-label="Video transcript"
      >
        {filtered.map(seg => {
          const isActive = seg.id === activeId;
          return (
            <div
              key={seg.id}
              data-segid={seg.id}
              role="listitem"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSeek(seg.start);
                }
              }}
              onClick={() => onSeek(seg.start)}
              className={[
                "group flex items-start gap-3 rounded-lg p-2 cursor-pointer select-none",
                isActive
                  ? "bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800",
              ].join(" ")}
            >
              <div className="shrink-0 mt-0.5">
                <span
                  className={[
                    "inline-block text-xs px-2 py-1 rounded border",
                    isActive
                      ? "bg-blue-100 dark:bg-blue-900/50 border-blue-300 text-blue-700 dark:text-blue-200"
                      : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200",
                  ].join(" ")}
                >
                  {secondsToTimestamp(seg.start)}
                </span>
              </div>
              <p
                className={[
                  "text-sm leading-5",
                  isActive ? "font-medium text-gray-900 dark:text-gray-50" : "text-gray-700 dark:text-gray-200",
                ].join(" ")}
              >
                {seg.text}
              </p>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">
            No transcript segments match your search.
          </div>
        )}
      </div>
    </div>
  );
}
