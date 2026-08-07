import type {
  HubQueryState,
  MaterialRequest,
  MaterialRequestStatus,
} from "../types/hub.types";

export const MATERIAL_REQUEST_STATUS_LABELS: Record<
  MaterialRequestStatus,
  string
> = {
  quotes_received: "Quotes received",
  awaiting_quotes: "Awaiting quotes",
  approval_pending: "Approval pending",
  ordered: "Ordered",
  delivered: "Delivered",
};

const REFERENCE_DATE = new Date("2026-07-27T00:00:00.000Z");
const DAY_IN_MILLISECONDS = 86_400_000;

function matchesRequiredDate(
  request: MaterialRequest,
  requiredDate: HubQueryState["requiredDate"],
): boolean {
  if (requiredDate === "all") {
    return true;
  }

  const dueDate = new Date(`${request.requiredBy}T00:00:00.000Z`);
  const daysUntilDue = Math.floor(
    (dueDate.getTime() - REFERENCE_DATE.getTime()) / DAY_IN_MILLISECONDS,
  );

  if (requiredDate === "overdue") {
    return daysUntilDue < 0;
  }

  if (daysUntilDue < 0) {
    return false;
  }

  return requiredDate === "7_days" ? daysUntilDue <= 7 : daysUntilDue <= 30;
}

export function filterMaterialRequests(
  requests: ReadonlyArray<MaterialRequest>,
  query: HubQueryState,
): MaterialRequest[] {
  const searchTerms = query.search
    .trim()
    .toLocaleLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  return requests.filter((request) => {
    if (query.project !== "all" && request.projectId !== query.project) {
      return false;
    }

    if (
      query.stage !== "requirements" &&
      request.stage !== query.stage
    ) {
      return false;
    }

    if (query.status && request.status !== query.status) {
      return false;
    }

    if (
      query.category !== "all" &&
      request.categoryGroup !== query.category
    ) {
      return false;
    }

    if (query.attention && !request.needsAttention) {
      return false;
    }

    if (!matchesRequiredDate(request, query.requiredDate)) {
      return false;
    }

    if (searchTerms.length > 0) {
      const searchable = [
        request.name,
        request.projectName,
        ...request.categories,
        MATERIAL_REQUEST_STATUS_LABELS[request.status],
      ]
        .join(" ")
        .toLocaleLowerCase();

      if (!searchTerms.every((term) => searchable.includes(term))) {
        return false;
      }
    }

    return true;
  });
}
