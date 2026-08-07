export interface DueStateResult {
  dueState: "overdue" | "due_today" | "due_soon" | "on_track" | "no_due_date";
  dueLabel: string;
  isOverdue: boolean;
}

export function calculateDueState(
  dueAt: string | null | undefined,
  options?: { now?: Date | string; timezone?: string }
): DueStateResult {
  if (!dueAt) {
    return {
      dueState: "no_due_date",
      dueLabel: "No deadline",
      isOverdue: false,
    };
  }

  const currentDate = options?.now
    ? new Date(options.now)
    : new Date();

  const dueDate = new Date(dueAt);
  if (isNaN(dueDate.getTime())) {
    return {
      dueState: "no_due_date",
      dueLabel: "Invalid date",
      isOverdue: false,
    };
  }

  // Strip time for day comparison
  const currentStart = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate()
  );
  const dueStart = new Date(
    dueDate.getFullYear(),
    dueDate.getMonth(),
    dueDate.getDate()
  );

  const diffMs = dueStart.getTime() - currentStart.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const formattedAbsolute = `${dueDate.getDate()} ${monthNames[dueDate.getMonth()]} ${dueDate.getFullYear()}`;

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return {
      dueState: "overdue",
      dueLabel: overdueDays === 1 ? "Overdue by 1 day" : `Overdue by ${overdueDays} days`,
      isOverdue: true,
    };
  }

  if (diffDays === 0) {
    return {
      dueState: "due_today",
      dueLabel: `Today · ${formattedAbsolute}`,
      isOverdue: false,
    };
  }

  if (diffDays <= 7) {
    return {
      dueState: "due_soon",
      dueLabel: `In ${diffDays} days · ${formattedAbsolute}`,
      isOverdue: false,
    };
  }

  return {
    dueState: "on_track",
    dueLabel: formattedAbsolute,
    isOverdue: false,
  };
}
