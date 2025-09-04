import type { ReviewStatus } from "./types";

type Props = {
  status: "all" | ReviewStatus;
  program: string;
  q: string;
  sort: "recent" | "score" | "name";
  onChange: (p: Partial<Props>) => void;
  programs: string[];
};

export default function ReviewToolbar({ status, program, q, sort, onChange, programs }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 p-2 border-b border-gray-200 dark:border-gray-700">
      <label className="text-sm">
        <span className="mr-1">Status</span>
        <select
          className="border rounded p-1 bg-white dark:bg-gray-800"
          value={status}
          onChange={(e) => onChange({ status: e.target.value as Props["status"] })}
        >
          {["all","new","in-review","accepted","waitlisted","rejected","changes-requested"].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </label>

      <label className="text-sm">
        <span className="mr-1">Program</span>
        <select
          className="border rounded p-1 bg-white dark:bg-gray-800"
          value={program}
          onChange={(e) => onChange({ program: e.target.value })}
        >
          <option value="all">All</option>
          {programs.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </label>

      <input
        value={q}
        onChange={(e) => onChange({ q: e.target.value })}
        placeholder="Search name/email/id"
        className="flex-1 min-w-[160px] border rounded p-2 dark:bg-gray-800 dark:text-gray-100"
        aria-label="Search applications"
      />

      <label className="text-sm ml-auto">
        <span className="mr-1">Sort</span>
        <select
          className="border rounded p-1 bg-white dark:bg-gray-800"
          value={sort}
          onChange={(e) => onChange({ sort: e.target.value as Props["sort"] })}
        >
          <option value="recent">Recent</option>
          <option value="score">Score</option>
          <option value="name">Name</option>
        </select>
      </label>
    </div>
  );
}
