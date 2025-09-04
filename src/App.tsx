import { useEffect, useId, useState } from "react";
import DarkModeToggle from "./components/UI/DarkModeToggle";
import SkipLink from "./components/UI/SkipLink";
import Announcer from "./a11y/Announcer";
import StudentPage from "./pages/StudentPortal";
import FacultyPage from "./pages/FacultyPortal";
import applicationLogo from "./assets/application.jpg";

type TabKey = "student" | "faculty";
const TAB_STORAGE_KEY = "portal_active_tab_v1";

export default function App() {
  const [tab, setTab] = useState<TabKey>("student");
  const studentTabId = useId();
  const facultyTabId = useId();
  const studentPanelId = useId();
  const facultyPanelId = useId();

  useEffect(() => {
    const saved = localStorage.getItem(TAB_STORAGE_KEY) as TabKey | null;
    if (saved === "student" || saved === "faculty") setTab(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem(TAB_STORAGE_KEY, tab);
  }, [tab]);

  const handleKeyNav = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      setTab((p) => (p === "student" ? "faculty" : "student"));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <SkipLink />
      <Announcer />

      <header role="banner" className="p-6 flex flex-wrap items-center gap-4 justify-between">
        <div className="group inline-flex items-center gap-3">
          <img
            src={applicationLogo}
            alt="College Portal Logo"
            className="h-10 w-10 rounded-full border border-gray-300 dark:border-gray-600 shadow-sm transition-transform duration-300 motion-safe:group-hover:scale-105 cursor-pointer"
            onClick={() => setTab("student")}
          />
          <div>
            <h1 className="text-xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 drop-shadow-sm">
              College Application Portal
            </h1>
            <div className="mt-2 h-1 w-40 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            role="tablist"
            aria-label="Primary sections"
            className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 p-1 bg-white dark:bg-gray-800"
            onKeyDown={handleKeyNav}
          >
            <button
              id={studentTabId}
              role="tab"
              aria-selected={tab === "student"}
              aria-controls={studentPanelId}
              tabIndex={tab === "student" ? 0 : -1}
              onClick={() => setTab("student")}
              className={`px-3 py-1.5 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                tab === "student" ? "bg-blue-600 text-white" : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Student
            </button>
            <button
              id={facultyTabId}
              role="tab"
              aria-selected={tab === "faculty"}
              aria-controls={facultyPanelId}
              tabIndex={tab === "faculty" ? 0 : -1}
              onClick={() => setTab("faculty")}
              className={`px-3 py-1.5 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                tab === "faculty" ? "bg-blue-600 text-white" : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Faculty
            </button>
          </div>

          <DarkModeToggle />
        </div>
      </header>

      <main id="main-content" role="main" className="p-6">
        <section
          id={studentPanelId}
          role="tabpanel"
          aria-labelledby={studentTabId}
          hidden={tab !== "student"}
          className="space-y-6"
        >
          <StudentPage />
        </section>

        <section
          id={facultyPanelId}
          role="tabpanel"
          aria-labelledby={facultyTabId}
          hidden={tab !== "faculty"}
        >
          <FacultyPage />
        </section>
      </main>

      <footer role="contentinfo" className="p-6 text-sm opacity-80">
        © {new Date().getFullYear()} College Portal
      </footer>
    </div>
  );
}
