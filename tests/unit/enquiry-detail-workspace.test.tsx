import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { EnquiryDetailWorkspace, EnquiryActionsCard } from "@/features/enquiries/detail/components/enquiry-detail-workspace";

vi.mock("next/navigation", () => ({
  usePathname: () => "/enquiries/enq-1",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("EnquiryDetailWorkspace Component", () => {
  it("renders enquiry details with individual project architecture and 3 CTA buttons", () => {
    render(<EnquiryDetailWorkspace enquiryId="enq-1" />);

    // Check main title heading
    expect(screen.getByRole("heading", { level: 1, name: "Villa Design Consultation" })).toBeInTheDocument();

    // Check action buttons
    expect(screen.getByRole("button", { name: /Accept/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Reject Enquiry/i })).toBeInTheDocument();
  });

  it("renders error state when enquiry is not found", () => {
    render(<EnquiryDetailWorkspace enquiryId="invalid-id" />);
    expect(screen.getByText("Enquiry not found")).toBeInTheDocument();
  });

  it("handles image file selection for clarification attachments", () => {
    const { container } = render(<EnquiryDetailWorkspace enquiryId="enq-1" />);

    const fileInput = container.querySelector("input[data-testid='clarification-image-input']") as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute("accept", "image/*");
  });

  it("renders workflow buttons based on proposal status after acceptance", () => {
    // 1. Before proposal creation -> Create Proposal (primary) + Schedule Consultation, NO Convert to Project
    const { rerender } = render(
      <EnquiryActionsCard stage="accepted" onStageChange={() => {}} initialProposalStatus="none" />
    );
    expect(screen.getByRole("button", { name: /Create Proposal/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Schedule Consultation/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Convert to Project/i })).not.toBeInTheDocument();

    // 2. Draft/Sent proposal -> View Proposal + Schedule Consultation, status badge visible, NO Convert to Project
    rerender(
      <EnquiryActionsCard stage="accepted" onStageChange={() => {}} initialProposalStatus="sent" />
    );
    expect(screen.getByText("Proposal: Sent")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /View Proposal/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Schedule Consultation/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Convert to Project/i })).not.toBeInTheDocument();

    // 3. Accepted proposal -> Convert to Project (primary) + View Proposal + Schedule Consultation
    rerender(
      <EnquiryActionsCard stage="accepted" onStageChange={() => {}} initialProposalStatus="accepted" />
    );
    expect(screen.getByText("Proposal: Accepted")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Convert to Project/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /View Proposal/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Schedule Consultation/i })).toBeInTheDocument();
  });
});
