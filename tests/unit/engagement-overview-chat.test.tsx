import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EngagementDetail } from "@/features/basics/components/engagement-detail";
import { EngagementChatModal } from "@/features/basics/components/engagement-chat-modal";
import {
  MOCK_BASICS_ENGAGEMENTS,
  MOCK_BASICS_PROVIDERS,
} from "@/features/basics/data/mock-basics-data";

import { ApproveDeliverableModal } from "@/features/basics/components/approve-deliverable-modal";

let mockCurrentTab = "overview";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn((url: string) => {
      const match = url.match(/[?&]tab=([^&]+)/);
      if (match) mockCurrentTab = match[1];
    }),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === "tab" ? mockCurrentTab : null),
  }),
}));

describe("Engagement Overview Tab & Message Chat Modal", () => {
  afterEach(() => {
    cleanup();
    mockCurrentTab = "overview";
  });

  it("renders EngagementDetail with Project & Plan Details, Scope, and NO client details", async () => {
    render(<EngagementDetail engagementId="engagement-001" />);

    // Wait for the engagement details to finish loading
    expect(await screen.findByRole("heading", { name: "Project & Plan Details" })).toBeInTheDocument();

    // Verify Selected Plan badge is displayed
    expect(screen.getByText(/Selected Plan:/i)).toBeInTheDocument();

    // Verify Scope & Deliverables heading is present
    expect(screen.getByRole("heading", { name: "Scope & Deliverables" })).toBeInTheDocument();

    // Verify client details are NOT present
    expect(screen.queryByText("Arjun Architects")).not.toBeInTheDocument();
    expect(screen.queryByText("Provider and client")).not.toBeInTheDocument();

    // Verify right-side Chat with service person is removed from overview tab inline body
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Verify Milestones and Commercials tabs are removed
    expect(screen.queryByRole("button", { name: "Milestones" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Commercials" })).not.toBeInTheDocument();
  });

  it("renders Request Requirements section in Overview with full requirement details and deliverables", async () => {
    render(<EngagementDetail engagementId="engagement-001" />);

    // Wait for the Request Requirements section to finish loading
    expect(await screen.findByRole("heading", { name: "Request Requirements" })).toBeInTheDocument();

    // Verify requirement parameters
    expect(screen.getByText("Specialization")).toBeInTheDocument();
    expect(screen.getByText("Engagement Mode")).toBeInTheDocument();
    expect(screen.getByText("Budget Range")).toBeInTheDocument();
    expect(screen.getByText("Target Timeline")).toBeInTheDocument();

    // Verify Requested Deliverables list
    expect(screen.getByRole("heading", { name: /Requested Deliverables/i })).toBeInTheDocument();

    // Verify Full requirement page link is present
    expect(screen.getByRole("link", { name: /Full requirement page/i })).toBeInTheDocument();

    // Verify View provider button is present on the right
    expect(screen.getByRole("link", { name: "View provider" })).toHaveAttribute(
      "href",
      "/basics/experts/provider-001",
    );
    expect(screen.queryByRole("link", { name: "View requirement" })).not.toBeInTheDocument();
  });

  it("opens the chat modal when clicking the Message button in EngagementDetail and closes on dismiss", async () => {
    render(<EngagementDetail engagementId="engagement-001" />);

    // Wait for page to load
    expect(await screen.findByRole("heading", { name: "Project & Plan Details" })).toBeInTheDocument();

    // Modal should initially be closed
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Click the Message button
    const messageBtn = screen.getByRole("button", { name: /Message/i });
    fireEvent.click(messageBtn);

    // Chat modal dialog should now be open
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(/Chat with Axis Structures/i)).toBeInTheDocument();

    // Close the modal using close button
    const closeBtn = screen.getByRole("button", { name: "Close chat modal" });
    fireEvent.click(closeBtn);

    // Modal should now be closed
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders EngagementChatModal directly and allows typing and sending messages", () => {
    const engagement = MOCK_BASICS_ENGAGEMENTS[0];
    const provider = MOCK_BASICS_PROVIDERS[0];
    const onClose = vi.fn();

    render(
      <EngagementChatModal
        isOpen={true}
        onClose={onClose}
        engagement={engagement}
        provider={provider}
      />,
    );

    // Header title with provider name
    expect(screen.getByRole("heading", { name: `Chat with ${provider.name}` })).toBeInTheDocument();

    // Clean empty state description
    expect(screen.getByText(new RegExp(`Direct conversation with ${provider.name}`, "i"))).toBeInTheDocument();

    // Composer interaction: message input and send
    const textarea = screen.getByPlaceholderText(`Message ${provider.name}...`);
    fireEvent.change(textarea, {
      target: { value: "Can we review the latest structural load calculation sheet today?" },
    });

    const sendBtn = screen.getByRole("button", { name: "Send message" });
    expect(sendBtn).not.toBeDisabled();
    fireEvent.click(sendBtn);

    // Verify newly sent message is added into the feed
    expect(
      screen.getByText("Can we review the latest structural load calculation sheet today?"),
    ).toBeInTheDocument();
    expect(screen.getByText("Just now")).toBeInTheDocument();
  });

  it("opens ApproveDeliverableModal on clicking Approve in Deliverables tab and configures Project Drive access", async () => {
    mockCurrentTab = "deliverables";
    render(<EngagementDetail engagementId="engagement-001" />);

    // Wait for deliverables list to load and find Approve button
    const approveButtons = await screen.findAllByRole("button", { name: /^Approve$/i });
    expect(approveButtons.length).toBeGreaterThan(0);
    fireEvent.click(approveButtons[0]);

    // ApproveDeliverableModal should open
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Approve & Add to Project Drive" })).toBeInTheDocument();

    // Verify "Add to Project Drive" checkbox & folder selector
    expect(screen.getByRole("checkbox", { name: "Add to Project Drive" })).toBeChecked();
    expect(screen.getByText("Destination Folder:")).toBeInTheDocument();

    // Verify "Give Access To" section with category filters
    expect(screen.getByRole("heading", { name: "Give Access To" })).toBeInTheDocument();
    expect(screen.getAllByText(/Workers in Hands/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Team Members/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Other Teams/i).length).toBeGreaterThan(0);

    // Verify specific stakeholders are listed
    expect(screen.getByText("Ramesh Kumar")).toBeInTheDocument();
    expect(screen.getAllByText("Arjun Mehta").length).toBeGreaterThan(0);
    expect(screen.getByText("Studio Elemental")).toBeInTheDocument();

    // Click "Approve & Add to Drive"
    const confirmBtn = screen.getByRole("button", { name: /Approve & Add to Drive/i });
    fireEvent.click(confirmBtn);

    // Verify modal closes and feedback notice appears
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(
      await screen.findByText(/approved and added to Project Drive/i),
    ).toBeInTheDocument();
  });
});
