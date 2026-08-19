import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProjectDetailWorkspace } from "@/features/projects/project-detail-workspace";
import {
  PROJECT_MODULE_TITLES,
  ProjectModuleSubpage,
} from "@/features/projects/project-module-subpage";

vi.mock("next/image", () => ({
  __esModule: true,
  default: () => null,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), forward: vi.fn() }),
  usePathname: () => (typeof window !== "undefined" && window.location.pathname) || "/projects/proj-001/tasks",
  useSearchParams: () => new URLSearchParams(),
}));

// Drive component uses matchMedia; provide a minimal stub so it doesn't throw.
function stubMatchMedia() {
  window.matchMedia = vi.fn((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

// Apply at module scope so any import-time rendering is covered.
stubMatchMedia();

vi.mock("@/services/repositories/project-service", () => {
  const mockProject = {
    id: "proj-001",
    workspaceId: "ws-default",
    projectCode: "KAL-RES-2026-01",
    name: "Nila Residence",
    clientName: "Rahul Sharma",
    location: "Kochi, Kerala",
    status: "in_progress",
  };
  return {
    projectService: {
      getProjectById: vi.fn().mockResolvedValue(mockProject),
      getProjectByIdSync: vi.fn().mockReturnValue(mockProject),
    },
  };
});

vi.mock("@/services/repositories/project-task.service", () => ({
  projectTaskService: {
    getWorkPackages: vi.fn().mockResolvedValue([]),
    listTasks: vi.fn().mockResolvedValue({
      groups: [],
      totalCount: 0,
      attentionSummary: { overdueCount: 0, blockedCount: 0, dueThisWeekCount: 0 },
    }),
  },
}));

describe("Project title hierarchy and module titles", () => {
  afterEach(cleanup);
  beforeEach(() => {
    window.history.replaceState({}, "", "/projects/proj-001/documents");
    stubMatchMedia();
  });

  it("maps project module keys to their navigation labels", () => {
    expect(PROJECT_MODULE_TITLES.tasks).toBe("Tasks");
    expect(PROJECT_MODULE_TITLES.timeline).toBe("Timeline");
    expect(PROJECT_MODULE_TITLES.gantt).toBe("Gantt Chart");
    expect(PROJECT_MODULE_TITLES.documents).toBe("Docs");
    expect(PROJECT_MODULE_TITLES.boq).toBe("Bill of Quantities");
    expect(PROJECT_MODULE_TITLES.finance).toBe("Finance");
    expect(PROJECT_MODULE_TITLES.site).toBe("Site");
  });

  it("keeps the project name and share action on the overview page", async () => {
    render(<ProjectDetailWorkspace projectId="proj-001" />);
    expect(await screen.findByRole("heading", { name: "Nila Residence", level: 1 })).toBeDefined();
    expect(screen.queryByRole("button", { name: /Share Nila Residence/i })).not.toBeNull();
  });

  it("renders the Tasks subpage title without a project share button", async () => {
    render(<ProjectModuleSubpage projectId="proj-001" module="tasks" />);
    expect(await screen.findByRole("heading", { name: "Tasks", level: 1 })).toBeDefined();
    expect(screen.queryByRole("button", { name: /Share Tasks/i })).toBeNull();
  });

  it("renders the task List and Timeline controls", async () => {
    render(<ProjectModuleSubpage projectId="proj-001" module="tasks" />);
    expect(await screen.findByRole("button", { name: "List" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Timeline" })).toBeDefined();
  });

  it("renders the Docs workspace title and view-only description on Drive", async () => {
    render(<ProjectModuleSubpage projectId="proj-001" module="documents" />);
    expect(await screen.findByRole("heading", { name: "Docs", level: 1 })).toBeDefined();
    // The visually-hidden description now reads the static view-only label.
    expect(
      await screen.findByText("Project files published through updates"),
    ).toBeInTheDocument();
  });

  it.each([
    ["gantt", "Gantt Chart"],
    ["boq", "Bill of Quantities"],
    ["finance", "Finance"],
    ["site", "Site"],
  ] as const)("renders the %s subpage title", async (module, title) => {
    render(<ProjectModuleSubpage projectId="proj-001" module={module} />);
    expect(await screen.findByRole("heading", { name: title, level: 1 })).toBeDefined();
  });

  it("renders shared project navigation tabs on BOQ subpage with project ID and active BOQ chip", async () => {
    window.history.replaceState({}, "", "/projects/proj-001/boq");
    render(<ProjectModuleSubpage projectId="proj-001" module="boq" />);
    
    const nav = await screen.findByRole("navigation", { name: "Document page navigation" });
    const navScope = within(nav);

    const taskLink = navScope.getByRole("link", { name: /Task/i });
    const driveLink = navScope.getByRole("link", { name: /Drive/i });
    const boqLink = navScope.getByRole("link", { name: /BOQ/i });
    const financeLink = navScope.getByRole("link", { name: /Finance/i });
    const siteLink = navScope.getByRole("link", { name: /Site/i });

    expect(taskLink.getAttribute("href")).toBe("/projects/proj-001/tasks");
    expect(driveLink.getAttribute("href")).toBe("/projects/proj-001/documents");
    expect(boqLink.getAttribute("href")).toBe("/projects/proj-001/boq");
    expect(financeLink.getAttribute("href")).toBe("/projects/proj-001/finance");
    expect(siteLink.getAttribute("href")).toBe("/projects/proj-001/site");

    expect(boqLink.className).toContain("is-active");
    expect(taskLink.className).not.toContain("is-active");
  });

  it("renders exactly one navigation bar on Drive page without duplication", async () => {
    window.history.replaceState({}, "", "/projects/proj-001/documents");
    render(<ProjectModuleSubpage projectId="proj-001" module="documents" />);
    
    const navBars = await screen.findAllByRole("navigation", { name: "Document page navigation" });
    expect(navBars).toHaveLength(1);
  });

  it("renders the header search box on subpages with accessible search label", async () => {
    render(<ProjectModuleSubpage projectId="proj-001" module="tasks" />);
    const searchInput = await screen.findByRole("textbox", { name: "Search Tasks" });
    expect(searchInput).toBeInTheDocument();
    expect(searchInput.getAttribute("placeholder")).toBe("Search tasks, assignees or phases");
  });
});
