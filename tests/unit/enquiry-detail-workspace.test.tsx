import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";
import { EnquiryDetailWorkspace, EnquiryActionsCard } from "@/features/enquiries/detail/components/enquiry-detail-workspace";
import { resolveValidTabKey } from "@/features/enquiries/detail/components/enquiry-detail-tabs";
import fs from "node:fs";
import path from "node:path";

afterEach(cleanup);

vi.mock("next/navigation", () => ({
  usePathname: () => "/enquiries/enq-1",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("EnquiryDetailWorkspace Component Architecture & Regression Checks", () => {
  it("does not import dashboard drawer or layout hooks in source code", () => {
    const filePath = path.resolve(process.cwd(), "features/enquiries/detail/components/enquiry-detail-workspace.tsx");
    const fileContent = fs.readFileSync(filePath, "utf8");

    expect(fileContent).not.toContain("useProjectDashboardLayout");
    expect(fileContent).not.toContain("useDrawerBehaviour");
    expect(fileContent).not.toContain("UpdatesDrawerFocusManager");
    expect(fileContent).not.toContain("data-layout-mode");
  });

  it("renders main content and enquiry intelligence aside as direct siblings within enquiryLayout", () => {
    const { container } = render(<EnquiryDetailWorkspace enquiryId="enq-1" />);

    // Check main title heading
    expect(screen.getByRole("heading", { level: 1, name: "Villa Design Consultation" })).toBeInTheDocument();

    const mainElement = container.querySelector("main");
    const asideElement = container.querySelector("aside");

    expect(mainElement).toBeInTheDocument();
    expect(asideElement).toBeInTheDocument();
    expect(mainElement?.nextElementSibling).toBe(asideElement);

    // Verify right rail content
    expect(asideElement).toHaveTextContent("ODIN INSIGHTS");
  });

  it("resolves invalid and missing tab query parameters cleanly to overview", () => {
    expect(resolveValidTabKey(null)).toBe("overview");
    expect(resolveValidTabKey("invalid_tab_name")).toBe("overview");
    expect(resolveValidTabKey("clarifications")).toBe("overview");
  });

  it("renders error state when enquiry is not found", () => {
    render(<EnquiryDetailWorkspace enquiryId="invalid-id" />);
    expect(screen.getByText("Enquiry not found")).toBeInTheDocument();
  });

  it("renders stage-driven workflow buttons appropriately", () => {
    // 1. Idle stage -> Accept + Reject buttons
    const { unmount: unmount1 } = render(
      <EnquiryActionsCard stage="idle" onStageChange={() => {}} />
    );
    expect(screen.getByRole("button", { name: "Accept Enquiry" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reject Enquiry" })).toBeInTheDocument();
    unmount1();

    // 2. Accepted stage + no proposal -> Create Proposal + Schedule Consultation
    const { unmount: unmount2 } = render(
      <EnquiryActionsCard stage="accepted" onStageChange={() => {}} initialProposalStatus="none" />
    );
    expect(screen.getByRole("button", { name: /Create Proposal/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Schedule Consultation/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Convert to Project/i })).not.toBeInTheDocument();
    unmount2();

    // 3. Accepted stage + sent proposal -> View Proposal + Schedule Consultation
    const { unmount: unmount3 } = render(
      <EnquiryActionsCard stage="accepted" onStageChange={() => {}} initialProposalStatus="sent" />
    );
    expect(screen.getByText("Proposal: Sent")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /View Proposal/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Schedule Consultation/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Convert to Project/i })).not.toBeInTheDocument();
    unmount3();

    // 4. Accepted stage + accepted proposal -> Convert to Project + View Proposal
    render(
      <EnquiryActionsCard stage="accepted" onStageChange={() => {}} initialProposalStatus="accepted" />
    );
    expect(screen.getByText("Proposal: Accepted")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Convert to Project/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /View Proposal/i })).toBeInTheDocument();
  });
});
