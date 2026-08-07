import type { HandsTab } from "../types/hands.types";

const HANDS_TABS: readonly HandsTab[] = [
  "overview",
  "requests",
  "deployments",
  "attendance",
  "payments",
];

interface SearchParamsReader {
  get(name: string): string | null;
}

export function isHandsTab(value: string | null): value is HandsTab {
  return value !== null && HANDS_TABS.some((tab) => tab === value);
}

export function parseHandsTab(searchParams: SearchParamsReader): HandsTab {
  const requestedTab = searchParams.get("tab");
  return isHandsTab(requestedTab) ? requestedTab : "overview";
}

export function serializeHandsTab(
  tab: HandsTab,
  existing?: URLSearchParams,
): URLSearchParams {
  const next = new URLSearchParams(existing?.toString());
  next.set("tab", tab);
  return next;
}
