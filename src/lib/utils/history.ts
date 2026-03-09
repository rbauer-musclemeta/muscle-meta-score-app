import type { CombinedResultSnapshot } from "@/types/results";

const LATEST_KEY = "muscle_meta_latest_result";
const HISTORY_KEY = "muscle_meta_history";

export function saveLatestResult(result: CombinedResultSnapshot): void {
  localStorage.setItem(LATEST_KEY, JSON.stringify(result));

  const history = readHistory();
  history.unshift(result);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
}

export function readLatestResult(): CombinedResultSnapshot | null {
  const raw = localStorage.getItem(LATEST_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as CombinedResultSnapshot;
  } catch {
    return null;
  }
}

export function readHistory(): CombinedResultSnapshot[] {
  const raw = localStorage.getItem(HISTORY_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as CombinedResultSnapshot[];
  } catch {
    return [];
  }
}
