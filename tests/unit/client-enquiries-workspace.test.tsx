import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { EnquiriesWorkspace } from "@/features/enquiries/components/enquiries-workspace";
import type { EnquiryRecord } from "@/features/enquiries/types/enquiry.types";

const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  usePathname: () => "/client/enquiries",
  useSearchParams: () => new URLSearchParams(),
}));

const MOCK_CLIENT_ENQUIRIES: EnquiryRecord[] = [
  {
    id: "enq-client-1",
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
    isNew: true,
    nextAction: {
      type: "review_enquiry",
      label: "Review enquiry",
      dueAt: "2026-07-23T18:00:00.000Z",
    },
  },
  {
    id: "enq-client-2",
    title: "Calicut Retail Boutique Studio",
    clientName: "Kochi Lifestyle Retail",
    requirementSummary: "Retail boutique studio design & fit-out",
    location: "Calicut, Kerala",
    projectType: "retail",
    stage: "clarification",
    status: "needs_attention",
    source: "direct",
    receivedAt: "2026-07-22T14:00:00.000Z",
    budgetMin: 2500000,
    budgetMax: 3500000,
    budget: "₹25L - ₹35L",
    thumbnailUrl: "/assets/nila-thumb2.jpg",
    isNew: false,
    nextAction: {
      type: "request_clarification",
      label: "Request clarification",
      dueAt: "2026-07-24T12:00:00.000Z",
    },
  },
];

describe("Client Enquiries Workspace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (window as unknown as { __TEST_ENQUIRIES__?: EnquiryRecord[] }).__TEST_ENQUIRIES__ =
      MOCK_CLIENT_ENQUIRIES;
  });

  afterEach(() => {
    delete (window as unknown as { __TEST_ENQUIRIES__?: EnquiryRecord[] }).__TEST_ENQUIRIES__;
    cleanup();
  });

  it("renders enquiries list with title, search input, and status tabs in client perspective", () => {
    render(<EnquiriesWorkspace basePath="/client/enquiries" />);

    expect(screen.getByText("My Enquiries")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/search by project, provider, or location/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /new/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /history/i })).toBeInTheDocument();
  });

  it("renders enquiry table rows with client perspective provider subtitle and next step", () => {
    render(<EnquiriesWorkspace basePath="/client/enquiries" />);

    expect(screen.getAllByText("Modern Coastal Villa Fit-out").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Kochi, Kerala/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Reviewing with Architect").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Residential").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("₹40L - ₹60L").length).toBeGreaterThanOrEqual(1);

    expect(screen.getAllByText("Calicut Retail Boutique Studio").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Clarification Requested").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Retail").length).toBeGreaterThanOrEqual(1);
  });

  it("navigates to /client/enquiries/[enquiryId] when clicking an enquiry row", () => {
    render(<EnquiriesWorkspace basePath="/client/enquiries" />);

    const rows = screen.getAllByLabelText("Open Modern Coastal Villa Fit-out enquiry details");
    fireEvent.click(rows[0]);

    expect(mockPush).toHaveBeenCalledWith("/client/enquiries/enq-client-1");
  });

  it("opens three-dot actions menu and links to client enquiry view path", () => {
    render(<EnquiriesWorkspace basePath="/client/enquiries" />);

    const moreBtn = screen.getByLabelText("More actions for Modern Coastal Villa Fit-out");
    fireEvent.click(moreBtn);

    const viewLink = screen.getByRole("menuitem", { name: /view enquiry & proposal/i });
    expect(viewLink).toHaveAttribute("href", "/client/enquiries/enq-client-1");
  });
});
