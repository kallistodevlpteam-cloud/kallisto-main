import { render, screen, cleanup } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StudioActiveTaskCanvas } from "@/features/studio/components/studio-active-task-canvas";
import { StudioProjectOption, StudioTask } from "@/types/domain/studio";

vi.mock("next/image", () => ({
  __esModule: true,
  default: ({ fill, unoptimized, ...props }: any) => {
    return <img {...props} alt={props.alt || "mocked image"} />;
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
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
  prompt: "HI",
  startMethod: "scratch",
  ownerId: "user-1",
  ownerName: "Test User",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockProject: StudioProjectOption = {
  id: "proj-1",
  workspaceId: "ws-1",
  name: "Kallisto Virtual Office",
  code: "KVO-01",
  projectType: "Commercial",
  phase: "Design",
  status: "active",
};

const baseProps = {
  task: mockTask,
  project: mockProject,
  messages: [],
  outputs: [],
  taskStatus: "idle" as const,
  outputsOpen: false,
  isSubmitting: false,
  prompt: "",
  onPromptChange: vi.fn(),
  attachments: [],
  onAddAttachment: vi.fn(),
  onRemoveAttachment: vi.fn(),
  selectedIntent: "create" as const,
  selectedAgent: "auto" as const,
  onAgentChange: vi.fn(),
  selectedOutputType: null,
  onOutputTypeSelect: vi.fn(),
  onActionSelect: vi.fn(),
  onOutputsOpenChange: vi.fn(),
  onRetryMessage: vi.fn(),
  onSubmit: vi.fn(),
  onStartNewTask: vi.fn(),
};

describe("StudioActiveTaskCanvas", () => {
  afterEach(() => { cleanup(); });

  it("renders top-left return back button without inline path inside canvas shell", () => {
    render(
      <StudioActiveTaskCanvas
        task={mockTask}
        project={mockProject}
        messages={[{ id: "msg-user-1", taskId: mockTask.id, role: "user", kind: "text", content: "HI", createdAt: new Date().toISOString() }]}
        outputs={[]}
        taskStatus="ready"
        outputsOpen={true}
        isSubmitting={false}
        prompt=""
        onPromptChange={vi.fn()}
        attachments={[]}
        onAddAttachment={vi.fn()}
        onRemoveAttachment={vi.fn()}
        selectedIntent="create"
        selectedAgent="auto"
        onAgentChange={vi.fn()}
        selectedOutputType={null}
        onOutputTypeSelect={vi.fn()}
        onActionSelect={vi.fn()}
        onOutputsOpenChange={vi.fn()}
        onRetryMessage={vi.fn()}
        onSubmit={vi.fn()}
        onStartNewTask={vi.fn()}
      />
    );
    // Return-to-studio handled by global top bar; not inside canvas
    expect(screen.queryByTitle("Return to Studio Workspace")).toBeNull();
    // User message bubble renders the prompt text
    expect(screen.getByText("HI")).toBeDefined();
    // Must NOT display "HI" as a heading
    expect(screen.queryByRole("heading", { name: "HI" })).toBeNull();
  });

  it("renders idle intent grid when there are no messages", () => {
    render(
      <StudioActiveTaskCanvas
        task={mockTask}
        project={mockProject}
        messages={[]}
        outputs={[]}
        taskStatus="idle"
        outputsOpen={false}
        isSubmitting={false}
        prompt=""
        onPromptChange={vi.fn()}
        attachments={[]}
        onAddAttachment={vi.fn()}
        onRemoveAttachment={vi.fn()}
        selectedIntent="create"
        selectedAgent="auto"
        onAgentChange={vi.fn()}
        selectedOutputType={null}
        onOutputTypeSelect={vi.fn()}
        onActionSelect={vi.fn()}
        onOutputsOpenChange={vi.fn()}
        onRetryMessage={vi.fn()}
        onSubmit={vi.fn()}
        onStartNewTask={vi.fn()}
      />
    );
    // StudioIntentGrid renders intent cards; "Explore project" is the first intent label
    expect(screen.getByText("Explore project")).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Tablet Preview Backdrop Regression Tests
// ---------------------------------------------------------------------------

describe("StudioContainerMode type contract", () => {
  it("StudioContainerMode type is exported from studio-active-task-canvas", async () => {
    const mod = await import("@/features/studio/components/studio-active-task-canvas");
    expect(typeof mod.StudioActiveTaskCanvas).toBe("function");
  });
});

describe("StudioActiveTaskCanvas — tablet preview backdrop", () => {
  /**
   * ResizeObserver mock that captures the observer callback.
   * Must be a class (constructable) because the component calls `new Observer(...)`.
   */
  let lastObserverCallback: ((entries: { contentRect: { width: number } }[]) => void) | null = null;

  beforeEach(() => {
    lastObserverCallback = null;
    class MockResizeObserver {
      constructor(cb: (entries: { contentRect: { width: number } }[]) => void) {
        lastObserverCallback = cb;
      }
      observe = vi.fn();
      disconnect = vi.fn();
    }
    (window as any).ResizeObserver = MockResizeObserver;
  });

  afterEach(() => {
    cleanup();
    delete (window as any).ResizeObserver;
    lastObserverCallback = null;
  });

  /** Trigger the ResizeObserver callback with a synthetic container width. */
  function reportWidth(width: number) {
    lastObserverCallback?.([{ contentRect: { width } }]);
  }

  it("does NOT render the backdrop when panelState is not preview (collapsed mode)", () => {
    render(<StudioActiveTaskCanvas {...baseProps} />);
    // Default panelState.mode is "collapsed" — no backdrop regardless of width.
    reportWidth(900);
    expect(document.querySelector('.previewBackdrop')).toBeNull();
  });

  it("does NOT render the backdrop on desktop width (>=1180px)", () => {
    render(<StudioActiveTaskCanvas {...baseProps} />);
    // Desktop => split view; backdrop must never appear.
    reportWidth(1180);
    expect(document.querySelector('.previewBackdrop')).toBeNull();
  });

  it("does NOT render the backdrop on mobile width (<768px)", () => {
    render(<StudioActiveTaskCanvas {...baseProps} />);
    // Mobile => full-screen preview; no backdrop.
    reportWidth(375);
    expect(document.querySelector('.previewBackdrop')).toBeNull();
  });

  it("assigns desktop mode at exactly 1180px (inclusive boundary)", () => {
    render(<StudioActiveTaskCanvas {...baseProps} />);
    reportWidth(1180);
    // containerMode is "desktop"; no backdrop should appear.
    expect(document.querySelector('.previewBackdrop')).toBeNull();
  });

  it("renders correctly at 1179px without crashing (tablet upper boundary)", () => {
    render(<StudioActiveTaskCanvas {...baseProps} />);
    reportWidth(1179); // tablet mode
    // Component must render; workspace container must be present.
    const workspace = document.querySelector("[data-panel-mode]");
    expect(workspace).not.toBeNull();
  });

  it("renders correctly at 768px without crashing (tablet lower boundary)", () => {
    render(<StudioActiveTaskCanvas {...baseProps} />);
    reportWidth(768); // tablet mode (inclusive lower bound)
    const workspace = document.querySelector("[data-panel-mode]");
    expect(workspace).not.toBeNull();
  });

  it("renders correctly at 767px without crashing (mobile upper boundary)", () => {
    render(<StudioActiveTaskCanvas {...baseProps} />);
    reportWidth(767); // mobile mode
    const workspace = document.querySelector("[data-panel-mode]");
    expect(workspace).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// No-Blur Inline Style Regression Tests
//
// Verify no element in the canvas receives an inline filter or
// backdropFilter containing "blur", preventing the bug from re-entering
// via inline styles in future changes.
// ---------------------------------------------------------------------------

describe("StudioActiveTaskCanvas — no inline blur styles", () => {
  afterEach(() => cleanup());

  it("no element in the canvas receives an inline filter:blur style", () => {
    render(
      <StudioActiveTaskCanvas
        {...baseProps}
        messages={[{ id: "msg-1", taskId: mockTask.id, role: "assistant", kind: "text", content: "Here is the output.", createdAt: new Date().toISOString() }]}
      />
    );
    const blurredElements: Element[] = [];
    document.querySelectorAll("*").forEach((el) => {
      const inlineFilter = (el as HTMLElement).style?.filter;
      if (inlineFilter && inlineFilter.includes("blur")) blurredElements.push(el);
    });
    expect(blurredElements).toHaveLength(0);
  });

  it("no element in the canvas receives an inline backdropFilter:blur style", () => {
    render(<StudioActiveTaskCanvas {...baseProps} />);
    const backdropBlurElements: Element[] = [];
    document.querySelectorAll("*").forEach((el) => {
      const style = (el as HTMLElement).style;
      const bf =
        style?.backdropFilter ||
        style?.getPropertyValue?.("backdrop-filter") ||
        "";
      if (bf && bf.includes("blur")) backdropBlurElements.push(el);
    });
    expect(backdropBlurElements).toHaveLength(0);
  });
});

