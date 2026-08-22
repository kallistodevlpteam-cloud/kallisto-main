import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CalendarTab } from "@/features/calendar/components/calendar-tab/calendar-tab";
import type { PresentableActivity } from "@/features/calendar/services/calendar-activity.service";

const sampleActivity: PresentableActivity = {
  id: "act-guitar",
  workspaceId: "ws-kallisto",
  title: "Client design review",
  activityType: "client_meeting",
  visibility: "project",
  ownerId: "usr-1",
  assigneeIds: ["usr-1", "usr-2"],
  time: {
    allDay: false,
    startAt: "2026-07-24T09:00:00+05:30",
    endAt: "2026-07-24T09:45:00+05:30",
    timezone: "Asia/Kolkata",
  },
  projectId: "proj-201",
  location: "834 Boyer Shore Suite 076",
  notes: "Everybody that has ever been to a meeting can recall the familiar passing of business cards.",
  sourceType: "calendar_activity",
  sourceId: "act-guitar",
  status: "scheduled",
  isOverdue: false,
};

afterEach(cleanup);

describe("Redesigned Mockup-Aligned CalendarTab", () => {
  it("renders the 2-column layout with month title, weekday headers, and right detail panel", () => {
    render(
      <CalendarTab
        activities={[sampleActivity]}
        projectsList={[{ id: "proj-201", name: "Nila Residence" }]}
      />
    );

    expect(screen.getByText("July 2026")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Today" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous month" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next month" })).toBeInTheDocument();
    expect(screen.getByText("Mon")).toBeInTheDocument();
    expect(screen.getByText("Sun")).toBeInTheDocument();

    // Right detail inspector panel
    expect(screen.getByText("DAY SCHEDULE")).toBeInTheDocument();
    expect(screen.getAllByText("Client design review").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Brandon Russell")).toBeInTheDocument();
    expect(screen.getAllByText("09:00 – 09:45").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Nila Residence")).toBeInTheDocument();
  });

  it("toggles bottom category checkboxes and supports activity selection", () => {
    const onSelectActivity = vi.fn();
    const onUpdateQuery = vi.fn();

    render(
      <CalendarTab
        activities={[sampleActivity]}
        projectsList={[{ id: "proj-201", name: "Nila Residence" }]}
        onSelectActivity={onSelectActivity}
        onUpdateQuery={onUpdateQuery}
      />
    );

    // Click activity inside the calendar
    const activityPill = screen.getAllByText("Client design review")[0];
    fireEvent.click(activityPill);

    expect(onSelectActivity).toHaveBeenCalledWith("act-guitar");

    // Category checkboxes
    expect(screen.getByText("Meetings")).toBeInTheDocument();
    expect(screen.getByText("Site visits")).toBeInTheDocument();
    expect(screen.getByText("Tasks")).toBeInTheDocument();
    expect(screen.getByText("Deliverables")).toBeInTheDocument();
    expect(screen.getByText("Deadlines")).toBeInTheDocument();

    // Click meeting checkbox to toggle off
    fireEvent.click(screen.getByText("Meetings"));
  });

  it("handles deterministic priority sorting (Deadlines before Scheduled before Completed) and +N overflow", () => {
    const activitiesList: PresentableActivity[] = [
      {
        id: "act-comp-1",
        workspaceId: "ws-kallisto",
        title: "Completed Early Morning Task",
        activityType: "task",
        visibility: "project",
        ownerId: "usr-1",
        assigneeIds: ["usr-1"],
        time: { allDay: false, startAt: "2026-07-24T08:00:00+05:30", endAt: "2026-07-24T08:30:00+05:30", timezone: "Asia/Kolkata" },
        status: "completed",
        isOverdue: false,
        sourceType: "calendar_activity",
        sourceId: "act-comp-1",
      },
      {
        id: "act-sched-1",
        workspaceId: "ws-kallisto",
        title: "Scheduled Site Inspection",
        activityType: "site_visit",
        visibility: "project",
        ownerId: "usr-1",
        assigneeIds: ["usr-1"],
        time: { allDay: false, startAt: "2026-07-24T14:00:00+05:30", endAt: "2026-07-24T15:00:00+05:30", timezone: "Asia/Kolkata" },
        status: "scheduled",
        isOverdue: false,
        sourceType: "calendar_activity",
        sourceId: "act-sched-1",
      },
      {
        id: "act-deadline-1",
        workspaceId: "ws-kallisto",
        title: "Critical Milestone Approval",
        activityType: "approval",
        visibility: "project",
        ownerId: "usr-1",
        assigneeIds: ["usr-1"],
        time: { allDay: false, startAt: "2026-07-24T16:00:00+05:30", endAt: "2026-07-24T17:00:00+05:30", timezone: "Asia/Kolkata" },
        status: "scheduled",
        isOverdue: false,
        sourceType: "calendar_activity",
        sourceId: "act-deadline-1",
      },
      {
        id: "act-extra-1",
        workspaceId: "ws-kallisto",
        title: "Evening Team Sync",
        activityType: "team_meeting",
        visibility: "project",
        ownerId: "usr-1",
        assigneeIds: ["usr-1"],
        time: { allDay: false, startAt: "2026-07-24T18:00:00+05:30", endAt: "2026-07-24T18:30:00+05:30", timezone: "Asia/Kolkata" },
        status: "scheduled",
        isOverdue: false,
        sourceType: "calendar_activity",
        sourceId: "act-extra-1",
      },
    ];

    render(
      <CalendarTab
        activities={activitiesList}
        projectsList={[{ id: "proj-201", name: "Nila Residence" }]}
      />
    );

    // Visible: Rank 2 (Critical Milestone Approval) & Rank 4 (Scheduled Site Inspection)
    expect(screen.getAllByText("Critical Milestone Approval").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Scheduled Site Inspection").length).toBeGreaterThanOrEqual(1);

    // Hidden in overflow count: +2
    const overflowBadge = screen.getByText("+2");
    expect(overflowBadge).toBeInTheDocument();

    // Clicking +2 opens Day Schedule mode in the right panel
    fireEvent.click(overflowBadge);
    expect(screen.getByText(/DAY SCHEDULE/i)).toBeInTheDocument();
    expect(screen.getByText(/4 activities/i)).toBeInTheDocument();

    // Click card to expand in Home Intelligence style
    const cards = screen.getAllByText("Critical Milestone Approval");
    fireEvent.click(cards[0]);
    expect(screen.getByText("Brandon Russell")).toBeInTheDocument();
  });
});
