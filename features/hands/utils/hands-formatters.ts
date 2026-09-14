import type {
  AttendanceSummary,
  Deployment,
  HandsMetric,
  WorkforceRequest,
} from "../types/hands.types";

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatInr(value: number): string {
  return inrFormatter.format(value);
}

export function formatAttendance(attendance: AttendanceSummary): string {
  if (
    attendance.state === "pending" ||
    attendance.present === undefined ||
    attendance.total === undefined
  ) {
    return "Pending";
  }

  return `${attendance.present} / ${attendance.total}`;
}

export function getFulfilmentPercentage(
  fulfilled: number,
  quantity: number,
): number {
  if (quantity <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round((fulfilled / quantity) * 100)));
}

export interface OpenPositionsSummary {
  totalPositions: number;
  requestCount: number;
  supportingText: string;
}

export function getOpenPositionsSummary(
  requests: WorkforceRequest[] = [],
): OpenPositionsSummary {
  const activeOpenRequests = requests.filter(
    (req) =>
      req.status !== "Draft" &&
      req.status !== "Fulfilled" &&
      req.quantity - (req.fulfilled ?? 0) > 0,
  );

  const totalPositions = activeOpenRequests.reduce(
    (sum, req) => sum + Math.max(0, req.quantity - (req.fulfilled ?? 0)),
    0,
  );

  const requestCount = activeOpenRequests.length;
  const supportingText = `Across ${requestCount} request${requestCount === 1 ? "" : "s"}`;

  return {
    totalPositions,
    requestCount,
    supportingText,
  };
}

export function computeHandsOverviewMetrics(
  _deployments: Deployment[] = [],
  requests: WorkforceRequest[] = [],
  baseMetrics: HandsMetric[] = [],
): HandsMetric[] {
  void _deployments;
  const { totalPositions, supportingText } = getOpenPositionsSummary(requests);

  return baseMetrics.map((metric) => {
    if (metric.id === "open-positions") {
      return {
        ...metric,
        value: totalPositions,
        supportingText,
      };
    }
    return metric;
  });
}
