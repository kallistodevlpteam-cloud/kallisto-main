import type {
  HubCategoryFilter,
  HubProjectFilter,
  HubQueryState,
  MaterialRequestStatus,
  ProcurementStage,
  RequiredDateFilter,
} from "../types/hub.types";

type SearchParamsReader = Pick<URLSearchParams, "get">;
type SearchParamsWriterSource = Pick<URLSearchParams, "toString">;

const PROJECTS = new Set<HubProjectFilter>([
  "nila-residence",
  "lake-house",
  "all",
]);
const STAGES = new Set<ProcurementStage>([
  "requirements",
  "quotations",
  "approval",
  "ordered",
  "delivered",
]);
const STATUSES = new Set<MaterialRequestStatus>([
  "quotes_received",
  "awaiting_quotes",
  "approval_pending",
  "ordered",
  "delivered",
]);
const CATEGORIES = new Set<HubCategoryFilter>([
  "all",
  "cement",
  "electrical",
  "sanitaryware",
  "steel",
]);
const REQUIRED_DATES = new Set<RequiredDateFilter>([
  "all",
  "overdue",
  "7_days",
  "30_days",
]);

export const DEFAULT_HUB_QUERY_STATE: HubQueryState = {
  project: "nila-residence",
  stage: "requirements",
  status: null,
  category: "all",
  search: "",
  attention: false,
  requiredDate: "all",
};

function readAllowedValue<T extends string>(
  value: string | null,
  allowed: Set<T>,
  fallback: T,
): T {
  return value && allowed.has(value as T) ? (value as T) : fallback;
}

export function parseHubQuery(searchParams: SearchParamsReader): HubQueryState {
  const rawStatus = searchParams.get("status");

  return {
    project: readAllowedValue(
      searchParams.get("project"),
      PROJECTS,
      DEFAULT_HUB_QUERY_STATE.project,
    ),
    stage: readAllowedValue(
      searchParams.get("stage"),
      STAGES,
      DEFAULT_HUB_QUERY_STATE.stage,
    ),
    status:
      rawStatus && STATUSES.has(rawStatus as MaterialRequestStatus)
        ? (rawStatus as MaterialRequestStatus)
        : null,
    category: readAllowedValue(
      searchParams.get("category"),
      CATEGORIES,
      DEFAULT_HUB_QUERY_STATE.category,
    ),
    search: (searchParams.get("search") ?? "").trimStart(),
    attention: searchParams.get("attention") === "1",
    requiredDate: readAllowedValue(
      searchParams.get("requiredDate"),
      REQUIRED_DATES,
      DEFAULT_HUB_QUERY_STATE.requiredDate,
    ),
  };
}

export function serializeHubQuery(
  state: HubQueryState,
  currentParams?: SearchParamsWriterSource,
): URLSearchParams {
  const params = new URLSearchParams(currentParams?.toString() ?? "");

  const setOrDelete = (key: string, value: string, defaultValue: string) => {
    if (!value || value === defaultValue) {
      params.delete(key);
      return;
    }
    params.set(key, value);
  };

  setOrDelete("project", state.project, DEFAULT_HUB_QUERY_STATE.project);
  setOrDelete("stage", state.stage, DEFAULT_HUB_QUERY_STATE.stage);
  setOrDelete("category", state.category, DEFAULT_HUB_QUERY_STATE.category);
  setOrDelete(
    "requiredDate",
    state.requiredDate,
    DEFAULT_HUB_QUERY_STATE.requiredDate,
  );

  if (state.status) {
    params.set("status", state.status);
  } else {
    params.delete("status");
  }

  if (state.search.trim()) {
    params.set("search", state.search.trim());
  } else {
    params.delete("search");
  }

  if (state.attention) {
    params.set("attention", "1");
  } else {
    params.delete("attention");
  }

  return params;
}
