/**
 * Formats an ISO date string, Date object, or timestamp into human-readable relative time string.
 * Examples: "Just now", "1 min ago", "15 min ago", "30 min ago", "1 hr ago", "2 hrs ago", "Yesterday".
 */
export function formatRelativeTime(dateInput?: string | number | Date | null): string {
  if (!dateInput) return "Just now";

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "Just now";

  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();

  // Less than 30 seconds ago or future timestamp
  if (diffInMs < 30 * 1000) {
    return "Just now";
  }

  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) {
    return "Just now";
  }

  if (diffInMinutes === 1) {
    return "1 min ago";
  }

  if (diffInMinutes < 60) {
    return `${diffInMinutes} min ago`;
  }

  if (diffInHours === 1) {
    return "1 hr ago";
  }

  if (diffInHours < 24) {
    return `${diffInHours} hrs ago`;
  }

  if (diffInDays === 1) {
    return "Yesterday";
  }

  if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
