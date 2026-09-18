import React from "react";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { CalendarTab } from "@/features/calendar/components/calendar-tab/calendar-tab";
import type { PresentableActivity } from "@/features/calendar/services/calendar-activity.service";

const sampleActivities: PresentableActivity[] = [
  {
    id: "act-1",
    workspaceId: "ws-kallisto",
    title: "Client Site Walkthrough & Scope Review",
    activityType: "site_visit",
    visibility: "project",
    ownerId: "usr-1",
    assigneeIds: ["usr-1", "usr-2"],
    time: {
      allDay: false,
      startAt: "2026-07-21T10:00:00+05:30",
      endAt: "2026-07-21T11:30:00+05:30",
      timezone: "Asia/Kolkata",
    },
    projectId: "proj-101",
    location: "Thiruvananthapuram Site B",
    notes: "Review foundation depth and client modifications.",
    sourceType: "calendar_activity",
    sourceId: "act-1",
    status: "completed",
    isOverdue: false,
  },
  {
    id: "act-2",
    workspaceId: "ws-kallisto",
    title: "Review revised floor plan",
    activityType: "drawing_delivery",
    visibility: "project",
    ownerId: "usr-1",
    assigneeIds: ["usr-1"],
    time: {
      allDay: false,
      startAt: "2026-07-24T09:00:00+05:30",
      endAt: "2026-07-24T09:45:00+05:30",
      timezone: "Asia/Kolkata",
    },
    projectId: "proj-201",
    notes: "Verify circulation and bedroom dimensions.",
    sourceType: "calendar_activity",
    sourceId: "act-2",
    status: "completed",
    isOverdue: false,
  },
  {
    id: "act-3",
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
    notes: "Review the revised spatial plan.",
    sourceType: "calendar_activity",
    sourceId: "act-3",
    status: "scheduled",
    isOverdue: false,
  },
  {
    id: "act-4",
    workspaceId: "ws-kallisto",
    title: "Contractor coordination call",
    activityType: "team_meeting",
    visibility: "project",
    ownerId: "usr-1",
    assigneeIds: ["usr-1"],
    time: {
      allDay: false,
      startAt: "2026-07-24T17:30:00+05:30",
      endAt: "2026-07-24T18:00:00+05:30",
      timezone: "Asia/Kolkata",
    },
    projectId: "proj-204",
    location: "Video call",
    notes: "Coordination with Palm House team.",
    sourceType: "calendar_activity",
    sourceId: "act-4",
    status: "scheduled",
    isOverdue: false,
  },
];

const mockProjects = [
  { id: "proj-101", name: "Skyline Apartments — Site B", code: "KAL-2026-001", phase: "Construction" },
  { id: "proj-201", name: "Nila Residence", code: "KAL-2026-021", phase: "Design Development" },
  { id: "proj-204", name: "Palm House", code: "KAL-2026-024", phase: "Construction" },
];

afterEach(cleanup);

