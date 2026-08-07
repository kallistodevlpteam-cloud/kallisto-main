import { describe, expect, it } from "vitest";
import { filterScheduleActivities } from "@/features/projects/components/schedule/schedule-activity-filter";
import { ScheduleActivityItem } from "@/features/projects/components/schedule/schedule-types";

const activities: ScheduleActivityItem[] = [
  {
    id: "a",
    projectId: "project-1",
    title: "Roof slab casting",
    type: "Milestone",
    phase: "Construction",
    workstream: "Structure",
    startDate: "2026-07-24",
    endDate: "2026-07-24",
    allDay: false,
    startTime: "11:00",
    endTime: "15:00",
    owner: "Arjun Mehta",
    ownerInitials: "AM",
    status: "Scheduled",
  },
  {
    id: "b",
    projectId: "project-1",
    title: "Drawing approval",
    type: "Approval",
    phase: "Design",
    workstream: "Client approvals",
    startDate: "2026-07-22",
    endDate: "2026-07-22",
    allDay: true,
    owner: "Anoop Kumar",
    ownerInitials: "AK",
    status: "Completed",
  },
];

describe("schedule activity filtering", () => {
  it("combines phase, workstream, team, status, and search filters", () => {
    expect(
      filterScheduleActivities(activities, {
        phases: ["Construction"],
        workstreams: ["Structure"],
        team: ["Arjun Mehta"],
        statuses: ["Scheduled"],
        search: "slab",
      }).map((activity) => activity.id)
    ).toEqual(["a"]);
  });

  it("supports an unrestricted empty selection", () => {
    expect(
      filterScheduleActivities(activities, {
        phases: [],
        workstreams: [],
        team: [],
        statuses: [],
        search: "",
      })
    ).toHaveLength(2);
  });
});
