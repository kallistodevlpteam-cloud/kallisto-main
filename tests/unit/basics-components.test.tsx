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
import { ProposalDetail } from "@/features/basics/components/proposal-detail";
import {
  MOCK_BASICS_PROJECT_CONTEXTS,
  MOCK_BASICS_PROPOSALS,
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
    expect(within(metricsGrid).getByText("Approvals")).toBeInTheDocument();
    expect(within(metricsGrid).getByText("Pending Proposals")).toBeInTheDocument();
    expect(within(metricsGrid).getByText("Finance of Basics")).toBeInTheDocument();

    // On default overview, Active Project, Active Request, and Finance are visible
    expect(screen.getByRole("heading", { name: "Active Project" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Active Request" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Finance of Basics" })).toBeInTheDocument();

    // Orders, Approvals, Proposals, and Projects are removed from overview
    expect(screen.queryByRole("heading", { name: "Active Orders & Engagements" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Approvals" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Pending Proposals & Bids" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Projects Using Basics Services" })).not.toBeInTheDocument();

    // Clicking metric card filters to that view
    fireEvent.click(within(metricsGrid).getByText("Active Orders"));
    expect(screen.getByRole("heading", { name: "Active Orders & Engagements" })).toBeInTheDocument();

    // Clicking Approvals metric filters to Approvals view and shows output files for review
    fireEvent.click(within(metricsGrid).getByText("Approvals"));
    expect(screen.getByRole("heading", { name: "Approvals" })).toBeInTheDocument();
    expect(screen.getAllByText(/View & Review/i).length).toBeGreaterThan(0);

    // Assert right column sidebar sections are removed
    expect(screen.queryByRole("heading", { name: "Quick Operations" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Discipline Coverage" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Featured Specialists" })).not.toBeInTheDocument();

    // Order approvals notification banner
    expect(screen.getByLabelText("Order Approvals Notification")).toBeInTheDocument();
    expect(screen.getByText("Order Approval Required")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Review & Approve/i })).toBeInTheDocument();
  });

  it("renders rich card details for Active Project and Active Request, and validates removed tabs", async () => {
    render(<BasicsDashboardWorkspace />);

    // 1. On default Overview tab, Active Project and Active Request are visible,
    // while Projects Using Basics Services is removed
    expect(
      await screen.findByRole("heading", { name: "Active Project" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Active Request" }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", { name: "Projects Using Basics Services" }),
    ).not.toBeInTheDocument();

    // Check presence of filter tabs
    const overviewTab = screen.getByRole("tab", { name: /^Overview$/i });
    const activeProjectTab = screen.getByRole("tab", { name: /Active Project/i });
    const activeRequestTab = screen.getByRole("tab", { name: /Active Request/i });
    const completedProjectTab = screen.getByRole("tab", { name: /Completed Project/i });
    const financeTab = screen.getByRole("tab", { name: /Finance of Basics/i });

    expect(overviewTab).toBeInTheDocument();
    expect(activeProjectTab).toBeInTheDocument();
    expect(activeRequestTab).toBeInTheDocument();
    expect(completedProjectTab).toBeInTheDocument();
    expect(financeTab).toBeInTheDocument();

    // Check removed tabs are not present
    expect(screen.queryByRole("tab", { name: /Projects using Basics/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: /Active Orders/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: /Open Requests/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: /Pending Proposals/i })).not.toBeInTheDocument();

    // Switch to Active Project tab
    fireEvent.click(activeProjectTab);
    expect(activeProjectTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("heading", { name: "Active Project" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { name: "Nila Residence" }).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Selected Service").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /Track Order/i }).length).toBeGreaterThan(0);

    // Verify metrics are removed from Active Project tab, and Completed Projects is moved to its own tab
    expect(screen.queryByLabelText("Basics Operational Metrics")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /Completed Project/i })).not.toBeInTheDocument();

    // Switch to Active Request tab
    fireEvent.click(activeRequestTab);
    expect(activeRequestTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("heading", { name: "Active Request" })).toBeInTheDocument();
    expect(screen.getAllByText("Proposal").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /Review Proposal/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Proposed Fee").length).toBeGreaterThan(0);

    // Switch to Completed Project tab
    fireEvent.click(completedProjectTab);
    expect(completedProjectTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("heading", { name: "Completed Project" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Order Summary/i }).length).toBeGreaterThan(0);
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

  it("renders multiple selected services on active project card when configured", async () => {
    render(<BasicsDashboardWorkspace />);

    // Wait for the dashboard to finish loading
    expect(await screen.findByRole("heading", { name: "Basics Dashboard" })).toBeInTheDocument();

    // Verify multiple services header and individual services on Nila Residence
    expect(await screen.findByText(/Selected Services \(2\)/i)).toBeInTheDocument();
    expect(screen.getByText("Peer Review & Foundation Design")).toBeInTheDocument();
    expect(screen.getAllByText("Structural Engineering engagement").length).toBeGreaterThan(0);
  });

  it("does not render cover image on Active Request card and displays clean ticket layout", async () => {
    render(<BasicsDashboardWorkspace />);

    expect(await screen.findByRole("heading", { name: "Basics Dashboard" })).toBeInTheDocument();

    // Switch to Active Request tab
    const activeRequestTab = screen.getByRole("tab", { name: /Active Request/i });
    fireEvent.click(activeRequestTab);

    // Verify no cover image banner is rendered on Active Request card
    expect(screen.queryByAltText(/Axis Structures Cover/i)).not.toBeInTheDocument();

    // Verify Proposal ticket badge and bidder attribution are rendered
    expect(screen.getAllByText("Proposal").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Axis Structures").length).toBeGreaterThan(0);
  });

  it("renders Approvals section with provider output files and allows modal review", async () => {
    render(<BasicsDashboardWorkspace />);

    expect(await screen.findByRole("heading", { name: "Basics Dashboard" })).toBeInTheDocument();

    const metricsGrid = screen.getByLabelText("Basics Operational Metrics");
    const approvalsMetric = within(metricsGrid).getByText("Approvals");
    fireEvent.click(approvalsMetric);

    // Section header
    expect(screen.getByRole("heading", { name: "Approvals" })).toBeInTheDocument();

    // Verify output files from provider are displayed with PDF extension, version, and metadata
    expect(screen.getAllByText(/Rev 01/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Deliverable:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Submitted by/i).length).toBeGreaterThan(0);

    // Click "View & Review" button on the first approval item
    const reviewButtons = screen.getAllByRole("button", { name: /View & Review/i });
    expect(reviewButtons.length).toBeGreaterThan(0);
    fireEvent.click(reviewButtons[0]);

    // DeliverableReviewModal should open
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/Review Output:/i)).toBeInTheDocument();
    expect(screen.getByText(/Kallisto Verified Engineering Output/i)).toBeInTheDocument();
    expect(screen.getByText(/Provider Submission Note:/i)).toBeInTheDocument();

    // Click "Approve Deliverable" in modal
    const approveBtn = screen.getByRole("button", { name: /Approve Deliverable/i });
    fireEvent.click(approveBtn);

    // Success banner should appear
    expect(await screen.findByText(/Deliverable approved successfully/i)).toBeInTheDocument();
  });

  it("renders cover image of the project on Active Project card", async () => {
    render(<BasicsDashboardWorkspace />);

    expect(await screen.findByRole("heading", { name: "Basics Dashboard" })).toBeInTheDocument();

    // Verify project cover image is rendered on Active Project card (e.g. Nila Residence)
    const nilaCover = await screen.findByAltText("Nila Residence Cover");
    expect(nilaCover).toBeInTheDocument();
    expect(nilaCover).toHaveAttribute("src", expect.stringMatching(/\.(png|jpg|webp)$/i));
  });

  it("renders linked service request, file preview/download actions, and updates timeline in ProposalDetail", async () => {
    const proposal = MOCK_BASICS_PROPOSALS[0];
    render(<ProposalDetail proposalId={proposal.id} />);

    // Wait for proposal to load
    expect(await screen.findByRole("heading", { name: /Axis Structures proposal/i })).toBeInTheDocument();

    // Verify Linked Service Request & Scope Brief is rendered
    expect(screen.getByText("Service Request")).toBeInTheDocument();
    expect(screen.getByText(/Requested Scope & Deliverables/i)).toBeInTheDocument();

    // Verify Proposal Attachments with View & Download actions
    expect(screen.getByText("Proposal Attachments")).toBeInTheDocument();
    const viewButtons = screen.getAllByRole("button", { name: /^view/i });
    expect(viewButtons.length).toBeGreaterThan(0);
    const downloadButtons = screen.getAllByRole("button", { name: /^download/i });
    expect(downloadButtons.length).toBeGreaterThan(0);

    // Click View button to open preview modal
    fireEvent.click(viewButtons[0]);
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/Kallisto Verified Submission/i)).toBeInTheDocument();

    // Close preview modal
    const closeBtn = screen.getByRole("button", { name: /close document preview/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Verify Service Request Updates & Proposal History timeline
    expect(screen.getByText("Service Request Updates & Proposal History")).toBeInTheDocument();
    expect(screen.getByText("Service Request Published")).toBeInTheDocument();
    expect(screen.getByText("Commercial Proposal & Files Submitted")).toBeInTheDocument();

    // Verify header actions: Cancel request, View profile, Message
    const cancelBtn = screen.getByRole("button", { name: /cancel request/i });
    expect(cancelBtn).toBeInTheDocument();

    const viewProfileLinks = screen.getAllByRole("link", { name: /view profile/i });
    expect(viewProfileLinks.length).toBeGreaterThanOrEqual(1);
    expect(viewProfileLinks[0]).toHaveAttribute("href", expect.stringContaining("/basics/experts/"));

    const messageBtn = screen.getByRole("button", { name: /message/i });
    expect(messageBtn).toBeInTheDocument();

    // Ensure removed buttons are not present
    expect(screen.queryByRole("button", { name: /^shortlist$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^accept proposal$/i })).not.toBeInTheDocument();

    // Clicking Message opens the chat modal
    fireEvent.click(messageBtn);
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /chat with/i })).toBeInTheDocument();
  });

  it("toggles between Grid view and Table list view on Completed Project tab", async () => {
    render(<BasicsDashboardWorkspace />);

    expect(await screen.findByRole("heading", { name: "Basics Dashboard" })).toBeInTheDocument();

    // Navigate to Completed Project tab
    const completedTab = screen.getByRole("tab", { name: /completed project/i });
    fireEvent.click(completedTab);

    expect(screen.getByRole("heading", { name: "Completed Project" })).toBeInTheDocument();

    // Verify view toggle is present
    const gridToggle = screen.getByRole("button", { name: /card grid view/i });
    const tableToggle = screen.getByRole("button", { name: /table list view/i });
    expect(gridToggle).toBeInTheDocument();
    expect(tableToggle).toBeInTheDocument();

    // Switch to Table list view
    fireEvent.click(tableToggle);

    // Verify table is rendered
    const table = screen.getByRole("table", { name: "Completed Projects Table" });
    expect(table).toBeInTheDocument();

    // Check table headers
    expect(screen.getByRole("columnheader", { name: "Project" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Delivered Service" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Specialist Firm" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Deliverables" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Settled Fee" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Actions" })).toBeInTheDocument();

    // Verify table rows display project and action links
    const orderSummaryLinks = screen.getAllByRole("link", { name: /order summary/i });
    expect(orderSummaryLinks.length).toBeGreaterThan(0);

    // Switch back to Grid view
    fireEvent.click(gridToggle);
    expect(screen.queryByRole("table", { name: "Completed Projects Table" })).not.toBeInTheDocument();
  });

  it("toggles between Grid view and Table list view on Active Project tab", async () => {
    render(<BasicsDashboardWorkspace />);

    expect(await screen.findByRole("heading", { name: "Basics Dashboard" })).toBeInTheDocument();

    // Navigate to Active Project tab
    const activeProjectTab = screen.getByRole("tab", { name: /^active project/i });
    fireEvent.click(activeProjectTab);

    expect(screen.getByRole("heading", { name: "Active Project" })).toBeInTheDocument();

    // Toggle to Table list view
    const tableToggle = screen.getByRole("button", { name: /table list view/i });
    fireEvent.click(tableToggle);

    // Verify Active Projects Table is rendered
    expect(screen.getByRole("table", { name: "Active Projects Table" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Active Scope" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Deliverables Progress" })).toBeInTheDocument();
  });

  it("toggles between Grid view and Table list view on Active Request tab", async () => {
    render(<BasicsDashboardWorkspace />);

    expect(await screen.findByRole("heading", { name: "Basics Dashboard" })).toBeInTheDocument();

    // Navigate to Active Request tab
    const activeRequestTab = screen.getByRole("tab", { name: /^active request/i });
    fireEvent.click(activeRequestTab);

    expect(screen.getByRole("heading", { name: "Active Request" })).toBeInTheDocument();

    // Toggle to Table list view
    const tableToggle = screen.getByRole("button", { name: /table list view/i });
    fireEvent.click(tableToggle);

    // Verify Active Requests Table is rendered
    expect(screen.getByRole("table", { name: "Active Requests Table" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Scope & Project" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Specialist Firm" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Status" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Timeline" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Proposed Fee" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Actions" })).toBeInTheDocument();

    // Verify action links
    const reviewLinks = screen.getAllByRole("link", { name: /review proposal/i });
    expect(reviewLinks.length).toBeGreaterThan(0);

    // Toggle back to Grid view
    const gridToggle = screen.getByRole("button", { name: /card grid view/i });
    fireEvent.click(gridToggle);
    expect(screen.queryByRole("table", { name: "Active Requests Table" })).not.toBeInTheDocument();
  });
});



