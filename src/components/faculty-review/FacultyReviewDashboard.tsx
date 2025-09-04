import useApplications from "./useApplications";
import ApplicationList from "./ApplicationList";
import ApplicationDetail from "./ApplicationDetail";
import ReviewToolbar from "./ReviewToolbar";

export default function FacultyReviewDashboard() {
  const { state, filtered, selected, select, setFilter, updateStatus, updateNotes } = useApplications();

  const programs = Array.from(new Set(state.items.map(a => a.program))).sort();

  return (
    <section aria-labelledby="faculty-review-title" className="border rounded-lg bg-white dark:bg-gray-900">
      <h2 id="faculty-review-title" className="text-xl font-bold p-4 border-b dark:border-gray-700">Faculty Application Review</h2>

      <ReviewToolbar
        status={state.filter.status}
        program={state.filter.program}
        q={state.filter.q}
        sort={state.filter.sort}
        onChange={setFilter}
        programs={programs}
      />

      <div className="grid grid-cols-1 md:grid-cols-3">
        <div className="md:border-r dark:border-gray-700">
          <ApplicationList items={filtered} selectedId={state.selectedId} onSelect={select} />
        </div>
        <div className="md:col-span-2 min-h-[500px]">
          <ApplicationDetail
            app={selected}
            onStatus={(status, comment) => {
              if (!selected) return;
              updateStatus(selected.id, status, "Faculty Reviewer", comment);
            }}
            onNotes={(notes) => {
              if (!selected) return;
              updateNotes(selected.id, notes);
            }}
          />
        </div>
      </div>
    </section>
  );
}
