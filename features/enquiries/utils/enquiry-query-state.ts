import {
  EnquiryStatus,
  EnquirySource,
  ProjectType,
  EnquiryStage,
  EnquirySort,
} from "../types/enquiry.types";

export interface EnquiryQueryState {
  q: string;
  status: EnquiryStatus | null;
  source: EnquirySource | null;
  type: ProjectType | null;
  stage: EnquiryStage | null;
  sort: EnquirySort;
  page: number;
}

const VALID_STATUSES: Set<EnquiryStatus> = new Set([
  "active",
  "needs_attention",
  "completed",
  "archived",
]);
const VALID_STAGES: Set<EnquiryStage> = new Set([
  "new",
  "clarification",
  "consultation",
  "qualified",
  "proposal",
  "won",
  "lost",
]);
const VALID_SOURCES: Set<EnquirySource> = new Set([
  "website",
  "referral",
  "partner",
  "franchise",
  "direct",
]);
const VALID_PROJECT_TYPES: Set<ProjectType> = new Set([
  "residential",
  "commercial",
  "hospitality",
  "multi_family",
  "landscape",
  "retail",
]);
const VALID_SORTS: Set<EnquirySort> = new Set(["received_desc", "received_asc"]);

export function parseEnquiryQuery(searchParams: URLSearchParams): EnquiryQueryState {
  const q = (searchParams.get("q") || "").trim();

  const rawStatus = searchParams.get("status") as any;
  const status = VALID_STATUSES.has(rawStatus) ? rawStatus : null;

  const rawSource = searchParams.get("source") as any;
  const source = VALID_SOURCES.has(rawSource) ? rawSource : null;

  const rawType = searchParams.get("type") as any;
  const type = VALID_PROJECT_TYPES.has(rawType) ? rawType : null;

  const rawStage = searchParams.get("stage") as any;
  const stage = VALID_STAGES.has(rawStage) ? rawStage : null;

  const rawSort = searchParams.get("sort") as any;
  const sort = VALID_SORTS.has(rawSort) ? rawSort : "received_desc";

  const rawPage = searchParams.get("page");
  let page = 1;
  if (rawPage) {
    const parsed = parseInt(rawPage, 10);
    if (!isNaN(parsed) && parsed > 0) {
      page = parsed;
    }
  }

  return { q, status, source, type, stage, sort, page };
}

export function serializeEnquiryQuery(
  state: Partial<EnquiryQueryState>,
  currentParams?: URLSearchParams
): URLSearchParams {
  const params = new URLSearchParams(currentParams?.toString() || "");

  const updateParam = (key: string, val: string | number | null | undefined) => {
    if (val === null || val === undefined || val === "") {
      params.delete(key);
    } else {
      params.set(key, val.toString());
    }
  };

  if ("q" in state) updateParam("q", state.q);
  if ("status" in state) updateParam("status", state.status);
  if ("source" in state) updateParam("source", state.source);
  if ("type" in state) updateParam("type", state.type);
  if ("stage" in state) updateParam("stage", state.stage);
  if ("sort" in state) updateParam("sort", state.sort);
  if ("page" in state) {
    if (state.page && state.page > 1) {
      params.set("page", state.page.toString());
    } else {
      params.delete("page");
    }
  }

  return params;
}

export function getEnquiryDetailPath(id: string): string {
  return `/enquiries/${encodeURIComponent(id)}`;
}
