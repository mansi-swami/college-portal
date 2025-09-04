import { useEffect, useMemo, useReducer } from "react";
import type { Application, ReviewStatus } from "./types";
import { MOCK_APPLICATIONS } from "./mock";

type State = {
  items: Application[];
  selectedId: string | null;
  filter: { status: "all" | ReviewStatus; program: string; q: string; sort: "recent" | "score" | "name" };
};

type Action =
  | { type: "init"; payload: Application[] }
  | { type: "select"; id: string | null }
  | { type: "setFilter"; payload: Partial<State["filter"]> }
  | { type: "updateStatus"; id: string; status: ReviewStatus; by: string; comment?: string }
  | { type: "updateNotes"; id: string; notes: string };

const STORAGE_KEY = "faculty_review_apps_v1";

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "init": {
      return { ...state, items: action.payload, selectedId: action.payload[0]?.id ?? null };
    }
    case "select": {
      return { ...state, selectedId: action.id };
    }
    case "setFilter": {
      return { ...state, filter: { ...state.filter, ...action.payload } };
    }
    case "updateStatus": {
      const items = state.items.map(a =>
        a.id !== action.id
          ? a
          : {
              ...a,
              status: action.status,
              history: [
                { at: new Date().toISOString(), action: `Status → ${action.status}`, by: action.by, comment: action.comment },
                ...a.history,
              ],
            }
      );
      return { ...state, items };
    }
    case "updateNotes": {
      const items = state.items.map(a => (a.id === action.id ? { ...a, notes: action.notes } : a));
      return { ...state, items };
    }
    default:
      return state;
  }
}

export default function useApplications() {
  const [state, dispatch] = useReducer(reducer, {
    items: [],
    selectedId: null,
    filter: { status: "all", program: "all", q: "", sort: "recent" },
  });

  // Load once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Application[];
        dispatch({ type: "init", payload: parsed });
      } else {
        dispatch({ type: "init", payload: MOCK_APPLICATIONS });
      }
    } catch {
      dispatch({ type: "init", payload: MOCK_APPLICATIONS });
    }
  }, []);

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // ignore
    }
  }, [state.items]);

  useEffect(() => {
  const handler = (e: Event) => {
    const ce = e as CustomEvent<Application>;
    if (!ce.detail) return;
    // Prepend new app
    dispatch({ type: "init", payload: [ce.detail, ...state.items] });
  };
  window.addEventListener("app:submitted", handler as EventListener);
  return () => window.removeEventListener("app:submitted", handler as EventListener);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [state.items]);

  const selected = useMemo(
    () => state.items.find(a => a.id === state.selectedId) ?? null,
    [state.items, state.selectedId]
  );

  const filtered = useMemo(() => {
    const { status, program, q, sort } = state.filter;
    let arr = state.items.slice();
    if (status !== "all") arr = arr.filter(a => a.status === status);
    if (program !== "all") arr = arr.filter(a => a.program === program);
    if (q.trim()) {
      const needle = q.toLowerCase();
      arr = arr.filter(a =>
        [a.name, a.email, a.program, a.id].some(s => s.toLowerCase().includes(needle))
      );
    }
    switch (sort) {
      case "score":
        arr.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
        break;
      case "name":
        arr.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        arr.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    }
    return arr;
  }, [state.items, state.filter]);

  // Actions
  const select = (id: string | null) => dispatch({ type: "select", id });
  const setFilter = (payload: Partial<State["filter"]>) => dispatch({ type: "setFilter", payload });
  const updateStatus = (id: string, status: ReviewStatus, by: string, comment?: string) =>
    dispatch({ type: "updateStatus", id, status, by, comment });
  const updateNotes = (id: string, notes: string) => dispatch({ type: "updateNotes", id, notes });

  return { state, selected, filtered, select, setFilter, updateStatus, updateNotes };
}

export { reducer }; // for testing
