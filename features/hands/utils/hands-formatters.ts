import type { AttendanceSummary } from "../types/hands.types";

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
