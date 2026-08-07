import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ProjectSiteWorkspace } from "@/features/projects/site/components/project-site-workspace";
import { createMockSiteDay } from "@/features/projects/site/data/site.mock";
import { Project } from "@/types/domain/project";

const project: Project = {
  id: "proj-001",
  workspaceId: "ws-default",
  clientId: "client-001",
  name: "Nila Residence",
  projectCode: "KAL-2024-001",
  projectType: "Luxury Residential Villa",
  status: "active",
  phase: "Construction",
  ownerId: "user-current",
  ownerName: "Arjun Mehta",
  location: "Trivandrum, Kerala",
  nextRequiredAction: "Review roof slab milestone",
  createdAt: "2025-08-01T00:00:00.000Z",
  updatedAt: "2026-07-27T08:30:00.000Z",
};

afterEach(() => {
  cleanup();
  window.history.replaceState({}, "", "/projects/proj-001?tab=site");
});

describe("ProjectSiteWorkspace", () => {
  it("renders the project-scoped site operations overview", () => {
    render(<ProjectSiteWorkspace project={project} />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Site Operations" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Live field activity and execution records for Nila Residence.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("2 blocked activities")).toBeInTheDocument();
    expect(screen.getByText("1 inspection due today")).toBeInTheDocument();
    expect(screen.getByText("Electrical delivery delayed")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Today on Site" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Open Slab reinforcement details",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Site Status" }),
    ).toBeInTheDocument();
    expect(screen.getByText("28 people on site")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Daily Progress" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Latest Evidence" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Field Registers" }),
    ).toBeInTheDocument();
  });

  it("opens a complete activity inspector and closes it with Escape", () => {
    render(<ProjectSiteWorkspace project={project} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Open Slab reinforcement details",
      }),
    );

    const inspector = screen.getByRole("dialog", {
      name: "Slab reinforcement",
    });
    expect(
      within(inspector).getByText("First-floor slab reinforcement"),
    ).toBeInTheDocument();
    expect(
      within(inspector).getByText("Fe500 reinforcement steel"),
    ).toBeInTheDocument();
    expect(
      within(inspector).getByRole("heading", { name: "Dependencies" }),
    ).toBeInTheDocument();
    expect(
      within(inspector).getByRole("heading", { name: "Comments" }),
    ).toBeInTheDocument();
    expect(
      within(inspector).getByRole("heading", { name: "Audit history" }),
    ).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(
      screen.queryByRole("dialog", { name: "Slab reinforcement" }),
    ).not.toBeInTheDocument();
  });

  it("supports keyboard navigation across structured site subviews", () => {
    render(<ProjectSiteWorkspace project={project} />);

    const overviewTab = screen.getByRole("tab", { name: "Overview" });
    overviewTab.focus();
    fireEvent.keyDown(overviewTab, { key: "ArrowRight" });

    expect(screen.getByRole("tab", { name: "Daily Logs" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      screen.getByRole("heading", {
        name: "Today’s daily log has not been submitted",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "Create Daily Log" }),
    ).toHaveLength(2);
    expect(screen.getByText("29°C")).toBeInTheDocument();
    expect(window.location.search).toContain("siteView=daily-logs");

    fireEvent.click(screen.getByRole("tab", { name: "Inspections" }));
    expect(
      screen.getByRole("heading", { name: "Inspection Register" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Schedule Inspection" }),
    ).toBeInTheDocument();
    const inspectionTable = screen.getByRole("table", {
      name: "Project site inspections",
    });
    expect(
      within(inspectionTable).getByText("Formwork inspection"),
    ).toBeInTheDocument();
    expect(
      within(inspectionTable).getByText("Reinforcement inspection"),
    ).toBeInTheDocument();
  });

  it("switches the field register from issues to deliveries", () => {
    render(<ProjectSiteWorkspace project={project} />);

    expect(screen.getByText("Sleeve opening missing")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: /Deliveries/ }));

    const deliveriesTable = screen.getByRole("table", {
      name: "Site deliveries",
    });
    expect(within(deliveriesTable).getByText("TMT steel")).toBeInTheDocument();
    expect(
      within(deliveriesTable).getByText("Electrical conduits"),
    ).toBeInTheDocument();
    expect(
      within(deliveriesTable).getByText("Formwork plywood"),
    ).toBeInTheDocument();
    expect(
      within(deliveriesTable).getByText("Partially received"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Sleeve opening missing"),
    ).not.toBeInTheDocument();
  });

  it("shows a contextual primary action and routes overflow actions", () => {
    render(<ProjectSiteWorkspace project={project} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Log Site Update" }),
    );
    expect(
      screen.getByRole("status"),
    ).toHaveTextContent(
      "Site update logging opened for Nila Residence in mock mode.",
    );

    fireEvent.click(
      screen.getByRole("button", { name: "More site actions" }),
    );
    fireEvent.click(
      screen.getByRole("menuitem", { name: "Open Attendance Register" }),
    );

    expect(screen.getByRole("tab", { name: "Attendance" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      screen.getByRole("button", { name: "Open Attendance Register" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Attendance Register" }),
    ).toBeInTheDocument();
    expect(screen.getByText("RCC crew")).toBeInTheDocument();
    expect(screen.getAllByText("Rajesh K.")).toHaveLength(2);
    expect(screen.getAllByText("Faisal M.")).toHaveLength(2);
  });

  it("renders the issue register with operational filters and records", () => {
    render(<ProjectSiteWorkspace project={project} initialView="issues" />);

    expect(
      screen.getByRole("button", { name: "Report Issue" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Issue Register" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Issue severity")).toBeInTheDocument();
    expect(screen.getByLabelText("Issue owner")).toBeInTheDocument();

    const issuesTable = screen.getByRole("table", {
      name: "Project site issues",
    });
    expect(
      within(issuesTable).getByText("Sleeve opening missing"),
    ).toBeInTheDocument();
    expect(
      within(issuesTable).getByText("Electrical conduits delayed"),
    ).toBeInTheDocument();
  });

  it("restores the active site view from the URL and popstate", () => {
    window.history.replaceState(
      {},
      "",
      "/projects/proj-001?tab=site&siteView=issues",
    );
    render(<ProjectSiteWorkspace project={project} />);

    expect(screen.getByRole("tab", { name: "Issues" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    fireEvent.click(screen.getByRole("tab", { name: "Attendance" }));
    expect(window.location.search).toBe("?tab=site&siteView=attendance");

    window.history.replaceState(
      {},
      "",
      "/projects/proj-001?tab=site&siteView=issues",
    );
    fireEvent(window, new PopStateEvent("popstate"));

    expect(screen.getByRole("tab", { name: "Issues" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      screen.getByRole("heading", { name: "Issue Register" }),
    ).toBeInTheDocument();
  });

  it("uses bounded contextual empty states when registers have no records", () => {
    const emptySiteDay = createMockSiteDay(project.id, project.name);
    emptySiteDay.inspections = [];
    emptySiteDay.issues = [];
    emptySiteDay.attendanceWorkers = [];

    const { rerender } = render(
      <ProjectSiteWorkspace
        project={project}
        data={emptySiteDay}
        initialView="inspections"
      />,
    );
    expect(
      screen.getByRole("heading", { name: "No inspections have been created" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "Schedule Inspection" }),
    ).toHaveLength(2);

    rerender(
      <ProjectSiteWorkspace
        project={project}
        data={emptySiteDay}
        initialView="attendance"
      />,
    );
    fireEvent.click(screen.getByRole("tab", { name: "Attendance" }));
    expect(
      screen.getByRole("heading", {
        name: "Attendance register has not been opened for today",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Expected workforce: 32 workers · 4 crews · 3 supervisors",
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Issues" }));
    expect(
      screen.getByRole("heading", { name: "No site issues reported" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "Report Issue" }),
    ).toHaveLength(2);
  });

  it("renders loading, error, permission, and empty-data states", () => {
    const { rerender } = render(
      <ProjectSiteWorkspace project={project} displayState="loading" />,
    );
    expect(
      screen.getByLabelText("Loading site operations"),
    ).toHaveAttribute("aria-busy", "true");

    rerender(<ProjectSiteWorkspace project={project} displayState="error" />);
    expect(
      screen.getByRole("heading", {
        name: "Site records could not be loaded",
      }),
    ).toBeInTheDocument();

    rerender(
      <ProjectSiteWorkspace
        project={project}
        displayState="permission_denied"
      />,
    );
    expect(
      screen.getByRole("heading", { name: "Site access restricted" }),
    ).toBeInTheDocument();

    rerender(<ProjectSiteWorkspace project={project} data={null} />);
    expect(
      screen.getByRole("heading", { name: "No site day is available" }),
    ).toBeInTheDocument();
  });
});
