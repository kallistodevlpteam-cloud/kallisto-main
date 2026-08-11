import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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
  let fetchMock: ReturnType<typeof vi.spyOn> | undefined;

  const mockEnqProjects = () => {
    fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          status: "ok",
          projects: [
            {
              id: 2,
              projectName: "Sunrise Villa",
              projectType: "Residential",
              buildingType: "Villa",
              projectCharacter: "enq",
              newConstructionOrRenovation: null,
              purposeOfProject: null,
              briefDescription: null,
              coverImageUrl: null,
              clientName: "Rahul Menon",
              place: "Kochi",
estimatedOverallBudget: 25_000_000,
    createdAt: 1782864000,
    updatedAt: 1782864000,
    viewed: false,
            },
          ],
        }),
        { headers: { "Content-Type": "application/json" } }
      )
    );
  };

  const mockEmptyProjects = () => {
    fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ status: "ok", projects: [] }),
        { headers: { "Content-Type": "application/json" } }
      )
    );
  };

  beforeEach(() => {
    fetchMock?.mockRestore();
  });

  afterEach(() => {
    cleanup();
    fetchMock?.mockRestore();
  });

  it("renders backend enquiry details with project architecture and action buttons", async () => {
    mockEnqProjects();
    render(<EnquiryDetailWorkspace enquiryId="prj-2" />);

    // Check main title heading from the backend project name
    await waitFor(
      () => {
        expect(screen.getByRole("heading", { level: 1, name: "Sunrise Villa" })).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    // Check action buttons
    expect(screen.getByRole("button", { name: /Accept/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Reject Enquiry/i })).toBeInTheDocument();
  }, 10000);

  it("marks the backend enquiry as viewed when it opens", async () => {
    mockEnqProjects();
    render(<EnquiryDetailWorkspace enquiryId="prj-2" />);

    await waitFor(
      () => {
        expect(screen.getByRole("heading", { level: 1, name: "Sunrise Villa" })).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    // The detail page must tell the backend the enquiry was opened.
    await waitFor(
      () => {
        expect(fetchMock).toHaveBeenCalledWith(
          "/api/projects/2/view",
          expect.objectContaining({ method: "POST" })
        );
      },
      { timeout: 5000 }
    );
  }, 10000);

  it("renders error state when enquiry is not found in the backend", async () => {
    mockEmptyProjects();
    render(<EnquiryDetailWorkspace enquiryId="enq-1" />);
    await waitFor(
      () => {
        expect(screen.getByText("Enquiry not found")).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  }, 10000);

  it("handles image file selection for clarification attachments", async () => {
    mockEnqProjects();
    const { container } = render(<EnquiryDetailWorkspace enquiryId="prj-2" />);

    await waitFor(
      () => {
        const fileInput = container.querySelector("input[data-testid='clarification-image-input']") as HTMLInputElement;
        expect(fileInput).toBeInTheDocument();
        expect(fileInput).toHaveAttribute("accept", "image/*");
      },
      { timeout: 5000 }
    );
  }, 10000);

  it("drives the project type stat card from the backend project_type", async () => {
    mockEnqProjects();
    render(<EnquiryDetailWorkspace enquiryId="prj-2" />);

    // The detail page fetches backend enq projects; Sunrise Villa is
    // Residential -> the project type stat card shows "Residential".
    await waitFor(
      () => {
        expect(screen.getByText("Residential")).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  }, 10000);

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
