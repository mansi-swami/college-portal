import { useEffect, useState } from "react";

/** Use: Announcer.say("Uploading complete") */
let setMessageGlobal: ((m: string) => void) | null = null;

export function say(message: string) {
  setMessageGlobal?.(message);
}

export default function Announcer() {
  const [msg, setMsg] = useState("");
  useEffect(() => { setMessageGlobal = setMsg; return () => { setMessageGlobal = null; }; }, []);
  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">{msg}</div>
  );
}
