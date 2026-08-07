import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TodayTab } from "@/features/calendar/components/today-tab/today-tab";
import type { PresentableActivity } from "@/features/calendar/services/calendar-activity.service";

const primaryActivity: PresentableActivity = {
  id: "act-review",
  workspaceId: "ws-kallisto",
  title: "Client design review",
  activityType: "client_meeting",
  visibility: "project",
  ownerId: "usr-1",
  assigneeIds: ["usr-1", "usr-2"],
  time: {
    allDay: false,
    startAt: "2026-07-24T10:30:00+05:30",
    endAt: "2026-07-24T11:30:00+05:30",
    timezone: "Asia/Kolkata",
  },
  projectId: "proj-201",
  location: "Kallisto Studio, Kochi",
  notes: "Review the revised plan before the drawing package advances.",
  sourceType: "calendar_activity",
  sourceId: "act-review",
  status: "scheduled",
  isOverdue: false,
};

afterEach(cleanup);

describe("Calendar Today operations workspace", () => {
  it("renders the editorial focus, agenda, calendar rail, and summary", () => {
    render(
      <TodayTab
        activities={[primaryActivity]}
        projectsList={[{ id: "proj-201", name: "Nila Residence" }]}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Client design review" })
    ).toBeInTheDocument();
    expect(screen.getByText("Today's schedule")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "July 2026" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Day summary" }).closest("section")
    ).toHaveTextContent("1Scheduled");
  });

  it("sends activity, date, scope, filter, and completion interactions to the workspace", () => {
    const onSelectActivity = vi.fn();
    const onDateChange = vi.fn();
    const onScopeChange = vi.fn();
    const onCategoryChange = vi.fn();
    const onMarkComplete = vi.fn().mockResolvedValue(undefined);

    render(
      <TodayTab
        activities={[primaryActivity]}
        projectsList={[{ id: "proj-201", name: "Nila Residence" }]}
        onSelectActivity={onSelectActivity}
        onDateChange={onDateChange}
        onScopeChange={onScopeChange}
        onCategoryChange={onCategoryChange}
        onMarkComplete={onMarkComplete}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Open activity" }));
    expect(onSelectActivity).toHaveBeenCalledWith("act-review");

    fireEvent.click(screen.getByRole("button", { name: "Saturday, 25 July 2026" }));
    expect(onDateChange).toHaveBeenCalledWith("2026-07-25");

    fireEvent.change(screen.getByLabelText("Calendar scope"), {
      target: { value: "team" },
    });
    expect(onScopeChange).toHaveBeenCalledWith("team");

    fireEvent.change(screen.getByLabelText("Activity type"), {
      target: { value: "meetings" },
    });
    expect(onCategoryChange).toHaveBeenCalledWith("meetings");

    fireEvent.click(screen.getByRole("button", { name: "Mark complete" }));
    expect(onMarkComplete).toHaveBeenCalledWith("act-review");
  });

  it("renders the restrained empty state and add action", () => {
    const onAddActivity = vi.fn();

    render(<TodayTab activities={[]} onAddActivity={onAddActivity} />);

    expect(
      screen.getByRole("heading", { name: "Nothing scheduled for this day" })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add activity" }));
    expect(onAddActivity).toHaveBeenCalledTimes(1);
  });
});
