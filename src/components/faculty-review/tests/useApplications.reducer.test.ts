import { describe, it, expect } from "vitest";
import { reducer } from "../useApplications";
import type { Application } from "../types";

const base: any = {
  items: [{
    id: "A-1",
    name: "Test User",
    email: "t@e.com",
    program: "B.Sc. CS",
    submittedAt: new Date().toISOString(),
    status: "new",
    history: [],
  } as Application],
  selectedId: "A-1",
  filter: { status: "all", program: "all", q: "", sort: "recent" as const },
};

describe("reducer", () => {
  it("updateStatus adds history and changes status", () => {
    const next = reducer(base, { type: "updateStatus", id: "A-1", status: "accepted", by: "Reviewer" });
    expect(next.items[0].status).toBe("accepted");
    expect(next.items[0].history[0].action).toContain("accepted");
  });

  it("updateNotes replaces notes", () => {
    const next = reducer(base, { type: "updateNotes", id: "A-1", notes: "Looks good" });
    expect(next.items[0].notes).toBe("Looks good");
  });
});
