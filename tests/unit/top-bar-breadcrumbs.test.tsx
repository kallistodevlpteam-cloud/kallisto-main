import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React from "react";
import { render, screen, cleanup, within } from "@testing-library/react";
import { resolveProjectName, TopBar } from "@/components/layout/top-bar";
import { DeveloperConsoleHook } from "@/developer-console/hooks/useDeveloperConsole";

// Mock next/navigation
const mockPathname = vi.fn(() => "/projects/proj-001");
const mockSearchParams = vi.fn(() => new URLSearchParams());
const mockRouter = {
  back: vi.fn(),
  forward: vi.fn(),
  push: vi.fn(),
  replace: vi.fn(),
};

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
  useSearchParams: () => mockSearchParams(),
  useRouter: () => mockRouter,
}));

const dummyConsoleState = {
  activeUser: { role: "provider" },
  activeEnvironment: "production",
} as unknown as DeveloperConsoleHook;

describe("resolveProjectName helper", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("resolves standard and backend variations of Nila Residence", () => {
    expect(resolveProjectName("proj-001")).toBe("Nila Residence");
    expect(resolveProjectName("prj-1")).toBe("Nila Residence");
    expect(resolveProjectName("1")).toBe("Nila Residence");
    expect(resolveProjectName("proj-1")).toBe("Nila Residence");
    expect(resolveProjectName("proj-201")).toBe("Nila Residence");
    expect(resolveProjectName("nila-residence")).toBe("Nila Residence");
    expect(resolveProjectName("prj-001")).toBe("Nila Residence");
  });

  it("resolves other projects across formats", () => {
    expect(resolveProjectName("proj-002")).toBe("Azure Villa");
    expect(resolveProjectName("prj-2")).toBe("Azure Villa");
    expect(resolveProjectName("proj-003")).toBe("Greenfield Apartment");
  });

  it("prioritizes query parameters when provided", () => {
    const params = new URLSearchParams("projectName=Custom+Test+Villa");
    expect(resolveProjectName("proj-999", params)).toBe("Custom Test Villa");
  });

  it("reads from session storage cache when available", () => {
    sessionStorage.setItem("kallisto_project_name_custom-id-42", "Dynamic Studio Project");
    expect(resolveProjectName("custom-id-42")).toBe("Dynamic Studio Project");
  });

  it("formats slug gracefully when unmapped", () => {
    expect(resolveProjectName("ocean-view-mansion")).toBe("Ocean View Mansion");
  });
});

describe("TopBar breadcrumb rendering on active project pages", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders Virtual Office > Projects > Nila Residence for /projects/proj-001", () => {
    mockPathname.mockReturnValue("/projects/proj-001");
    mockSearchParams.mockReturnValue(new URLSearchParams());

    const { container } = render(
      <TopBar
        sidebarCollapsed={false}
        onToggleSidebar={vi.fn()}
        assistantOpen={false}
        onToggleAssistant={vi.fn()}
        onToggleNavigation={vi.fn()}
        onOpenSearch={vi.fn()}
        consoleState={dummyConsoleState}
        onOpenDevConsole={vi.fn()}
        accountOpen={false}
        onToggleAccountPopover={vi.fn()}
        onCloseAccountPopover={vi.fn()}
        accountInitialView="main"
      />
    );

    const breadcrumbList = container.querySelector(".breadcrumb-list") as HTMLElement;
    expect(breadcrumbList).toBeInTheDocument();

    const virtualOfficeLink = within(breadcrumbList).getByRole("link", { name: "Virtual Office" });
    expect(virtualOfficeLink).toHaveAttribute("href", "/");

    const projectsLink = within(breadcrumbList).getByRole("link", { name: "Projects" });
    expect(projectsLink).toHaveAttribute("href", "/projects");

    const currentProject = within(breadcrumbList).getByText("Nila Residence");
    expect(currentProject).toHaveClass("breadcrumb-current");
  });

  it("renders Virtual Office > Projects > Nila Residence for backend prj-1 URL", () => {
    mockPathname.mockReturnValue("/projects/prj-1");
    mockSearchParams.mockReturnValue(new URLSearchParams());

    const { container } = render(
      <TopBar
        sidebarCollapsed={false}
        onToggleSidebar={vi.fn()}
        assistantOpen={false}
        onToggleAssistant={vi.fn()}
        onToggleNavigation={vi.fn()}
        onOpenSearch={vi.fn()}
        consoleState={dummyConsoleState}
        onOpenDevConsole={vi.fn()}
        accountOpen={false}
        onToggleAccountPopover={vi.fn()}
        onCloseAccountPopover={vi.fn()}
        accountInitialView="main"
      />
    );

    const breadcrumbList = container.querySelector(".breadcrumb-list") as HTMLElement;
    expect(within(breadcrumbList).queryByText("Project Detail")).toBeNull();
    expect(within(breadcrumbList).getByText("Nila Residence")).toBeInTheDocument();
  });

  it("reflects active tab (e.g. Client Context) with clickable project link when tab param is present", () => {
    mockPathname.mockReturnValue("/projects/proj-001");
    mockSearchParams.mockReturnValue(new URLSearchParams("tab=client"));

    const { container } = render(
      <TopBar
        sidebarCollapsed={false}
        onToggleSidebar={vi.fn()}
        assistantOpen={false}
        onToggleAssistant={vi.fn()}
        onToggleNavigation={vi.fn()}
        onOpenSearch={vi.fn()}
        consoleState={dummyConsoleState}
        onOpenDevConsole={vi.fn()}
        accountOpen={false}
        onToggleAccountPopover={vi.fn()}
        onCloseAccountPopover={vi.fn()}
        accountInitialView="main"
      />
    );

    const breadcrumbList = container.querySelector(".breadcrumb-list") as HTMLElement;
    const projectLink = within(breadcrumbList).getByRole("link", { name: "Nila Residence" });
    expect(projectLink).toHaveAttribute("href", "/projects/proj-001");

    const tabCurrent = within(breadcrumbList).getByText("Client Context");
    expect(tabCurrent).toHaveClass("breadcrumb-current");
  });

  it("renders submodules like /projects/proj-001/tasks with clickable project link", () => {
    mockPathname.mockReturnValue("/projects/proj-001/tasks");
    mockSearchParams.mockReturnValue(new URLSearchParams());

    const { container } = render(
      <TopBar
        sidebarCollapsed={false}
        onToggleSidebar={vi.fn()}
        assistantOpen={false}
        onToggleAssistant={vi.fn()}
        onToggleNavigation={vi.fn()}
        onOpenSearch={vi.fn()}
        consoleState={dummyConsoleState}
        onOpenDevConsole={vi.fn()}
        accountOpen={false}
        onToggleAccountPopover={vi.fn()}
        onCloseAccountPopover={vi.fn()}
        accountInitialView="main"
      />
    );

    const breadcrumbList = container.querySelector(".breadcrumb-list") as HTMLElement;
    const projectLink = within(breadcrumbList).getByRole("link", { name: "Nila Residence" });
    expect(projectLink).toHaveAttribute("href", "/projects/proj-001");

    const tasksCurrent = within(breadcrumbList).getByText("Tasks");
    expect(tasksCurrent).toHaveClass("breadcrumb-current");
  });
});
