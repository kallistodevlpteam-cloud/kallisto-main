import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProposalCreationModal } from "@/features/studio/components/proposal-creation-modal";

describe("ProposalCreationModal Component", () => {
  beforeEach(() => {
    cleanup();
  });

  const mockEnquiry = {
    id: "enq-1",
    enquiryRef: "ENQ-2026-001",
    title: "Villa Design Consultation",
    clientName: "Greenleaf Spaces",
    projectType: "Commercial Interior",
    location: "Bengaluru",
    budget: "₹40L – ₹60L",
    timeline: "Within 6 Months",
    notes: "Office Interior Fit-out for Greenleaf Spaces",
    status: "new" as const,
    receivedAt: "2026-07-23T16:15:00.000Z",
    siteImagesCount: 4,
    documentsCount: 2,
    hasFeasibilityReport: false,
    priority: "medium" as const,
    source: "Website",
  };

  it("renders compact project summary modal with required fields", () => {
    render(
      <ProposalCreationModal
        isOpen={true}
        enquiry={mockEnquiry}
        existingDraftExists={false}
        onContinueDrafting={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    // Modal title
    expect(screen.getByRole("heading", { level: 2, name: "Create Proposal" })).toBeInTheDocument();

    // Status text
    expect(screen.getByText(/Hive Studio will use this enquiry information to prepare the proposal draft/i)).toBeInTheDocument();

    // Summary fields
    expect(screen.getByText("Villa Design Consultation")).toBeInTheDocument();
    expect(screen.getByText("Greenleaf Spaces")).toBeInTheDocument();
    expect(screen.getByText("Commercial Interior")).toBeInTheDocument();
    expect(screen.getByText("Bengaluru")).toBeInTheDocument();
    expect(screen.getByText("₹40L – ₹60L")).toBeInTheDocument();
    expect(screen.getByText("Within 6 Months")).toBeInTheDocument();

    // Subtitle text
    expect(screen.getByText("Review the enquiry context before continuing in Hive Studio.")).toBeInTheDocument();

    // CTA buttons
    expect(screen.getByRole("button", { name: "Continue in Hive Studio" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("renders 'Continue Existing Draft' when draft already exists", () => {
    render(
      <ProposalCreationModal
        isOpen={true}
        enquiry={mockEnquiry}
        existingDraftExists={true}
        onContinueDrafting={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText("An active draft already exists for this enquiry.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue Existing Draft" })).toBeInTheDocument();
  });

  it("calls onContinueDrafting when primary button is clicked", () => {
    const handleContinue = vi.fn();
    render(
      <ProposalCreationModal
        isOpen={true}
        enquiry={mockEnquiry}
        onContinueDrafting={handleContinue}
        onCancel={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Continue in Hive Studio" }));
    expect(handleContinue).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when Cancel button is clicked or Escape key is pressed", () => {
    const handleCancel = vi.fn();
    render(
      <ProposalCreationModal
        isOpen={true}
        enquiry={mockEnquiry}
        onContinueDrafting={vi.fn()}
        onCancel={handleCancel}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(handleCancel).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(handleCancel).toHaveBeenCalledTimes(2);
  });
});
