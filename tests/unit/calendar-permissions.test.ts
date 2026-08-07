import { describe, it, expect } from "vitest";
import { CalendarPermissionsService } from "@/features/calendar/services/calendar-permissions.service";
import type { CalendarActivity } from "@/types/domain/calendar";

describe("CalendarPermissionsService", () => {
  const sampleActivities: CalendarActivity[] = [
    {
      id: "act-pub",
      workspaceId: "ws-1",
      title: "Public Team Meeting",
      activityType: "team_meeting",
      visibility: "workspace",
      ownerId: "usr-1",
      assigneeIds: ["usr-1"],
      time: {
        allDay: false,
        startAt: "2026-07-21T10:00:00+05:30",
        endAt: "2026-07-21T11:00:00+05:30",
        timezone: "Asia/Kolkata",
      },
      sourceType: "calendar_activity",
      sourceId: "act-pub",
      status: "scheduled",
    },
    {
      id: "act-priv",
      workspaceId: "ws-1",
      title: "Private Strategy Notes",
      activityType: "team_meeting",
      visibility: "private",
      ownerId: "usr-2",
      assigneeIds: ["usr-2"],
      time: {
        allDay: false,
        startAt: "2026-07-21T14:00:00+05:30",
        endAt: "2026-07-21T15:00:00+05:30",
        timezone: "Asia/Kolkata",
      },
      notes: "Secret strategy",
      location: "Private Room",
      sourceType: "calendar_activity",
      sourceId: "act-priv",
      status: "scheduled",
    },
    {
      id: "act-proj",
      workspaceId: "ws-1",
      title: "Project Site Walk",
      activityType: "site_visit",
      visibility: "project",
      ownerId: "usr-1",
      assigneeIds: ["usr-1"],
      time: {
        allDay: true,
        startDate: "2026-07-22",
        endDateExclusive: "2026-07-22",
        timezone: "Asia/Kolkata",
      },
      projectId: "proj-101",
      sourceType: "calendar_activity",
      sourceId: "act-proj",
      status: "scheduled",
    },
  ];

  it("masks private events for unauthorized viewers to display Busy", () => {
    const userCtx = {
      userId: "usr-1", // Not owner of act-priv (usr-2)
      userRole: "provider_member",
      projectMemberships: ["proj-101"],
    };

    const result = CalendarPermissionsService.applyPermissionsAndMasking(sampleActivities, userCtx);

    const privEvent = result.find((a) => a.id === "act-priv");
    expect(privEvent).toBeDefined();
    expect(privEvent?.title).toBe("Busy");
    expect(privEvent?.notes).toBeUndefined();
    expect(privEvent?.location).toBeUndefined();
  });

  it("hides project-visible events if user is not in project members", () => {
    const userCtx = {
      userId: "usr-1",
      userRole: "provider_member",
      projectMemberships: [], // Not member of proj-101
    };

    const result = CalendarPermissionsService.applyPermissionsAndMasking(sampleActivities, userCtx);

    const projEvent = result.find((a) => a.id === "act-proj");
    expect(projEvent).toBeUndefined();
  });
});
