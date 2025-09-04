import type { Application } from "./types";

export const MOCK_APPLICATIONS: Application[] = [
  {
    id: "A-1001",
    name: "Ananya Rao",
    email: "ananya.rao@example.com",
    program: "B.Sc. Computer Science",
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    score: 86,
    status: "new",
    docUrl: "https://www.orimi.com/pdf-test.pdf",
    history: [{ at: new Date().toISOString(), action: "Submitted", by: "System" }],
  },
  {
    id: "A-1002",
    name: "Vishal Mehta",
    email: "vishal.mehta@example.com",
    program: "MBA",
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    score: 91,
    status: "in-review",
    history: [{ at: new Date().toISOString(), action: "Submitted", by: "System" }],
  },
  {
    id: "A-1003",
    name: "Sara Khan",
    email: "sara.khan@example.com",
    program: "B.A.",
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    score: 78,
    status: "waitlisted",
    history: [{ at: new Date().toISOString(), action: "Submitted", by: "System" }],
  },
];
