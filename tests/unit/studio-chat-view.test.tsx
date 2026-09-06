import { render, screen, cleanup } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StudioChatView } from "@/features/studio/components/studio-chat-view";
import { StudioProjectOption, StudioTask } from "@/types/domain/studio";

vi.mock("next/image", () => ({
  __esModule: true,
  default: ({ fill, unoptimized, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || "mocked image"} />;
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => "/studio",
  useSearchParams: () => new URLSearchParams(),
}));

const mockTask: StudioTask = {
  id: "task-001",
  workspaceId: "ws-1",
  projectId: "proj-1",
  projectCode: "KVO-01",
  projectName: "Kallisto Virtual Office",
  workspaceType: "boq",
  useCase: "create_detailed_boq",
  status: "draft",
  prompt: "Generate BOQ for residential villa",
  startMethod: "scratch",
  ownerId: "user-1",
  ownerName: "Test User",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockProjects: StudioProjectOption[] = [
  {
    id: "proj-1",
    workspaceId: "ws-1",
    name: "Kallisto Virtual Office",
    code: "KVO-01",
    projectType: "Commercial",
    phase: "Design",
    status: "active",
  },
];

describe("StudioChatView", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders active canvas return button and upper-right user prompt bubble", () => {
    render(
      <StudioChatView
        activeTask={mockTask}
        workspaceMode="ready"
        messages={[
          {
            id: "msg-1",
            taskId: mockTask.id,
            role: "user",
            kind: "text",
            content: "Generate BOQ for residential villa",
            createdAt: new Date().toISOString(),
          },
        ]}
        prompt=""
        onPromptChange={vi.fn()}
        attachments={[]}
        onAddAttachment={vi.fn()}
        onRemoveAttachment={vi.fn()}
        selectedIntent="create"
        selectedAgent="auto"
        onAgentChange={vi.fn()}
        selectedProjectId="proj-1"
        projects={mockProjects}
        onSelectProject={vi.fn()}
        onSubmit={vi.fn()}
        onStartNewTask={vi.fn()}
      />
    );

    // Top-left Return to Studio button removed (handled by global top bar)
    expect(screen.queryByTitle("Return to Studio Workspace")).toBeNull();

    // Upper-right User Bubble
    expect(screen.getByText("Generate BOQ for residential villa")).toBeDefined();
  });

  it("renders floating upper-right Outputs panel with No outputs yet state", () => {
    render(
      <StudioChatView
        activeTask={mockTask}
        workspaceMode="idle"
        messages={[]}
        prompt=""
        onPromptChange={vi.fn()}
        attachments={[]}
        onAddAttachment={vi.fn()}
        onRemoveAttachment={vi.fn()}
        selectedIntent="create"
        selectedAgent="auto"
        onAgentChange={vi.fn()}
        selectedProjectId="proj-1"
        projects={mockProjects}
        onSelectProject={vi.fn()}
        onSubmit={vi.fn()}
        onStartNewTask={vi.fn()}
      />
    );

    expect(screen.getByText("RECENT CHATS")).toBeDefined();
    expect(screen.getByText("UPLOADED FILES")).toBeDefined();
    expect(screen.getByText("RUNNING TASKS")).toBeDefined();
  });

  it("does not render fake commercial controls or status warning strips", () => {
    render(
      <StudioChatView
        activeTask={mockTask}
        workspaceMode="idle"
        messages={[]}
        prompt=""
        onPromptChange={vi.fn()}
        attachments={[]}
        onAddAttachment={vi.fn()}
        onRemoveAttachment={vi.fn()}
        selectedIntent="create"
        selectedAgent="auto"
        onAgentChange={vi.fn()}
        selectedProjectId="proj-1"
        projects={mockProjects}
        onSelectProject={vi.fn()}
        onSubmit={vi.fn()}
        onStartNewTask={vi.fn()}
      />
    );

    expect(screen.queryByText("Upgrade to Pro")).toBeNull();
    expect(screen.queryByText("Add Credits")).toBeNull();
    expect(screen.getAllByText("Kallisto Virtual Office")[0]).toBeDefined();
  });
});

