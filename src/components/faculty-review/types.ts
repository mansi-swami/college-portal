export type ReviewStatus = "new" | "in-review" | "accepted" | "waitlisted" | "rejected" | "changes-requested";

export type Application = {
  id: string;
  name: string;
  email: string;
  program: string;
  submittedAt: string;     // ISO string
  score?: number;          // optional initial score
  status: ReviewStatus;
  docUrl?: string;         // placeholder for PDF preview
  notes?: string;
  history: Array<{ at: string; action: string; by: string; comment?: string }>;
};
