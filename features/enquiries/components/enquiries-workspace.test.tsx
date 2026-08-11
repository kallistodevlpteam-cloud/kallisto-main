import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EnquiriesWorkspace } from "./enquiries-workspace";
import type { EnquiryRecord } from "../types/enquiry.types";

const mockPush = vi.fn();
const mockReplace = vi.fn();
let mockSearchParamsVal = new URLSearchParams();

vi.mock("next/navigation", () => ({
  usePathname: () => "/enquiries",
  useRouter: () => ({
    push: (url: string) => mockPush(url),
    replace: (url: string) => mockReplace(url),
    prefetch: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => mockSearchParamsVal,
}));

describe("EnquiriesWorkspace Component", () => {
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
              createdAt: "2026-07-01T00:00:00.000Z",
              updatedAt: "2026-07-01T00:00:00.000Z",
            },
            {
              id: 3,
              projectName: "Lakeview Residence",
              projectType: "Residential",
              buildingType: "House",
              projectCharacter: "enq",
              newConstructionOrRenovation: null,
              purposeOfProject: null,
              briefDescription: null,
              coverImageUrl: null,
              clientName: "Priya Sharma",
              place: "Bengaluru",
              createdAt: "2026-07-02T00:00:00.000Z",
              updatedAt: "2026-07-02T00:00:00.000Z",
            },
          ],
        }),
        { headers: { "Content-Type": "application/json" } }
      )
    );
  };

  beforeEach(() => {
    mockPush.mockClear();
    mockReplace.mockClear();
    mockSearchParamsVal = new URLSearchParams();
  });

  afterEach(() => {
    fetchMock?.mockRestore();
    cleanup();
    delete (window as unknown as { __TEST_ENQUIRIES__?: EnquiryRecord[] }).__TEST_ENQUIRIES__;
  });

  it("renders enquiries page header, controls, headers and backend list rows successfully", async () => {
    mockEnqProjects();
    render(<EnquiriesWorkspace />);

    // Page Header elements
    expect(screen.getByRole("heading", { level: 1, name: "Enquiries" })).toBeInTheDocument();
    expect(
      screen.getByText("Review and qualify incoming project leads and requirement reviews.")
    ).toBeInTheDocument();

    // Local Search Input
    expect(
      screen.getByPlaceholderText("Search by client, requirement or location...")
    ).toBeInTheDocument();

    // Check table headers
    expect(screen.getAllByText("Enquiry")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Next Action")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Received")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Budget")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Project Type")[0]).toBeInTheDocument();

    // Rows are driven by the backend enq projects only
    await waitFor(() => {
      expect(screen.getAllByText("Sunrise Villa").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Lakeview Residence").length).toBeGreaterThan(0);
    });
  }, 10000);

  it("renders a Sort button for the Received header and handles click toggles", async () => {
    mockEnqProjects();
    render(<EnquiriesWorkspace />);

    await waitFor(() => {
      expect(screen.getAllByLabelText("Sort enquiries by received date").length).toBeGreaterThan(0);
    });

    const sortBtn = screen.getAllByLabelText("Sort enquiries by received date")[0];
    expect(sortBtn).toBeInTheDocument();

    fireEvent.click(sortBtn);

    // Default sort is received_desc, so toggle should switch to received_asc
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("sort=received_asc"));
  }, 10000);

  it("renders the empty state and clear filters button when search query has no matches", async () => {
    fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ status: "ok", projects: [] }),
        { headers: { "Content-Type": "application/json" } }
      )
    );
    mockSearchParamsVal = new URLSearchParams("q=nonexistent_project");

    render(<EnquiriesWorkspace />);

    await waitFor(() => {
      expect(screen.getByText("No enquiries found")).toBeInTheDocument();
    });

    const clearBtn = screen.getByRole("button", { name: /clear filters/i });
    expect(clearBtn).toBeInTheDocument();

    fireEvent.click(clearBtn);

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("/enquiries"));
  }, 15000);

  it("handles loading skeleton state properly", () => {
    render(<EnquiriesWorkspace isLoading={true} />);

    // Header should still render
    expect(screen.getAllByText("Enquiry")[0]).toBeInTheDocument();

    // Verify view CTAs are NOT rendered during loading
    expect(screen.queryAllByText("Villa Design Consultation")).toHaveLength(0);
  }, 10000);

  it("drives the enquiry list from the enq projects returned by the backend", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
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
                createdAt: "2026-07-01T00:00:00.000Z",
                updatedAt: "2026-07-01T00:00:00.000Z",
              },
            ],
          }),
          { headers: { "Content-Type": "application/json" } }
        )
      );

    render(<EnquiriesWorkspace />);

    await waitFor(() => {
      expect(screen.getAllByText("Sunrise Villa").length).toBeGreaterThan(0);
    });

    fetchMock.mockRestore();
  }, 10000);
});
