import type { TranscriptSegment } from "./types";

function tsToSeconds(ts: string): number {
  // Accept "HH:MM:SS.mmm" or "MM:SS.mmm"
  const parts = ts.split(":").map(Number);
  let h = 0, m = 0, s = 0;
  if (parts.length === 3) [h, m, s] = parts;
  else if (parts.length === 2) [m, s] = parts;
  return h * 3600 + m * 60 + s;
}

export async function fetchVtt(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch VTT: ${res.status}`);
  return res.text();
}

export function parseVtt(text: string): TranscriptSegment[] {
  // Very small & tolerant VTT parser
  const lines = text.replace(/\r/g, "").split("\n");
  const out: TranscriptSegment[] = [];
  let i = 0;

  const timeRe = /(\d{2}:\d{2}:\d{2}\.\d{3}|\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3}|\d{2}:\d{2}\.\d{3})/;

  while (i < lines.length) {
    const line = lines[i].trim();

    // skip WEBVTT header and blank lines
    if (!line || line.toUpperCase() === "WEBVTT") {
      i++;
      continue;
    }

    // optional cue id line
    let cueId: string | undefined;
    if (line && !timeRe.test(line)) {
      cueId = line;
      i++;
    }

    // expect timing line
    const timeLine = lines[i]?.trim() ?? "";
    const m = timeLine.match(timeRe);
    if (!m) {
      i++;
      continue;
    }
    const start = tsToSeconds(m[1]);
    const end = tsToSeconds(m[2]);
    i++;

    // gather text lines until blank
    const buf: string[] = [];
    while (i < lines.length && lines[i].trim() !== "") {
      buf.push(lines[i]);
      i++;
    }

    // skip trailing blank
    while (i < lines.length && lines[i].trim() === "") i++;

    const textContent = buf.join("\n").trim();
    if (textContent) {
      out.push({
        id: cueId || crypto.randomUUID(),
        start,
        end,
        text: textContent,
      });
    }
  }

  return out;
}
