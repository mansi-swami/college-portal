import DecisionBadge from "./DecisionBadge";
import type { Application } from "./types";

type Props = {
  items: Application[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export default function ApplicationList({ items, selectedId, onSelect }: Props) {
  return (
    <ul role="list" aria-label="Applications" className="divide-y divide-gray-200 dark:divide-gray-700">
      {items.map(app => (
        <li
          key={app.id}
          role="listitem"
          tabIndex={0}
          onClick={() => onSelect(app.id)}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect(app.id)}
          className={`p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800
            ${selectedId === app.id ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
        >
          <div className="flex items-center gap-2">
            <div className="font-medium">{app.name}</div>
            <span className="text-xs opacity-70">({app.id})</span>
            <div className="ml-auto flex items-center gap-2">
              {typeof app.score === "number" && (
                <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700">
                  Score: {app.score}
                </span>
              )}
              <DecisionBadge status={app.status} />
            </div>
          </div>
          <div className="text-sm opacity-80">{app.program} • {new Date(app.submittedAt).toLocaleString()}</div>
          <div className="text-xs opacity-70">{app.email}</div>
        </li>
      ))}
      {items.length === 0 && (
        <li className="p-4 text-sm opacity-70">No applications match your filters.</li>
      )}
    </ul>
  );
}
