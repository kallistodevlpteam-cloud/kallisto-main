import { EnquiryRecord, EnquirySort, PROJECT_TYPE_LABELS, SOURCE_LABELS, STATUS_LABELS, STAGE_LABELS } from "../types/enquiry.types";

export interface FilterParams {
  q: string;
  status: string | null;
  source: string | null;
  type: string | null;
  stage: string | null;
}

export function filterEnquiries(
  items: EnquiryRecord[],
  filters: FilterParams
): EnquiryRecord[] {
  const normalizedQuery = filters.q.trim().toLowerCase().replace(/\s+/g, " ");

  return items.filter((item) => {
    // 1. Text Search Coverage
    if (normalizedQuery) {
      const typeLabel = PROJECT_TYPE_LABELS[item.projectType] || "";
      const sourceLabel = SOURCE_LABELS[item.source] || "";
      const statusLabel = STATUS_LABELS[item.status] || "";
      const stageLabel = STAGE_LABELS[item.stage] || "";

      const searchableText = [
        item.title,
        item.clientName,
        item.location,
        typeLabel,
        sourceLabel,
        statusLabel,
        stageLabel,
        item.requirementSummary,
      ]
        .join(" ")
        .toLowerCase()
        .replace(/\s+/g, " ");

      const queryWords = normalizedQuery.split(" ");
      const matchesAll = queryWords.every((word) => searchableText.includes(word));
      if (!matchesAll) {
        return false;
      }
    }

    // 2. Status filter
    if (filters.status && item.status !== filters.status) {
      return false;
    }

    // 3. Source filter
    if (filters.source && item.source !== filters.source) {
      return false;
    }

    // 4. Project Type filter
    if (filters.type && item.projectType !== filters.type) {
      return false;
    }

    // 5. Stage filter
    if (filters.stage && item.stage !== filters.stage) {
      return false;
    }

    return true;
  });
}

export function sortEnquiries(
  items: EnquiryRecord[],
  sort: EnquirySort
): EnquiryRecord[] {
  const mapped = items.map((item, idx) => ({ item, idx }));

  mapped.sort((x, y) => {
    const timeX = new Date(x.item.receivedAt ?? 0).getTime();
    const timeY = new Date(y.item.receivedAt ?? 0).getTime();

    if (timeX !== timeY) {
      return sort === "received_desc" ? timeY - timeX : timeX - timeY;
    }
    // Stable sort fallback on equal timestamps using original array index
    return x.idx - y.idx;
  });

  return mapped.map((m) => m.item);
}

export function paginateEnquiries(
  items: EnquiryRecord[],
  page: number,
  pageSize: number
): EnquiryRecord[] {
  const startIndex = (page - 1) * pageSize;
  return items.slice(startIndex, startIndex + pageSize);
}
