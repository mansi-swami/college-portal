import FacultyReviewDashboard from "../components/faculty-review/FacultyReviewDashboard";

export default function Faculty() {
  return (
    <section aria-labelledby="faculty-review" className="space-y-4">
      <h2 id="faculty-review" className="sr-only">Faculty Application Review</h2>
      <FacultyReviewDashboard />
    </section>
  );
}
