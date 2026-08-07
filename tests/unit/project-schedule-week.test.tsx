import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProjectScheduleWorkspace } from "@/features/projects/components/schedule/project-schedule-workspace";
import { WeekCalendar } from "@/features/projects/components/schedule/week-calendar";

afterEach(cleanup);

describe("Project Schedule Week view", () => {
  it("renders the correct Monday-to-Sunday headers for 24 July 2026", () => {
    render(
      <ProjectScheduleWorkspace
        projectId="project-1"
        projectName="Nila Residence"
      />
    );

    expect(screen.getByText("20–26 July 2026")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mon20 Jul" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tue21 Jul" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Wed22 Jul" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Thu23 Jul" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fri24 Jul" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sat25 Jul" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sun26 Jul" })).toBeInTheDocument();
  });

  it("navigates to the previous and next week", () => {
    render(
      <ProjectScheduleWorkspace
        projectId="project-1"
        projectName="Nila Residence"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /next (period|week)/i }));
    expect(screen.getByText("27 Jul–2 Aug 2026")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /previous (period|week)/i }));
    expect(screen.getByText("20–26 July 2026")).toBeInTheDocument();
  });

  it("positions timed and multi-day activities from temporal data", () => {
    render(
      <ProjectScheduleWorkspace
        projectId="project-1"
        projectName="Nila Residence"
      />
    );

    const timedActivity = screen.getByRole("button", {
      name: /revised electrical layout review/i,
    });
    expect(timedActivity).toHaveStyle({ top: "96px", height: "192px" });
    expect(timedActivity.getAttribute("style")).toContain(
      "width: calc(33.3333% - 6px)"
    );

    const multiDayActivity = screen.getByRole("button", {
      name: /foundation excavation and PCC footing/i,
    });
    expect(multiDayActivity).toHaveStyle({
      gridColumn: "2 / 5",
      gridRow: "1",
    });

    expect(
      screen.getByRole("button", {
        name: /hvac and electrical drawing dispatch/i,
      })
    ).toHaveStyle({ gridRow: "1" });
    expect(
      screen.getByRole("button", {
        name: /structural load calculation sign-off/i,
      })
    ).toHaveStyle({ gridRow: "2" });
  });

  it("opens and closes the inspector from an existing activity", () => {
    render(
      <ProjectScheduleWorkspace
        projectId="project-1"
        projectName="Nila Residence"
      />
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /revised electrical layout review/i,
      })
    );
    expect(
      screen.getByRole("heading", { name: "Activity details" })
    ).toBeInTheDocument();
    expect(screen.getByText("Drawing_REV2_Electrical.pdf")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Close schedule inspector" })
    );
    expect(
      screen.queryByRole("heading", { name: "Activity details" })
    ).not.toBeInTheDocument();
  });

  it("shows the current-time indicator only in today's visible day and range", () => {
    const props = {
      selectedDate: "2026-07-27",
      activities: [],
      selectedActivityId: null,
      onSelectDate: vi.fn(),
      onSelectActivity: vi.fn(),
      onCreateSlot: vi.fn(),
      now: new Date("2026-07-27T04:00:00.000Z"),
    };
    const { rerender } = render(
      <WeekCalendar
        {...props}
        visibleDates={[
          "2026-07-27",
          "2026-07-28",
          "2026-07-29",
          "2026-07-30",
          "2026-07-31",
          "2026-08-01",
          "2026-08-02",
        ]}
      />
    );

    expect(screen.getByTestId("current-time-indicator")).toHaveStyle({
      top: "144px",
    });

    rerender(
      <WeekCalendar
        {...props}
        visibleDates={[
          "2026-07-20",
          "2026-07-21",
          "2026-07-22",
          "2026-07-23",
          "2026-07-24",
          "2026-07-25",
          "2026-07-26",
        ]}
      />
    );
    expect(screen.queryByTestId("current-time-indicator")).not.toBeInTheDocument();
  });

  it("applies filter combinations to both timed and all-day activities", () => {
    render(
      <ProjectScheduleWorkspace
        projectId="project-1"
        projectName="Nila Residence"
      />
    );

    const sidebar = screen.getByRole("complementary", {
      name: "Schedule filters",
    });
    fireEvent.click(within(sidebar).getByLabelText("Structure"));

    expect(
      screen.queryByRole("button", { name: /roof slab casting/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: /foundation excavation and PCC footing/i,
      })
    ).not.toBeInTheDocument();
  });
});
