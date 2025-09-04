import type { ReviewStatus } from "./types";

export default function DecisionBadge({ status }: { status: ReviewStatus }) {
  const map: Record<ReviewStatus, string> = {
    "new": "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100",
    "in-review": "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200",
    "accepted": "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
    "waitlisted": "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200",
    "rejected": "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
    "changes-requested": "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200",
  };
  return <span className={`px-2 py-0.5 text-xs rounded ${map[status]}`}>{status}</span>;
}
