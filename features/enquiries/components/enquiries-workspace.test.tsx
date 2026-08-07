import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EnquiriesWorkspace } from "./enquiries-workspace";

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
  beforeEach(() => {
    mockPush.mockClear();
    mockReplace.mockClear();
    mockSearchParamsVal = new URLSearchParams();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders enquiries page header, controls, headers and list rows successfully", () => {
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

    // Check mock items
    expect(screen.getAllByText("Villa Design Consultation")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Office Interior Fit-out")[0]).toBeInTheDocument();
  }, 10000);

  it("renders a Sort button for the Received header and handles click toggles", () => {
    render(<EnquiriesWorkspace />);

    const sortBtn = screen.getAllByLabelText("Sort enquiries by received date")[0];
    expect(sortBtn).toBeInTheDocument();

    fireEvent.click(sortBtn);

    // Default sort is received_desc, so toggle should switch to received_asc
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("sort=received_asc"));
  }, 10000);

  it("renders the empty state and clear filters button when search query has no matches", () => {
    mockSearchParamsVal = new URLSearchParams("q=nonexistent_project");

    render(<EnquiriesWorkspace />);

    expect(screen.getByText("No enquiries found")).toBeInTheDocument();

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
});
