import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ClientOverviewWorkspace } from "@/features/client";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/client/overview",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

beforeEach(() => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("kallisto_auth_token", "test-token");
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  }
});

afterEach(() => {
  cleanup();
});

describe("ClientOverviewWorkspace — True Odin Conversational Workspace", () => {
  it("renders the initial state with Kallisto logo, tagline, project selector, input, and 7 client actions", () => {
    render(<ClientOverviewWorkspace initialProjectId="proj-kowdiar" />);

    // 1. Brand & Tagline
    expect(screen.getByAltText("Kallisto")).toBeInTheDocument();
    expect(
      screen.getByText("Your project is already connected. Tell Odin what you need.")
    ).toBeInTheDocument();

    // 2. Project Selector
    expect(screen.getByRole("button", { name: /choose project/i })).toHaveTextContent("Kowdiar Villa");

    // 3. Conversational Input
    expect(screen.getByPlaceholderText(/Ask Odin/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send to odin/i })).toBeInTheDocument();

    // 4. 7 Client Actions
    expect(screen.getByRole("button", { name: /find a provider/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /check project/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /view documents/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /check payments/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /upcoming/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /my enquiries/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ask odin/i })).toBeInTheDocument();
  });

  it("switches active project when selected from the project dropdown", async () => {
    render(<ClientOverviewWorkspace initialProjectId="proj-kowdiar" />);

    const projectBtn = screen.getByRole("button", { name: /choose project/i });
    fireEvent.click(projectBtn);

    const nilaOption = screen.getByRole("option", { name: /nila residence/i });
    fireEvent.click(nilaOption);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /choose project/i })).toHaveTextContent("Nila Residence");
    });
  });

  it("transitions into active chat state when a client quick action is clicked", async () => {
    render(<ClientOverviewWorkspace initialProjectId="proj-kowdiar" />);

    const providerActionBtn = screen.getByRole("button", { name: /find a provider/i });
    fireEvent.click(providerActionBtn);

    // Transitions to Active Chat State
    expect(screen.getByText(/find an electrical contractor for this project\./i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Continue with Odin...")).toBeInTheDocument();

    // Odin responds with verified provider outcome
    await waitFor(
      () => {
        expect(screen.getByText(/pre-vetted specialists for kowdiar villa/i)).toBeInTheDocument();
        expect(screen.getByText("Apex Electro-Tech Systems")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /compare options/i })).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("supports continuous follow-up conversation from the bottom chat dock", async () => {
    render(<ClientOverviewWorkspace initialProjectId="proj-kowdiar" />);

    // Send initial query
    const input = screen.getByPlaceholderText(/Ask Odin/i);
    fireEvent.change(input, { target: { value: "How much have I paid so far?" } });
    fireEvent.click(screen.getByRole("button", { name: /send to odin/i }));

    // Wait for first response and input to become enabled
    await waitFor(
      () => {
        expect(screen.getByText(/authoritative financial ledger & escrow status/i)).toBeInTheDocument();
        expect(screen.getByText("₹85,00,000")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Send follow-up query using a follow-up action button
    const followUpBtn = await screen.findByRole("button", { name: /next milestone details/i });
    fireEvent.click(followUpBtn);

    // Second user message appears
    await waitFor(() => expect(screen.getAllByText("Next Milestone Details").length).toBeGreaterThanOrEqual(2));

    // Second response arrives
    await waitFor(
      () => {
        expect(screen.getByText(/authoritative financial ledger & escrow status/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("renders a seamless active conversation canvas without redundant header dividers", async () => {
    render(<ClientOverviewWorkspace initialProjectId="proj-kowdiar" />);

    // Send query
    const actionBtn = screen.getByRole("button", { name: /check payments/i });
    fireEvent.click(actionBtn);

    // In active chat state with bottom composer dock
    expect(screen.getByPlaceholderText("Continue with Odin...")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /new query/i })).not.toBeInTheDocument();
  });

  it("renders new client mode when initialProjectId is null and supports AI project scoping", async () => {
    render(<ClientOverviewWorkspace initialProjectId={null} />);

    // 1. Tagline adapts for new clients
    expect(screen.getByText("Tell Odin what you want to build, design, or explore.")).toBeInTheDocument();

    // 2. Project button displays start or select project
    expect(screen.getByRole("button", { name: /choose project/i })).toHaveTextContent("✦ Start or select project");

    // 3. New client actions are present
    expect(screen.getByRole("button", { name: /start a project/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /estimate cost/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /site feasibility/i })).toBeInTheDocument();

    // 4. Click Start a Project to trigger AI project scoping
    const startProjectBtn = screen.getByRole("button", { name: /start a project/i });
    fireEvent.click(startProjectBtn);

    // 5. Transitions to active chat and renders AI project scoping card
    await waitFor(
      () => {
        expect(screen.getByText(/ai project scoping & preliminary framework/i)).toBeInTheDocument();
        expect(screen.getByText("Contemporary Residential Villa")).toBeInTheDocument();
        expect(screen.getAllByRole("button", { name: /launch project brief/i }).length).toBeGreaterThanOrEqual(1);
      },
      { timeout: 3000 }
    );
  });

  it("toggles the right-side project intelligence drawer when panel button is clicked", async () => {
    render(<ClientOverviewWorkspace initialProjectId="proj-kowdiar" />);

    // Click quick action to open chat
    const actionBtn = screen.getByRole("button", { name: /check payments/i });
    fireEvent.click(actionBtn);

    // Panel is initially closed
    expect(screen.queryByLabelText("Client Project Intelligence Panel")).not.toBeInTheDocument();

    // Toggle button opens the panel
    const toggleBtn = screen.getByRole("button", { name: /toggle project intelligence panel/i });
    fireEvent.click(toggleBtn);

    expect(screen.getByLabelText("Client Project Intelligence Panel")).toBeInTheDocument();
    expect(screen.getByText("Recent work")).toBeInTheDocument();
    expect(screen.getByText("Odin noticed")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /files/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /finance/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /history/i })).toBeInTheDocument();

    // Verify New Chat option in the Project section
    const newChatBtn = screen.getByRole("button", { name: /start new chat/i });
    expect(newChatBtn).toBeInTheDocument();

    // Clicking New chat resets conversation back to initial state
    fireEvent.click(newChatBtn);
    expect(screen.getByText(/Your project is already connected/i)).toBeInTheDocument();
  });
});
