import React from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { AddActivityModal } from "@/features/calendar/components/modals/add-activity-modal";
import { CalendarTab } from "@/features/calendar/components/calendar-tab/calendar-tab";
import { MOCK_PROJECTS } from "@/features/calendar/data/mock-calendar-data";

afterEach(cleanup);

describe("Calendar Add Task & Activity Workflow", () => {
  it("renders AddActivityModal with project selection, team member, comment, and wanted checklist", async () => {
    const onSubmit = vi.fn().mockResolvedValue({});
    const onClose = vi.fn();

    render(
      <AddActivityModal
        initialCreationType="add_task"
        initialDate="2026-07-24"
        projectsList={MOCK_PROJECTS}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    );

    // Header & Tabs
    expect(screen.getByRole("heading", { name: "Add Project Task" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Task" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Schedule Event" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Milestone" })).toBeInTheDocument();

    // Required fields: Title, Project Name, Team Member, Date
    expect(screen.getByPlaceholderText(/e\.g\. Review revised structural drawings/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Project Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Assign Team Member/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Comments & Notes/i)).toBeInTheDocument();
    expect(screen.getByText(/Wanted Things \/ Checklist Items/i)).toBeInTheDocument();

    // Fill Title
    const titleInput = screen.getByPlaceholderText(/e\.g\. Review revised structural drawings/i);
    fireEvent.change(titleInput, { target: { value: "Verify Site Excavation & Setback Markers" } });

    // Select Project (e.g. Nila Residence or Greenfield Luxury Villa)
    const projectSelect = screen.getByLabelText(/Project Name/i);
    fireEvent.change(projectSelect, { target: { value: "proj-102" } });

    // Select Team Member (e.g. Rithvik Menon)
    const teamMemberSelect = screen.getByLabelText(/Assign Team Member/i);
    fireEvent.change(teamMemberSelect, { target: { value: "usr-2" } });
    expect(screen.getAllByText(/Rithvik Menon/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Site Coordinator/i).length).toBeGreaterThanOrEqual(1);

    // Add Comment
    const commentTextarea = screen.getByPlaceholderText(/Add instructions, context, project comments/i);
    fireEvent.change(commentTextarea, {
      target: { value: "Coordinate with excavation contractor before pouring concrete foundation." },
    });

    // Add Wanted Things / Checklist items
    const wantedInput = screen.getByPlaceholderText(/Check structural steel test report/i);
    const addWantedBtn = screen.getByRole("button", { name: "Add wanted item" });

    fireEvent.change(wantedInput, { target: { value: "Survey setback distances from boundary" } });
    fireEvent.click(addWantedBtn);

    fireEvent.change(wantedInput, { target: { value: "Verify excavation depth matches drawing rev 3" } });
    fireEvent.click(addWantedBtn);

    expect(screen.getByText("Survey setback distances from boundary")).toBeInTheDocument();
    expect(screen.getByText("Verify excavation depth matches drawing rev 3")).toBeInTheDocument();
    expect(screen.getByText(/Wanted Things \/ Checklist Items \(2\)/i)).toBeInTheDocument();

    // Submit Form
    const submitBtn = screen.getByRole("button", { name: "Save Task" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    const [activityPayload, schedulePayload] = onSubmit.mock.calls[0];

    // Verify activity payload
    expect(activityPayload.title).toBe("Verify Site Excavation & Setback Markers");
    expect(activityPayload.projectId).toBe("proj-102");
    expect(activityPayload.ownerId).toBe("usr-2");
    expect(activityPayload.assigneeIds).toEqual(["usr-2"]);
    expect(activityPayload.activityType).toBe("task");
    expect(activityPayload.time.allDay).toBe(true);
    expect(activityPayload.time.startDate).toBe("2026-07-24");
    expect(activityPayload.time.endDateExclusive).toBe("2026-07-25");

    // Verify formatted notes containing comments and wanted items
    expect(activityPayload.notes).toContain("Coordinate with excavation contractor before pouring concrete foundation.");
    expect(activityPayload.notes).toContain("Wanted items / Checklist:");
    expect(activityPayload.notes).toContain("• Survey setback distances from boundary");
    expect(activityPayload.notes).toContain("• Verify excavation depth matches drawing rev 3");

    // Verify schedule payload
    expect(schedulePayload.projectId).toBe("proj-102");
    expect(schedulePayload.itemType).toBe("task");
    expect(schedulePayload.assigneeId).toBe("usr-2");

    expect(onClose).toHaveBeenCalled();
  });

  it("handles validation when title is missing", async () => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();

    render(
      <AddActivityModal
        initialCreationType="add_task"
        initialDate="2026-07-24"
        projectsList={MOCK_PROJECTS}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    );

    const submitBtn = screen.getByRole("button", { name: "Save Task" });
    fireEvent.click(submitBtn);

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/Please enter a title for the task/i)).toBeInTheDocument();
  });

  it("triggers onAddActivity from CalendarTab header and Day Schedule panel", () => {
    const onAddActivity = vi.fn();

    render(
      <CalendarTab
        activities={[]}
        projectsList={MOCK_PROJECTS}
        queryState={{
          tab: "calendar",
          view: "month",
          date: "2026-07-24",
          scope: "mine",
          project: null,
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
        onAddActivity={onAddActivity}
      />
    );

    // Header Add Task button
    const headerAddBtn = screen.getByRole("button", { name: "Add Task" });
    expect(headerAddBtn).toBeInTheDocument();
    fireEvent.click(headerAddBtn);
    expect(onAddActivity).toHaveBeenCalledWith("2026-07-24");

    // Empty state Add Task button in Day Schedule
    const emptyStateAddBtn = screen.getByRole("button", { name: /Create Task for 2026-07-24/i });
    expect(emptyStateAddBtn).toBeInTheDocument();
    fireEvent.click(emptyStateAddBtn);
    expect(onAddActivity).toHaveBeenCalledWith("2026-07-24");
  });
});
