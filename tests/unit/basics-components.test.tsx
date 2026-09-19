import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProviderCard } from "@/features/basics/components/provider-card";
import { ProviderOrderPanel } from "@/features/basics/components/provider-order-panel";
import { BasicsEmptyState } from "@/features/basics/components/basics-shared";
import { BasicsOverview } from "@/features/basics/components/basics-overview";
import { BasicsDashboardWorkspace } from "@/features/basics/components/basics-dashboard-workspace";
import { ExpertDiscovery } from "@/features/basics/components/expert-discovery";
import { RequirementWizard } from "@/features/basics/components/requirement-wizard";
import { RequirementDetail } from "@/features/basics/components/requirement-detail";
import {
  MOCK_BASICS_PROJECT_CONTEXTS,
  MOCK_BASICS_PROVIDERS,
  MOCK_BASICS_REQUIREMENTS,
} from "@/features/basics/data/mock-basics-data";

describe("Basics shared interface", () => {
  afterEach(() => {
    cleanup();
  });
  it("renders evidence-based provider cards with working route actions", () => {
    const provider = MOCK_BASICS_PROVIDERS[0];
    render(
      <ProviderCard
        provider={provider}
        projectId="proj-001"
        discovery
        onToggleCompare={vi.fn()}
        onToggleSave={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("heading", { name: provider.name }),
    ).toBeInTheDocument();
    expect(screen.getByText(`${provider.yearsOfExperience} years`)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: `View ${provider.name} specialist profile` }),
    ).toBeInTheDocument();
  });

  it("gives empty states one clear next action", () => {
    render(
      <BasicsEmptyState
        title="No proposals"
        description="Post a requirement to receive proposals."
        actionLabel="Post a requirement"
        href="/basics/requirements/new"
      />,
    );

    expect(screen.getByRole("heading", { name: "No proposals" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Post a requirement/i }),
    ).toHaveAttribute("href", "/basics/requirements/new");
  });

  it("renders the interactive order panel with service selection and place order action", () => {
    const provider = MOCK_BASICS_PROVIDERS[0];
    render(
      <ProviderOrderPanel
        provider={provider}
        projectId="proj-001"
      />,
    );

    expect(screen.getByRole("complementary", { name: "Place an order with this provider" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Place Order/i })).toHaveAttribute(
      "href",
      expect.stringContaining("intent=order"),
    );
    expect(screen.getByRole("link", { name: /Request Custom Proposal/i })).toHaveAttribute(
      "href",
      expect.stringContaining("intent=proposal"),
    );
    expect(screen.getByText("Kallisto Milestone Protection")).toBeInTheDocument();
  });

  it("renders top right quick actions with text labels and working routes in BasicsOverview", () => {
    render(<BasicsOverview projectId="proj-001" />);

    // Dashboard button with text label
    const dashboardLink = screen.getByRole("link", { name: /View Basics dashboard/i });
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink).toHaveAttribute("href", "/basics/dashboard?projectId=proj-001");
    expect(dashboardLink).toHaveTextContent("Dashboard");

    // Assert Saved, Orders, and Basics Hub buttons are removed
    expect(screen.queryByRole("link", { name: /View saved specialists/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /View orders and engagements/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Toggle Basics Hub side panel/i })).not.toBeInTheDocument();
  });

  it("renders ExpertDiscovery with polished search area, dashboard button, and sort dropdown", async () => {
    render(<ExpertDiscovery />);

    // 1. Search Area: input with correct placeholder
    const searchInput = screen.getByRole("textbox", {
      name: /Search specialists, skills, software, location/i,
    });
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute(
      "placeholder",
      "Search specialists, skills, software, location...",
    );

    // 2. Top Right Actions: Dashboard button present, Saved/Orders/Basics Hub removed
    const dashboardLink = screen.getByRole("link", { name: /View Basics dashboard/i });
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink).toHaveAttribute("href", "/basics/dashboard");
    expect(dashboardLink).toHaveTextContent("Dashboard");

    expect(screen.queryByRole("button", { name: /Toggle saved specialists/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /View orders and engagements/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Toggle Basics Hub side panel/i })).not.toBeInTheDocument();

    // 3. Sort Select Dropdown
    const sortSelect = screen.getByLabelText(/Sort experts/i);
    expect(sortSelect).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Sort: Recommended/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Sort: Highest rated/i })).toBeInTheDocument();
  });

  it("renders BasicsDashboardWorkspace with telemetry metrics, operational cards, and quick actions", async () => {
    render(<BasicsDashboardWorkspace projectId="proj-001" />);

    expect(await screen.findByRole("heading", { name: "Basics Dashboard" })).toBeInTheDocument();
    const metricsGrid = screen.getByLabelText("Basics Operational Metrics");
    expect(metricsGrid).toBeInTheDocument();
    expect(within(metricsGrid).getByText("Active Orders")).toBeInTheDocument();
    expect(within(metricsGrid).getByText("Open Requests")).toBeInTheDocument();
    expect(within(metricsGrid).getByText("Pending Proposals")).toBeInTheDocument();
    expect(within(metricsGrid).getByText("Finance of Basics")).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "Active Orders & Engagements" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Open Requests & Scopes" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Pending Proposals & Bids" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Finance of Basics" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Quick Operations" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Discipline Coverage" })).toBeInTheDocument();

    // Order approvals notification banner
    expect(screen.getByLabelText("Order Approvals Notification")).toBeInTheDocument();
    expect(screen.getByText("Order Approval Required")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Review & Approve/i })).toBeInTheDocument();
  });

  it("renders RequirementWizard with minimal project selection, icons, and project dropdown", () => {
    render(<RequirementWizard projects={MOCK_BASICS_PROJECT_CONTEXTS} />);

    // Header & Steps
    expect(screen.getByRole("heading", { name: "Project" })).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 6")).toBeInTheDocument();

    // Verify minimal mode option cards with icons
    const standaloneModeCard = screen.getByText("Continue without a project");
    expect(standaloneModeCard).toBeInTheDocument();

    const existingProjectCard = screen.getByText("Link to an existing project");
    expect(existingProjectCard).toBeInTheDocument();

    // Click Link to an existing project to show dropdown
    fireEvent.click(existingProjectCard);

    // Verify existing project dropdown selector
    const projectSelect = screen.getByRole("combobox", { name: /Select existing project/i });
    expect(projectSelect).toBeInTheDocument();
    expect(screen.getByText(/Create new project/i)).toBeInTheDocument();

    // Select Azure Villa from dropdown
    const azureVilla = MOCK_BASICS_PROJECT_CONTEXTS.find((p) => p.name.includes("Azure"));
    if (azureVilla) {
      fireEvent.change(projectSelect, { target: { value: azureVilla.id } });
      // Expect minimal preview summary with details
      expect(screen.getByRole("heading", { name: azureVilla.name })).toBeInTheDocument();
      expect(screen.getByText(azureVilla.location)).toBeInTheDocument();
      expect(screen.getByText(azureVilla.projectType)).toBeInTheDocument();
    }
  });

  it("renders RequirementDetail with Matched Specialists section and invite capability", async () => {
    render(<RequirementDetail requirementId="requirement-001" />);

    // Wait for requirement to load
    expect(await screen.findByRole("heading", { name: /Structural design for Nila Residence/i })).toBeInTheDocument();

    // Verify Matched Specialists in Basics section is displayed
    expect(screen.getByRole("heading", { name: /Matched Specialists in Basics/i })).toBeInTheDocument();
    expect(screen.getByText(/Explore all in Expert Directory/i)).toBeInTheDocument();

    // Verify presence of Invite to Requirement button on matched provider cards
    const inviteButtons = screen.getAllByRole("button", { name: /Invite to Requirement/i });
    expect(inviteButtons.length).toBeGreaterThan(0);

    // Click the first invite button
    fireEvent.click(inviteButtons[0]);

    // Verify notice appears confirming invite
    expect(await screen.findByText(/to submit a proposal for this requirement/i)).toBeInTheDocument();
  });

  it("renders ProviderCard with direct invite action when onInvite is provided", () => {
    const provider = MOCK_BASICS_PROVIDERS[0];
    const onInviteMock = vi.fn();

    const { rerender } = render(
      <ProviderCard
        provider={provider}
        discovery
        onInvite={onInviteMock}
      />,
    );

    const inviteBtn = screen.getByRole("button", { name: /^Invite$/i });
    expect(inviteBtn).toBeInTheDocument();

    fireEvent.click(inviteBtn);
    expect(onInviteMock).toHaveBeenCalledWith(provider.id);

    // Rerender as already invited
    rerender(
      <ProviderCard
        provider={provider}
        discovery
        isInvited={true}
        onInvite={onInviteMock}
      />,
    );

    const invitedBtn = screen.getByRole("button", { name: /^Invited$/i });
    expect(invitedBtn).toBeInTheDocument();
    expect(invitedBtn).toBeDisabled();
  });

  it("renders Step 6 with Find Matching Profiles action and Publish requirement option", async () => {
    render(<RequirementWizard projects={MOCK_BASICS_PROJECT_CONTEXTS} />);

    // Click on Step 6 directly in wizard steps nav
    const step6Button = screen.getByRole("button", { name: /^Publish Review and visibility$/i });
    fireEvent.click(step6Button);

    // Verify Find Matching Profiles action is present
    expect(screen.getByRole("button", { name: /Find Matching Profiles/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Publish requirement/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Save draft/i })).toBeInTheDocument();
  });

  it("renders ExpertDiscovery with Saved profiles filter toggle", async () => {
    render(<ExpertDiscovery />);

    // Verify presence of Saved profiles filter pill
    const savedPill = await screen.findByRole("button", { name: /Saved profiles/i });
    expect(savedPill).toBeInTheDocument();

    // Click to toggle saved filter
    fireEvent.click(savedPill);
    expect(savedPill).toHaveAttribute("aria-pressed", "true");
  });
});


