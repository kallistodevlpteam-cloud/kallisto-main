import { EnquiryNextAction } from "../types/enquiry.types";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatTime(date: Date): string {
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const hh = displayHours.toString().padStart(2, "0");
  const mm = minutes.toString().padStart(2, "0");
  return `${hh}:${mm} ${ampm}`;
}

export function formatEnquiryDate(dateVal: string | number | null | undefined, now: Date): string {
  if (dateVal === null || dateVal === undefined) return "—";
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return "—";

  // Compare UTC calendar dates
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const target = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const diffTime = target - today;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const timeStr = formatTime(d);

  if (diffDays === 0) {
    return `Today, ${timeStr}`;
  } else if (diffDays === -1) {
    return `Yesterday, ${timeStr}`;
  } else {
    return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
  }
}

export function formatActionDueDate(dueAtStr: string, now: Date): string {
  const d = new Date(dueAtStr);
  if (isNaN(d.getTime())) return "";

  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const target = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const diffTime = target - today;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Due today";
  } else if (diffDays === 1) {
    return "Due tomorrow";
  } else if (diffDays > 1 && diffDays <= 7) {
    return `Due in ${diffDays} days`;
  } else {
    return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${formatTime(d)}`;
  }
}

export function formatNextActionMeta(
  nextAction: EnquiryNextAction,
  now: Date
): string {
  if (nextAction.state === "ready") return "When ready";
  if (nextAction.state === "completed") return "Completed";
  if (!nextAction.dueAt) return "";

  return formatActionDueDate(nextAction.dueAt, now);
}
