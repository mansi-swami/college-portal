import { useEffect, useMemo, useRef, useState } from "react";
import Transcript, { secondsToTimestamp } from "./Transcript";
import Notes from "./Notes";
import type { TranscriptSegment } from "./types";
import { fetchVtt, parseVtt } from "./vtt";

// Fallback transcript if VTT fails
const FALLBACK: TranscriptSegment[] = [
  { id: "t1", start: 0,  end: 5,   text: "Welcome! This is a sample college portal tutorial video." },
  { id: "t2", start: 5,  end: 12,  text: "In this tutorial, you’ll learn how to submit your application." },
  { id: "t3", start: 12, end: 20,  text: "First, open the portal and go to the Application Form section." },
  { id: "t4", start: 20, end: 28,  text: "Fill out your personal details carefully and save the draft." },
  { id: "t5", start: 28, end: 36,  text: "Next, upload your transcript and certificates in PDF format." },
  { id: "t6", start: 36, end: 45,  text: "Finally, review all sections and click Submit to complete." },
  { id: "t7", start: 45, end: 55,  text: "That’s it! You can now track your application status easily." },
];

export default function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [segments, setSegments] = useState<TranscriptSegment[]>(FALLBACK);

  // Load transcript from VTT
  useEffect(() => {
    (async () => {
      try {
        const text = await fetchVtt("/transcripts/college-tutorial.vtt");
        const parsed = parseVtt(text);
        if (parsed.length) setSegments(parsed);
      } catch {
        // keep FALLBACK
      }
    })();
  }, []);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMeta = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 0);
  };

  const handleSeek = (time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    videoRef.current.play().catch(() => {});
  };

  const getCurrentTime = () => videoRef.current?.currentTime ?? 0;

  const progressPct = useMemo(
    () => (duration > 0 ? Math.min(100, Math.round((currentTime / duration) * 100)) : 0),
    [currentTime, duration]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Left: Video + Transcript */}
      <div className="lg:col-span-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4">
          <video
            ref={videoRef}
            controls
            className="w-full rounded-lg shadow-md"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMeta}
          >
            {/* Public sample video; replace with your own file path when ready */}
            <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
            {/* Optional: native caption track (needs a CORS-accessible VTT) */}
            <track
              kind="subtitles"
              label="English"
              src="/transcripts/college-tutorial.vtt"
              srcLang="en"
              default
            />
          </video>

          <div className="mt-2 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
            <span>{secondsToTimestamp(currentTime)}</span>
            <span>{progressPct}% watched</span>
            <span>{secondsToTimestamp(duration)}</span>
          </div>
        </div>

        <Transcript
          segments={segments}
          currentTime={currentTime}
          onSeek={handleSeek}
        />
      </div>

      {/* Right: Notes */}
      <div className="lg:col-span-1">
        <Notes getCurrentTime={getCurrentTime} onSeek={handleSeek} />
      </div>
    </div>
  );
}
