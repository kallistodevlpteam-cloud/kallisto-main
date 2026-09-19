import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ClientProposalModal } from "@/features/enquiries/detail/components/client-proposal-modal";
import { ClientProposalFullSection } from "@/features/enquiries/detail/components/client-proposal-full-section";
import { ClientEnquiryActionsPanel } from "@/features/enquiries/detail/components/client-enquiry-actions-panel";
import { EnquiryDetailWorkspace } from "@/features/enquiries/detail/components/enquiry-detail-workspace";
import type { EnquiryRecord } from "@/features/enquiries/types/enquiry.types";
import { CLIENT_PORTAL_ENQUIRIES } from "@/features/enquiries/services/client-enquiries.mock";

vi.mock("next/navigation", () => ({
  usePathname: () => "/client/enquiries/prj-9",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

const MOCK_SENT_ENQUIRY: EnquiryRecord = {
  id: "prj-1",
  title: "Modern Coastal Villa Fit-out",
  clientName: "Ananya Builders",
  requirementSummary: "Complete luxury coastal villa architecture and fit-out",
  location: "Kochi, Kerala",
  projectType: "residential",
  stage: "new",
  status: "active",
  source: "website",
  receivedAt: "2026-07-23T10:30:00.000Z",
  budgetMin: 4000000,
  budgetMax: 6000000,
  budget: "₹40L - ₹60L",
  thumbnailUrl: "/assets/nila-hero.jpg",
  nextAction: { type: "review_enquiry", label: "Review enquiry" },
  clientStatus: "Sent",
};

const MOCK_PROPOSAL_RECEIVED_ENQUIRY: EnquiryRecord = {
  id: "prj-8",
  title: "Palm Grove Boutique Suites",
  clientName: "Siddharth Nair",
  requirementSummary: "Boutique backwater retreat in Alappuzha",
  location: "Alappuzha, Kerala",
  projectType: "hospitality",
  stage: "proposal",
  status: "active",
  source: "website",
  receivedAt: "2026-07-20T10:00:00.000Z",
  budget: "₹2Cr",
  budgetMin: 20000000,
  budgetMax: 20000000,
  thumbnailUrl: "/assets/nila-hero.jpg",
  nextAction: { type: "prepare_proposal", label: "Proposal in Preparation" },
  clientStatus: "Proposal Received",
};

const MOCK_REVISION_REQUESTED_ENQUIRY: EnquiryRecord = {
  id: "prj-9",
  title: "Cedar Valley Residence",
  clientName: "Rohan & Maya Varma",
  requirementSummary: "Exposed rammed earth walls, north-facing artist studio skylights, and sustainable natural materials.",
  location: "Wayanad, Kerala",
  projectType: "residential",
  stage: "clarification",
  status: "needs_attention",
  source: "website",
  receivedAt: "2026-07-29T10:00:00.000Z",
  budget: "₹95L",
  budgetMin: 9500000,
  budgetMax: 9500000,
  thumbnailUrl: "/assets/nila-hero.jpg",
  nextAction: { type: "request_clarification", label: "Request clarification" },
  clientStatus: "Revision Requested",
};

describe("Client Proposal and Enquiry Actions", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders full proposal section across full width with 4 tabs and provider response", () => {
    const handleDownload = vi.fn();
    const handleAccept = vi.fn();
    const handleSubmitRevision = vi.fn();

    render(
      <ClientProposalFullSection
        enquiry={MOCK_REVISION_REQUESTED_ENQUIRY}
        version="V02"
        isRevision={true}
        onDownloadPdf={handleDownload}
        onAcceptProposal={handleAccept}
        onSubmitRevision={handleSubmitRevision}
      />
    );

    expect(screen.getAllByText(/Cedar Valley Residence Proposal/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText("V02").length).toBeGreaterThan(0);
    expect(screen.getByText("Revision Applied")).toBeDefined();
    expect(screen.getByText(/We have reviewed your request for exposed rammed earth walls/i)).toBeDefined();
    expect(screen.getByText(/Rammed earth wall specifications confirmed/i)).toBeDefined();

    // Verify download button triggers callback
    const downloadBtn = screen.getByLabelText("Download Proposal PDF");
    fireEvent.click(downloadBtn);
    expect(handleDownload).toHaveBeenCalledTimes(1);

    // Verify tabs switch content
    fireEvent.click(screen.getByText("Scope & Deliverables"));
    expect(screen.getByText(/Architectural & Layout Planning/i)).toBeDefined();

    fireEvent.click(screen.getByText("Commercials & Terms"));
    expect(screen.getByText(/Total Estimated Contract Value/i)).toBeDefined();

    fireEvent.click(screen.getByText("Timeline"));
    expect(screen.getByText(/Phase 1: Concept & Spatial Design Blueprints/i)).toBeDefined();
  });

  it("opens inline textbox area when client clicks Request Revision and allows submitting", () => {
    const handleSubmitRevision = vi.fn();

    render(
      <ClientProposalFullSection
        enquiry={MOCK_REVISION_REQUESTED_ENQUIRY}
        version="V02"
        isRevision={true}
        onDownloadPdf={vi.fn()}
        onSubmitRevision={handleSubmitRevision}
      />
    );

    // Initially textarea is not visible
    expect(screen.queryByPlaceholderText(/Please adjust the timeline milestone schedule/i)).toBeNull();

    // Click Request Revision button
    const reqRevBtn = screen.getByText("Request Revision");
    fireEvent.click(reqRevBtn);

    // Textbox area is now displayed inline
    const textarea = screen.getByPlaceholderText(/Please adjust the timeline milestone schedule/i);
    expect(textarea).toBeDefined();

    // Type revision comments and submit
    fireEvent.change(textarea, { target: { value: "Please change the roof tile to terracotta type B." } });
    const submitBtn = screen.getByText("Submit Revision Request");
    fireEvent.click(submitBtn);

    expect(handleSubmitRevision).toHaveBeenCalledWith("Please change the roof tile to terracotta type B.");
  });

  it("renders Client Proposal Modal with structured revision form when requested", () => {
    const handleRevisionModal = vi.fn();
    render(
      <ClientProposalModal
        isOpen={true}
        onClose={vi.fn()}
        enquiry={MOCK_REVISION_REQUESTED_ENQUIRY}
        version="V02"
        isRevision={true}
        onRequestRevision={handleRevisionModal}
      />
    );

    expect(screen.getAllByText("Cedar Valley Residence Proposal").length).toBeGreaterThan(0);
    const modalRevBtn = screen.getByText("Request Revision");
    fireEvent.click(modalRevBtn);

    // Form fields are revealed inside modal
    expect(screen.getByText("Primary reason for revision")).toBeDefined();
    expect(screen.getByText("Specific areas to revise")).toBeDefined();
    expect(screen.getByText("Detailed revision notes")).toBeDefined();

    // Check specific area chips
    expect(screen.getByRole("button", { name: "Scope of Work" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Project Timeline" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Fee & Budget" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Payment Terms" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Design Deliverables" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Materials Specification" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Team & Resources" })).toBeDefined();

    // Click chips to select
    const scopeChip = screen.getByRole("button", { name: "Scope of Work" });
    fireEvent.click(scopeChip);

    // Select primary reason
    const selectEl = screen.getByRole("combobox");
    fireEvent.change(selectEl, { target: { value: "Fee & budget exceeds expectation" } });

    // Textarea with dynamic character counter
    const modalTextarea = screen.getByPlaceholderText(/Be specific about what needs to change and why/i);
    expect(modalTextarea).toBeDefined();

    fireEvent.change(modalTextarea, { target: { value: "Update MEP fixtures to solar compatible." } });
    expect(screen.getByText(/characters · Be clear and specific/i)).toBeDefined();

    const submitModalRevBtn = screen.getByText("Submit Revision Request");
    fireEvent.click(submitModalRevBtn);

    expect(handleRevisionModal).toHaveBeenCalledWith("Update MEP fixtures to solar compatible.");
  });

  it("renders full-width client banner on prj-9 and displays proposal only when View Proposal is clicked", () => {
    render(<EnquiryDetailWorkspace enquiryId="prj-9" isClient={true} />);

    // Top banner is visible with full-width style and status title
    expect(screen.getByText("Revision Requested — Updated Proposal V02 Received")).toBeDefined();
    expect(screen.getByText("Service provider has replied to your clarifications and updated the proposal.")).toBeDefined();

    // The modal is initially closed (modal content not visible)
    expect(screen.queryByText("1. Executive Summary")).toBeNull();

    // Find and click View Proposal (V02)
    const viewProposalBtn = screen.getByRole("button", { name: /View Proposal \(V02\)/i });
    expect(viewProposalBtn).toBeDefined();
    fireEvent.click(viewProposalBtn);

    // Proposal modal is now open and displays the proposal details
    expect(screen.getByText("1. Executive Summary")).toBeDefined();
    expect(screen.getByText(/We have reviewed your request for exposed rammed earth walls/i)).toBeDefined();

    // Inline revision box opens upon clicking Request Revision inside modal
    const requestRevBtn = screen.getByRole("button", { name: /Request Revision/i });
    fireEvent.click(requestRevBtn);

    // Form fields are displayed
    expect(screen.getByText("Primary reason for revision")).toBeDefined();
    expect(screen.getByText("Specific areas to revise")).toBeDefined();

    const textarea = screen.getByPlaceholderText(/Be specific about what needs to change and why/i);
    expect(textarea).toBeDefined();

    fireEvent.change(textarea, { target: { value: "Please update milestone 2 terms." } });
    const submitBtn = screen.getByText("Submit Revision Request");
    fireEvent.click(submitBtn);

    // Modal closes after submitting revision
    expect(screen.queryByText("1. Executive Summary")).toBeNull();
  });

  it("supports swapping between proposal view and revision form overlay cleanly", () => {
    render(
      <ClientProposalModal
        isOpen={true}
        onClose={vi.fn()}
        enquiry={MOCK_REVISION_REQUESTED_ENQUIRY}
        version="V02"
        isRevision={true}
        onRequestRevision={vi.fn()}
      />
    );

    // Proposal is visible
    expect(screen.getByText("1. Executive Summary")).toBeDefined();

    // Click Request Revision to swap to form overlay
    fireEvent.click(screen.getByText("Request Revision"));

    // Revision overlay is displayed
    expect(screen.getByRole("dialog", { name: "Request Proposal Revision" })).toBeDefined();
    expect(screen.getByText("Cancel")).toBeDefined();

    // Click Cancel -> overlay closes, proposal view is restored
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByRole("dialog", { name: "Request Proposal Revision" })).toBeNull();
    expect(screen.getByText("1. Executive Summary")).toBeDefined();

    // Re-open and test close button (X) in overlay header
    fireEvent.click(screen.getByText("Request Revision"));
    expect(screen.getByRole("dialog", { name: "Request Proposal Revision" })).toBeDefined();
    fireEvent.click(screen.getByLabelText("Back to proposal"));
    expect(screen.queryByRole("dialog", { name: "Request Proposal Revision" })).toBeNull();
  });

  it("renders Declined status banner with decline reason and sidebar on prj-20", () => {
    const { unmount } = render(<EnquiryDetailWorkspace enquiryId="prj-20" isClient={true} />);

    // Top banner shows Declined title and reason
    expect(screen.getByText("Enquiry Declined by Service Provider")).toBeDefined();
    expect(screen.getAllByText(/Current studio team capacity is fully booked for Q3\/Q4/i)[0]).toBeDefined();

    unmount();

    // Actions panel also renders Declined status with reason
    const declinedRecord = CLIENT_PORTAL_ENQUIRIES.find((e) => e.id === "prj-20")!;
    render(
      <ClientEnquiryActionsPanel
        enquiry={declinedRecord}
        onOpenProposal={vi.fn()}
        onDownloadProposal={vi.fn()}
      />
    );
    expect(screen.getByText("Specialist unable to accept enquiry")).toBeDefined();
    expect(screen.getAllByText(/Current studio team capacity is fully booked for Q3\/Q4/i)[0]).toBeDefined();
  });

  it("renders Expired status banner on prj-21 when service provider did not respond", () => {
    const { unmount } = render(<EnquiryDetailWorkspace enquiryId="prj-21" isClient={true} />);

    // Top banner shows Expired title and 14-day notice
    expect(screen.getByText("Enquiry Expired — No Response from Service Provider")).toBeDefined();
    expect(screen.getAllByText(/The 14-day response window for this enquiry expired without a provider response/i)[0]).toBeDefined();

    unmount();

    // Actions panel also renders Expired status
    const expiredRecord = CLIENT_PORTAL_ENQUIRIES.find((e) => e.id === "prj-21")!;
    render(
      <ClientEnquiryActionsPanel
        enquiry={expiredRecord}
        onOpenProposal={vi.fn()}
        onDownloadProposal={vi.fn()}
      />
    );
    expect(screen.getByText("Response window expired")).toBeDefined();
  });
});