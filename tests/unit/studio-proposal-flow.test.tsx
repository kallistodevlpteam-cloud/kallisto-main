import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { StudioCreatePage } from "@/features/studio/components/studio-create-page";
import { createStudioAssistantResponse } from "@/features/studio/lib/create-studio-assistant-response";
import { RoutePageContainer } from "@/components/ui/route-page-container";

const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams("intent=create_proposal&enquiryId=enq-1");

vi.mock("next/navigation", () => ({
  usePathname: () => "/studio",
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
  }),
  useSearchParams: () => mockSearchParams,
}));

describe("Hive Studio Proposal Conversational Flow", () => {
  beforeEach(() => {
    cleanup();
    mockPush.mockReset();
    mockSearchParams = new URLSearchParams("intent=create_proposal&enquiryId=enq-1");
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it("shows compact proposal context modal over Hive Studio when intent is create_proposal", () => {
    render(<StudioCreatePage />);

    // Verify modal overlay is rendered with enquiry data
    expect(screen.getByRole("heading", { level: 2, name: "Create Proposal" })).toBeInTheDocument();
    expect(screen.getAllByText("Villa Design Consultation")[0]).toBeInTheDocument();
    expect(screen.getByText("Ananya Builders")).toBeInTheDocument();
  });

  it("navigates back to originating Enquiry Detail page on Cancel", () => {
    render(<StudioCreatePage />);

    const cancelBtn = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelBtn);

    expect(mockPush).toHaveBeenCalledWith("/enquiries/enq-1");
  });

  it(
    "starts proposal task session, generates conversation response and syncs output panel without errors",
    async () => {
      render(<StudioCreatePage />);

    const continueBtn = screen.getByRole("button", { name: "Continue in Hive Studio" });
    fireEvent.click(continueBtn);

    // Modal closes
    await waitFor(() => {
      expect(screen.queryByRole("heading", { level: 2, name: "Create Proposal" })).not.toBeInTheDocument();
    });

    // Verify submission succeeded without error message
    expect(screen.queryByText(/Submission failed/i)).not.toBeInTheDocument();

    // Verify conversation includes concise assistant message and output glance card
    await waitFor(() => {
      expect(screen.getByText(/The proposal draft is ready/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Villa Design Proposal/i)[0]).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Preview" })).toBeInTheDocument();
    });

    const previewBtn = screen.getByRole("button", { name: "Preview" });

    // Verify default active-task mode sets data-panel-mode="collapsed" (hidden right rail view by default)
    const workspaceEl = screen.getByRole("button", { name: "Preview" }).closest("[data-panel-mode]");
    expect(workspaceEl).toHaveAttribute("data-panel-mode", "collapsed");

    // 1. Click Preview CTA: Right panel switches to Preview mode (split view)
    fireEvent.click(previewBtn);

    // Verify OutputPreviewPanel is rendered in split right rail and data-panel-mode="preview"
    await waitFor(() => {
      expect(workspaceEl).toHaveAttribute("data-panel-mode", "preview");
      expect(screen.getByRole("button", { name: "Close Preview" })).toBeInTheDocument();
      expect(screen.getByText("1. Executive Summary")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Executive Summary" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Scope & Deliverables" })).toBeInTheDocument();
    });

    // 3. Click Preview again, then test Close Preview -> sets data-panel-mode="collapsed"
    fireEvent.click(screen.getByRole("button", { name: "Preview" }));

    await waitFor(() => {
      expect(workspaceEl).toHaveAttribute("data-panel-mode", "preview");
      expect(screen.getByRole("button", { name: "Close Preview" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Close Preview" }));

    await waitFor(() => {
      expect(workspaceEl).toHaveAttribute("data-panel-mode", "collapsed");
    });

    // 4. Re-open Preview and test Request Changes
    fireEvent.click(screen.getByRole("button", { name: "Preview" }));

    await waitFor(() => {
      expect(workspaceEl).toHaveAttribute("data-panel-mode", "preview");
      expect(screen.getByRole("button", { name: "Request changes" })).toBeInTheDocument();
    });

    const requestChangesBtn = screen.getByRole("button", { name: "Request changes" });
    fireEvent.click(requestChangesBtn);

    // Verify composer context chip and placeholder are updated with request changes context
    await waitFor(() => {
      expect(screen.getByText(/Villa Design Proposal · V01/i)).toBeInTheDocument();
      expect(screen.getByTestId("animated-placeholder")).toHaveTextContent(/Request changes to Villa Design Proposal V01/i);
    });
  }, 15000);

  it("renders OutputGlanceCard strictly per event-owned output reference and avoids duplication on follow-up messages", () => {

    // 1. Initial output creation event
    const initialMsg = createStudioAssistantResponse({
      taskId: "task-1",
      classification: { kind: "actionable", outputType: "proposal" },
      projectName: "Villa Design Consultation",
      prompt: "Create proposal",
      isInitialOutputGeneration: true,
      currentVersionId: "V01",
    });

    expect(initialMsg.outputReference).toEqual({
      outputId: "out-1",
      versionId: "V01",
      title: "Villa Design Proposal",
      statusBadge: "Ready for Review",
      eventType: "created",
    });
    expect(initialMsg.actions).toBeDefined();

    // 2. Generic follow-up prompt
    const followUpMsg = createStudioAssistantResponse({
      taskId: "task-1",
      classification: { kind: "vague" },
      projectName: "Villa Design Consultation",
      prompt: "How is the spatial layout structured?",
      isInitialOutputGeneration: false,
      currentVersionId: "V01",
    });

    expect(followUpMsg.outputReference).toBeUndefined();
    expect(followUpMsg.actions).toBeUndefined();

    // 3. Revision prompt
    const revisionMsg = createStudioAssistantResponse({
      taskId: "task-1",
      classification: { kind: "actionable", outputType: "proposal" },
      projectName: "Villa Design Consultation",
      prompt: "Revise timeline to 4 months",
      isInitialOutputGeneration: false,
      currentVersionId: "V01",
    });

    expect(revisionMsg.outputReference).toEqual({
      outputId: "out-1",
      versionId: "V02",
      title: "Villa Design Proposal",
      statusBadge: "Updated V02",
      eventType: "revised",
    });
  });

  it("maintains composer dock outside conversation scroll area and triggers jump to latest on scroll", async () => {
    render(<StudioCreatePage />);

    const continueBtn = screen.getByRole("button", { name: "Continue in Hive Studio" });
    fireEvent.click(continueBtn);

    await waitFor(() => {
      expect(screen.getByText(/The proposal draft is ready/i)).toBeInTheDocument();
    });

    const composerTextarea = screen.getByRole("textbox");
    const composerContainer = composerTextarea.closest("form")?.parentElement;
    const conversationScrollArea = screen.getByText(/The proposal draft is ready/i).closest("[class*='taskConversationScrollArea']");

    // Verify ActiveComposerDock is NOT inside ConversationViewport
    expect(conversationScrollArea).not.toBeNull();
    expect(conversationScrollArea?.contains(composerTextarea)).toBe(false);

    // Simulate scrolling up in conversation viewport
    if (conversationScrollArea) {
      let currentScrollTop = 100;
      Object.defineProperty(conversationScrollArea, "scrollHeight", { value: 1000, configurable: true });
      Object.defineProperty(conversationScrollArea, "clientHeight", { value: 400, configurable: true });
      Object.defineProperty(conversationScrollArea, "scrollTop", {
        get: () => currentScrollTop,
        set: (v) => { currentScrollTop = v; },
        configurable: true,
      });

      conversationScrollArea.scrollTo = vi.fn(({ top }) => {
        currentScrollTop = top ?? 1000;
        fireEvent.scroll(conversationScrollArea);
      });

      fireEvent.scroll(conversationScrollArea);

      // Verify "Jump to latest" button appears
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Jump to latest/i })).toBeInTheDocument();
      });

      // Click "Jump to latest" button
      const jumpBtn = screen.getByRole("button", { name: /Jump to latest/i });
      fireEvent.click(jumpBtn);

      // Verify button disappears after jumping to bottom
      await waitFor(() => {
        expect(screen.queryByRole("button", { name: /Jump to latest/i })).not.toBeInTheDocument();
      });
    }
  }, 15000);

  it("uses one persistent composer dock instance across idle and active response states", async () => {
    render(<StudioCreatePage />);

    // In idle state, exactly ONE textbox exists
    const textareas = screen.getAllByRole("textbox");
    expect(textareas).toHaveLength(1);
    const initialComposerTextarea = textareas[0];
    const initialComposerOverlay = initialComposerTextarea.closest("[class*='composerOverlay']");

    expect(initialComposerOverlay).toBeInTheDocument();

    // Click continue to transition from idle to active response state
    const continueBtn = screen.getByRole("button", { name: "Continue in Hive Studio" });
    fireEvent.click(continueBtn);

    await waitFor(() => {
      expect(screen.getByText(/The proposal draft is ready/i)).toBeInTheDocument();
    });

    // In active state, still exactly ONE textbox exists and it's in the exact same composerOverlay wrapper
    const activeTextareas = screen.getAllByRole("textbox");
    expect(activeTextareas).toHaveLength(1);
    const activeComposerOverlay = activeTextareas[0].closest("[class*='composerOverlay']");

    expect(activeComposerOverlay).toBe(initialComposerOverlay);
  });

  it("conditionally renders section navigation region and updates active tab state on section click", async () => {
    render(<StudioCreatePage />);

    const continueBtn = screen.getByRole("button", { name: "Continue in Hive Studio" });
    fireEvent.click(continueBtn);

    await waitFor(() => {
      expect(screen.getByText(/The proposal draft is ready/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Preview" })).toBeInTheDocument();
    });

    const previewBtn = screen.getByRole("button", { name: "Preview" });
    fireEvent.click(previewBtn);

    // Verify section navigation region exists when conditions are met
    await waitFor(() => {
      expect(screen.getByRole("navigation", { name: "Output Section Navigation" })).toBeInTheDocument();
    });

    const execTab = screen.getByRole("button", { name: "Executive Summary" });
    const scopeTab = screen.getByRole("button", { name: "Scope & Deliverables" });

    expect(execTab).toHaveAttribute("aria-current", "page");

    fireEvent.click(scopeTab);

    await waitFor(() => {
      expect(scopeTab).toHaveAttribute("aria-current", "page");
    });
  });

  it("ensures standard RoutePageContainer retains default workspace-container without studio-page-container", () => {
    const { container } = render(
      <RoutePageContainer title="Tasks">
        <div>Tasks content</div>
      </RoutePageContainer>
    );

    const wrapper = container.querySelector(".workspace-container");
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).not.toHaveClass("studio-page-container");
  });

  it("verifies RoutePageContainer variant='studio' scopes studio-page-container exclusively to Hive Studio", () => {
    const { container } = render(
      <RoutePageContainer title="Hive Studio" variant="studio">
        <div>Studio content</div>
      </RoutePageContainer>
    );

    const wrapper = container.querySelector(".workspace-container");
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass("studio-page-container");
  });
});
