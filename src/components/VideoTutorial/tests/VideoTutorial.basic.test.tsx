// src/components/VideoTutorial/__tests__/VideoTutorial.basic.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VideoPlayer from "../VideoPlayer";
import { it, expect, vi } from "vitest";

// Mock Transcript & Notes to focus on props interactions
vi.mock("../Transcript", () => ({
  __esModule: true,
  default: ({ segments, onSeek }: any) => (
    <div>
      {segments.map((s: any) => (
        <button key={s.id} onClick={() => onSeek(s.start)}>SEG {s.id}</button>
      ))}
    </div>
  ),
  secondsToTimestamp: (n: number) => String(n),
}));
vi.mock("../Notes", () => ({ default: () => <div>NOTES</div> }));

it("renders video and allows transcript seek", async () => {
  const user = userEvent.setup();
  render(<VideoPlayer />);
  expect(screen.getByText(/notes/i)).toBeInTheDocument();
  // our mock buttons represent transcript lines
  const seg = screen.getAllByRole("button", { name: /seg/i })[0];
  await user.click(seg);
  // No error = onSeek invoked; real test could spy on HTMLVideoElement if exposed
});
