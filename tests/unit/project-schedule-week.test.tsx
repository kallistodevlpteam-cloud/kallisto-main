import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectScheduleWorkspace } from "@/features/projects/components/schedule/project-schedule-workspace";
import { WeekCalendar } from "@/features/projects/components/schedule/week-calendar";

beforeEach(() => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

afterEach(cleanup);

describe("Project Schedule Week view", () => {
  it("renders the correct Monday-to-Sunday headers for 24 July 2026", () => {
    render(
      <ProjectScheduleWorkspace
        projectId="project-1"
        projectName="Nila Residence"
      />
    );

    expect(screen.getByRole("button", { name: /Mon 20 Jul/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Tue 21 Jul/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Wed 22 Jul/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Thu 23 Jul/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Fri 24 Jul/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sat 25 Jul/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sun 26 Jul/i })).toBeInTheDocument();
  }, 15000);

  it("navigates to different dates from the calendar", () => {
    render(
      <ProjectScheduleWorkspace
        projectId="project-1"
        projectName="Nila Residence"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "2026-07-27" }));
    expect(screen.getByRole("button", { name: /Mon 27 Jul/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "2026-07-20" }));
    expect(screen.getByRole("button", { name: /Mon 20 Jul/i })).toBeInTheDocument();
  }, 15000);

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
    expect(timedActivity.parentElement).toHaveStyle({ top: "864px", height: "192px" });
    expect(timedActivity.parentElement?.getAttribute("style")).toContain(
      "width: calc(33.3333% - 6px)"
    );

    const multiDayActivity = screen.getByRole("button", {
      name: /foundation excavation and PCC footing/i,
    });
    expect(multiDayActivity.parentElement).toHaveStyle({
      gridColumn: "2 / 5",
      gridRow: "1",
    });

    expect(
      screen.getByRole("button", {
        name: /hvac and electrical drawing dispatch/i,
      }).parentElement
    ).toHaveStyle({ gridRow: "1" });
    expect(
      screen.getByRole("button", {
        name: /structural load calculation sign-off/i,
      }).parentElement
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
    expect(screen.getAllByText("Drawing_REV2_Electrical.pdf")[0]).toBeInTheDocument();

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
      top: "912px",
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

    fireEvent.click(screen.getByRole("button", { name: /^Filters/i }));
    fireEvent.click(screen.getByRole("button", { name: "Structure" }));

    expect(
      screen.queryByRole("button", { name: /roof slab casting/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: /foundation excavation and PCC footing/i,
      })
    ).not.toBeInTheDocument();
  }, 15000);
});
