import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import React from "react";
import { StudioComposer } from "@/features/studio/components/studio-composer/studio-composer";
import { AddProjectModal } from "@/features/studio/components/add-project-modal";
import { createStudioAssistantResponse } from "@/features/studio/lib/create-studio-assistant-response";
import { StudioProjectOption } from "@/types/domain/studio";

describe("Add Project through Hive Studio Chat System", () => {
  afterEach(() => {
    cleanup();
  });

  const mockProjects: StudioProjectOption[] = [
    {
      id: "p1",
      workspaceId: "ws-1",
      name: "Villa Horizon",
      code: "PRJ-2026-01",
      projectType: "Residential Architecture",
      phase: "Design",
      status: "active",
    },
    {
      id: "p2",
      workspaceId: "ws-1",
      name: "Nila Residence Fit-out",
      code: "PRJ-2026-02",
      projectType: "Interior Design",
      phase: "Design",
      status: "active",
    },
  ];

  it("renders 'Add project' option in the composer context type menu", () => {
    const onAddProject = vi.fn();

    render(
      <StudioComposer
        prompt=""
        onPromptChange={vi.fn()}
        attachments={[]}
        onAddAttachment={vi.fn()}
        onRemoveAttachment={vi.fn()}
        selectedIntent="create"
        selectedAgent="auto"
        onAgentChange={vi.fn()}
        selectedProjectId="p1"
        projects={mockProjects}
        onSelectProject={vi.fn()}
        onAddProject={onAddProject}
        onSubmit={vi.fn()}
      />
    );

    // Open project selector pill
    const pillBtn = screen.getByRole("button", { name: /select project context/i });
    fireEvent.click(pillBtn);

    // Context menu is open with SELECT CONTEXT TYPE
    expect(screen.getByText("SELECT CONTEXT TYPE")).toBeDefined();
    expect(screen.getByText("Active Projects")).toBeDefined();
    expect(screen.getByText("Enquiries")).toBeDefined();

    // The 'Add project' button is present in SELECT CONTEXT TYPE and in the active projects submenu
    const addProjectButtons = screen.getAllByRole("button", { name: /add project/i });
    expect(addProjectButtons.length).toBeGreaterThanOrEqual(1);

    // Clicking 'Add project' triggers callback
    fireEvent.click(addProjectButtons[0]);
    expect(onAddProject).toHaveBeenCalledTimes(1);
  });

  it("allows service provider to enter details in AddProjectModal and submit", () => {
    const onAddProject = vi.fn();
    const onClose = vi.fn();

    render(
      <AddProjectModal
        isOpen={true}
        onClose={onClose}
        onAddProject={onAddProject}
      />
    );

    expect(screen.getByText("Add New Project")).toBeDefined();
    expect(
      screen.getByText(/Initialize a project workspace and kickoff drafting in Hive Studio/i)
    ).toBeDefined();

    // Fill form
    const nameInput = screen.getByLabelText(/project name/i);
    const clientInput = screen.getByLabelText(/client name/i);
    const locationInput = screen.getByLabelText(/site location/i);
    const scopeInput = screen.getByLabelText(/initial scope/i);

    fireEvent.change(nameInput, { target: { value: "Emerald Heights Penthouse" } });
    fireEvent.change(clientInput, { target: { value: "Rajiv Menon" } });
    fireEvent.change(locationInput, { target: { value: "Kochi, Kerala" } });
    fireEvent.change(scopeInput, { target: { value: "Full 4BHK luxury interior architecture" } });

    // Submit form
    const submitBtn = screen.getByRole("button", { name: /add project & start in hive chat/i });
    fireEvent.click(submitBtn);

    expect(onAddProject).toHaveBeenCalledTimes(1);
    const [newProj, initialPrompt] = onAddProject.mock.calls[0];

    expect(newProj.name).toBe("Emerald Heights Penthouse");
    expect(newProj.location).toBe("Kochi, Kerala");
    expect(newProj.code).toMatch(/^PRJ-\d{4}-\d{3}$/);
    expect(newProj.status).toBe("active");

    expect(initialPrompt).toContain("Initialize project workspace for Emerald Heights Penthouse");
    expect(initialPrompt).toContain("Rajiv Menon");
    expect(initialPrompt).toContain("Full 4BHK luxury interior architecture");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("handles chat-assisted direct onboarding from AddProjectModal", () => {
    const onSetupInChat = vi.fn();
    const onClose = vi.fn();

    render(
      <AddProjectModal
        isOpen={true}
        onClose={onClose}
        onAddProject={vi.fn()}
        onSetupInChat={onSetupInChat}
      />
    );

    const setupChatBtn = screen.getByRole("button", { name: /setup in chat/i });
    fireEvent.click(setupChatBtn);

    expect(onSetupInChat).toHaveBeenCalledTimes(1);
    expect(onSetupInChat.mock.calls[0][0]).toContain("Add a new project:");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("generates intelligent project onboarding response from Odin AI", () => {
    const response = createStudioAssistantResponse({
      taskId: "task-test-01",
      classification: { kind: "actionable", intent: "create" },
      projectName: "Emerald Heights Penthouse",
      prompt: "Initialize project workspace for Emerald Heights Penthouse (Residential Architecture) in Kochi for client Rajiv Menon. Scope: Full interior design.",
    });

    expect(response.content).toContain("Welcome to **Emerald Heights Penthouse**!");
    expect(response.content).toContain("I've initialized the project workspace for your practice.");
    expect(response.actions?.some((a) => a.label.includes("Draft Client Brief"))).toBe(true);
    expect(response.actions?.some((a) => a.label.includes("Generate Preliminary Estimate"))).toBe(true);
    expect(response.actions?.some((a) => a.label.includes("Prepare Initial BOQ"))).toBe(true);
  });
});
