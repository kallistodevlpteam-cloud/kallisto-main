import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ProjectsAttentionStrip } from "@/features/projects/components/projects-attention-strip";
import { ProjectsEmptyState } from "@/features/projects/components/projects-empty-state";
import { ProjectsPageHeader } from "@/features/projects/components/projects-page-header";
import { ProjectStatusTabs } from "@/features/projects/components/project-status-tabs";
import { ProjectTableRow } from "@/features/projects/components/project-table-row";
import { ProjectsTable } from "@/features/projects/components/projects-table";
import { ProjectListItem } from "@/features/projects/types/project.types";

afterEach(cleanup);

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("Projects Operational Workspace — UI Components, Layout & Governance", () => {
  it("renders ProjectsPageHeader with title and description", () => {
    render(
      <ProjectsPageHeader canImport={true} onOpenImportDrawer={vi.fn()} />
    );

    expect(screen.getByRole("heading", { level: 1, name: "Projects" })).toBeDefined();
    expect(screen.getByText(/Manage active, upcoming, on hold and completed work/i)).toBeDefined();
  });

  it("renders ProjectStatusTabs with active state and count badges", () => {
    const counts = { active: 8, upcoming: 3, onHold: 2, completed: 14, all: 27 };

    render(
      <ProjectStatusTabs
        currentStatus="ACTIVE"
        counts={counts}
        onSelectTab={vi.fn()}
      />
    );

    expect(screen.getByText("Active")).toBeDefined();
    expect(screen.getByText("8")).toBeDefined();
    expect(screen.getByText("Upcoming")).toBeDefined();
    expect(screen.getByText("3")).toBeDefined();
    expect(screen.getByText("On hold")).toBeDefined();
    expect(screen.getByText("2")).toBeDefined();
    expect(screen.getByText("Completed")).toBeDefined();
    expect(screen.getByText("14")).toBeDefined();
  });

  it("renders ProjectsAttentionStrip when actionable conditions exist", () => {
    const onFilter = vi.fn();
    const counts = { overdueActions: 2, blockedProjects: 1, pendingClientDecisions: 3 };

    render(
      <ProjectsAttentionStrip
        counts={counts}
        onApplyAttentionFilter={onFilter}
      />
    );

    expect(screen.getByText("Needs attention")).toBeDefined();
    expect(screen.getByText("2 overdue actions")).toBeDefined();
    expect(screen.getByText("1 blocked project")).toBeDefined();
    expect(screen.getByText("3 client decisions pending")).toBeDefined();
  });

  it("renders COMPLETED project with nextAction = null safely without errors", () => {
    const completedItem: ProjectListItem = {
      id: "proj-6",
      name: "Oakridge Estate",
      code: "PRJ-ORE-06",
      type: "Villa",
      clientId: "cli-101",
      clientDisplayName: "Anoop Menon",
      phase: "Handover",
      phaseProgress: "Handover certified",
      nextAction: null,
      owner: { id: "u-1", name: "Arjun", initials: "AR" },
      status: "COMPLETED",
      health: "ON_TRACK",
      updatedAt: "2026-04-30T16:00:00.000Z",
      allowedActions: ["open", "reopen"],
    };

    const { container } = render(<ProjectsTable projects={[completedItem]} />);
    expect(container.firstChild).toBeNull();
  });
  it("ensures phase progress renders strictly under Current Phase column and not in Project & Client cell", () => {
    const sampleItem: ProjectListItem = {
      id: "proj-1",
      name: "Residence 24",
      code: "PRJ-RES-24",
      type: "Villa",
      clientId: "cli-101",
      clientDisplayName: "Nisha Menon",
      phase: "Concept",
      phaseProgress: "3 of 6 deliverables approved",
      nextAction: null,
      owner: { id: "u-1", name: "Arjun", initials: "AR" },
      status: "ACTIVE",
      health: "ON_TRACK",
      updatedAt: "2026-07-18T10:00:00.000Z",
      allowedActions: ["open"],
    };

    const { container } = render(<ProjectTableRow project={sampleItem} />);

    // Inspect project cell
    const projectCell = container.querySelector("[class*='colProject']");
    expect(projectCell?.textContent).toContain("Residence 24");
    expect(projectCell?.textContent).toContain("Nisha Menon · PRJ-RES-24");
    expect(projectCell?.textContent).not.toContain("3 of 6 deliverables approved");

    // Inspect phase cell
    const phaseCell = container.querySelector("[class*='colPhase']");
    expect(phaseCell?.textContent).toContain("Concept");
    expect(phaseCell?.textContent).toContain("3 of 6 deliverables approved");
  });
  it("renders empty state when no projects match filters", () => {
    render(
      <ProjectsEmptyState
        type="empty_filtered"
        onClearFilters={vi.fn()}
      />
    );

    expect(screen.getByText("No projects match these filters")).toBeDefined();
    expect(screen.getByText("Clear filters")).toBeDefined();
  });
});