describe("Calendar Project Filter and Project Activities View", () => {
  it("renders the Project Filter trigger with 'All Projects' initially and opens dropdown on click", () => {
    render(
      <CalendarTab
        activities={sampleActivities}
        projectsList={mockProjects}
      />
    );

    // Filter trigger button exists with All Projects
    const filterBtn = screen.getByRole("button", { name: /Filter by project/i });
    expect(filterBtn).toBeInTheDocument();
    expect(filterBtn).toHaveTextContent("All Projects");

    // Open dropdown
    fireEvent.click(filterBtn);

    // Dropdown contains search input, All Projects option, and project options with counts
    const listbox = screen.getByRole("listbox");
    expect(screen.getByPlaceholderText("Search projects...")).toBeInTheDocument();
    expect(within(listbox).getByText("View all workspace activities")).toBeInTheDocument();
    expect(within(listbox).getByText("Nila Residence")).toBeInTheDocument();
    expect(within(listbox).getByText("Skyline Apartments — Site B")).toBeInTheDocument();
    expect(within(listbox).getByText("Palm House")).toBeInTheDocument();
    expect(within(listbox).getByText("2 acts")).toBeInTheDocument(); // Nila Residence has 2 activities
  });

  it("filters project list when typing in project search input", () => {
    render(
      <CalendarTab
        activities={sampleActivities}
        projectsList={mockProjects}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Filter by project/i }));

    const searchInput = screen.getByPlaceholderText("Search projects...");
    fireEvent.change(searchInput, { target: { value: "Nila" } });

    const listbox = screen.getByRole("listbox");
    expect(within(listbox).getByText("Nila Residence")).toBeInTheDocument();
    expect(within(listbox).queryByText("Skyline Apartments — Site B")).not.toBeInTheDocument();
  });

  it("filters calendar matrix and Day Schedule when selecting a project", () => {
    const onUpdateQuery = vi.fn();

    const { rerender } = render(
      <CalendarTab
        activities={sampleActivities}
        projectsList={mockProjects}
        onUpdateQuery={onUpdateQuery}
      />
    );

    // Open dropdown and select Nila Residence
    fireEvent.click(screen.getByRole("button", { name: /Filter by project/i }));
    const listbox = screen.getByRole("listbox");
    fireEvent.click(within(listbox).getByText("Nila Residence"));

    expect(onUpdateQuery).toHaveBeenCalledWith({ project: "proj-201" });

    // Rerender with queryState.project = "proj-201"
    rerender(
      <CalendarTab
        queryState={{
          tab: "calendar",
          view: "month",
          date: "2026-07-24",
          scope: "mine",
          project: "proj-201",
          assignee: null,
          activityType: null,
          status: null,
          visibility: null,
          includeCompleted: true,
          category: "all",
          zoom: "month",
          ganttRange: null,
          selected: null,
        }}
        activities={sampleActivities}
        projectsList={mockProjects}
        onUpdateQuery={onUpdateQuery}
      />
    );

    // Active project filter banner is displayed
    expect(screen.getByText(/Filtered by project:/i)).toBeInTheDocument();
    expect(screen.getAllByText("Nila Residence").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("link", { name: /Open Project Workspace/i })).toHaveAttribute(
      "href",
      "/projects/proj-201?tab=activity"
    );

    // Nila Residence activities are displayed
    expect(screen.getAllByText("Review revised floor plan").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Client design review").length).toBeGreaterThanOrEqual(1);

    // Palm House activity is hidden from grid & Day Schedule
    expect(screen.queryByText("Contractor coordination call")).not.toBeInTheDocument();
    // Skyline Apartments activity is hidden
    expect(screen.queryByText("Client Site Walkthrough & Scope Review")).not.toBeInTheDocument();
  });

  it("supports toggling to All Project Activities view in the right panel", () => {
    render(
      <CalendarTab
        queryState={{
          tab: "calendar",
          view: "month",
          date: "2026-07-24",
          scope: "mine",
          project: "proj-201",
          assignee: null,
          activityType: null,
          status: null,
          visibility: null,
          includeCompleted: true,
          category: "all",
          zoom: "month",
          ganttRange: null,
          selected: null,
        }}
        activities={sampleActivities}
        projectsList={mockProjects}
      />
    );

    // Toggle button exists
    const allProjTab = screen.getByRole("tab", { name: /All Project Activities/i });
    expect(allProjTab).toBeInTheDocument();

    // Click to view All Project Activities timeline
    fireEvent.click(allProjTab);

    expect(screen.getByText(/All scheduled activities for/i)).toBeInTheDocument();
    expect(screen.getByText("Open Project Workspace (Activity Tab)")).toBeInTheDocument();
  });

  it("clears project filter when clicking Clear filter", () => {
    const onUpdateQuery = vi.fn();

    render(
      <CalendarTab
        queryState={{
          tab: "calendar",
          view: "month",
          date: "2026-07-24",
          scope: "mine",
          project: "proj-201",
          assignee: null,
          activityType: null,
          status: null,
          visibility: null,
          includeCompleted: true,
          category: "all",
          zoom: "month",
          ganttRange: null,
          selected: null,
        }}
        activities={sampleActivities}
        projectsList={mockProjects}
        onUpdateQuery={onUpdateQuery}
      />
    );

    const clearBtn = screen.getByRole("button", { name: "Clear filter" });
    fireEvent.click(clearBtn);

    expect(onUpdateQuery).toHaveBeenCalledWith({ project: null });
  });
});
