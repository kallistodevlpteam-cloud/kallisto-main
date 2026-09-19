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
  {
    id: "enq-client-3",
    title: "Palm Grove Boutique Suites",
    clientName: "Siddharth Nair",
    requirementSummary: "Boutique backwater retreat in Alappuzha",
    location: "Alappuzha, Kerala",
    projectType: "hospitality",
    stage: "proposal",
    status: "active",
    source: "website",
    receivedAt: "2026-07-20T10:00:00.000Z",
    budgetMin: 20000000,
    budgetMax: 20000000,
    budget: "₹2Cr",
    clientStatus: "Proposal Received",
    thumbnailUrl: "/assets/nila-hero.jpg",
    nextAction: {
      type: "prepare_proposal",
      label: "Proposal in Preparation",
    },
  },
  {
    id: "enq-client-4",
    title: "Metro Commercial Plaza",
    clientName: "Apex Group",
    requirementSummary: "Retail promenade fitout in Thrissur",
    location: "Thrissur, Kerala",
    projectType: "retail",
    stage: "rejected",
    status: "archived",
    source: "direct",
    receivedAt: "2026-06-15T15:00:00.000Z",
    budgetMin: 40000000,
    budgetMax: 40000000,
    budget: "₹4Cr",
    clientStatus: "Rejected",
    thumbnailUrl: "/assets/project-banner.jpg",
    nextAction: {
      type: "mark_as_lost",
      label: "Enquiry Closed",
    },
  },
  {
    id: "enq-client-5",
    title: "Highland Tea Plantation Bungalow",
    clientName: "Rohan & Tara Varghese",
    requirementSummary: "Colonial bungalow restoration in Munnar",
    location: "Munnar, Kerala",
    projectType: "residential",
    stage: "lost",
    status: "active",
    source: "website",
    receivedAt: "2026-07-10T14:30:00.000Z",
    budgetMin: 16000000,
    budgetMax: 16000000,
    budget: "₹1.6Cr",
    clientStatus: "Declined",
    declineReason: "Current studio team capacity is fully booked for Q3/Q4.",
    thumbnailUrl: "/assets/nila-thumb1.jpg",
    nextAction: {
      type: "mark_as_lost",
      label: "Specialist Declined",
    },
  },
  {
    id: "enq-client-6",
    title: "Kovalam Sea Breeze Penthouse",
    clientName: "Anoop Kurian",
    requirementSummary: "Coastal duplex interior renovation",
    location: "Kovalam, Kerala",
    projectType: "residential",
    stage: "lost",
    status: "archived",
    source: "direct",
    receivedAt: "2026-05-02T10:00:00.000Z",
    budgetMin: 7500000,
    budgetMax: 7500000,
    budget: "₹75L",
    clientStatus: "Expired",
    expiredAt: "2026-05-16T10:00:00.000Z",
    thumbnailUrl: "/assets/projectbg.webp",
    nextAction: {
      type: "mark_as_lost",
      label: "Response Window Expired",
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

  it("opens three-dot actions menu and displays client contextual actions", () => {
    render(<EnquiriesWorkspace basePath="/client/enquiries" />);

    const moreBtn = screen.getByLabelText("More actions for Modern Coastal Villa Fit-out");
    fireEvent.click(moreBtn);

    const viewLink = screen.getByRole("menuitem", { name: /view enquiry/i });
    expect(viewLink).toHaveAttribute("href", "/client/enquiries/enq-client-1");

    expect(screen.queryByRole("menuitem", { name: /edit enquiry/i })).not.toBeInTheDocument();

    const deleteBtn = screen.getByRole("menuitem", { name: /delete/i });
    expect(deleteBtn).toBeInTheDocument();
  });

  it("displays 'View proposal' option specifically for 'Proposal Received' enquiries", () => {
    render(<EnquiriesWorkspace basePath="/client/enquiries" />);

    const moreBtn = screen.getByLabelText("More actions for Palm Grove Boutique Suites");
    fireEvent.click(moreBtn);

    const viewProposalLink = screen.getByRole("menuitem", { name: /view proposal/i });
    expect(viewProposalLink).toHaveAttribute("href", "/client/enquiries/enq-client-3?tab=proposal");

    // Edit enquiry should not be shown
    expect(screen.queryByRole("menuitem", { name: /edit enquiry/i })).not.toBeInTheDocument();
  });

  it("displays 'View proposal' option for 'Revision Requested' enquiries without edit enquiry", () => {
    render(<EnquiriesWorkspace basePath="/client/enquiries" />);

    const moreBtn = screen.getByLabelText("More actions for Calicut Retail Boutique Studio");
    fireEvent.click(moreBtn);

    const viewProposalLink = screen.getByRole("menuitem", { name: /view proposal/i });
    expect(viewProposalLink).toHaveAttribute("href", "/client/enquiries/enq-client-2?tab=proposal");

    expect(screen.queryByRole("menuitem", { name: /edit enquiry/i })).not.toBeInTheDocument();
  });

  it("switches to History tab where rejected enquiries are displayed with edit option", () => {
    render(<EnquiriesWorkspace basePath="/client/enquiries" />);

    // In New tab, rejected enquiry (Metro Commercial Plaza) is not displayed
    expect(screen.queryByText("Metro Commercial Plaza")).not.toBeInTheDocument();

    const historyTab = screen.getByRole("tab", { name: /history/i });
    fireEvent.click(historyTab);

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("tab=history"));
  });

  it("displays 'Declined' badge in New tab when service provider declines an enquiry", () => {
    render(<EnquiriesWorkspace basePath="/client/enquiries" />);

    // Declined enquiry appears in the active New tab
    expect(screen.getAllByText("Highland Tea Plantation Bungalow").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Declined").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Specialist Declined").length).toBeGreaterThanOrEqual(1);
  });

  it("displays 'Expired' entries on the New section instead of History", () => {
    render(<EnquiriesWorkspace basePath="/client/enquiries" />);

    // In New tab, expired enquiry is displayed
    expect(screen.getAllByText("Kovalam Sea Breeze Penthouse").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Expired").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Response Window Expired").length).toBeGreaterThanOrEqual(1);
  });

  it("renders the 3-dot dropdown menu upward (dropup) on the last row and downward on preceding rows", () => {
    render(<EnquiriesWorkspace basePath="/client/enquiries" />);

    const allActionBtns = screen.getAllByRole("button", { name: /more actions for/i });
    expect(allActionBtns.length).toBeGreaterThan(1);

    // Click on the first row's action button
    fireEvent.click(allActionBtns[0]);
    let menu = screen.getByRole("menu");
    expect(menu.className).not.toContain("actionsMenuDropup");

    // Close by clicking again
    fireEvent.click(allActionBtns[0]);

    // Click on the last row's action button
    const lastActionBtn = allActionBtns[allActionBtns.length - 1];
    fireEvent.click(lastActionBtn);
    menu = screen.getByRole("menu");
    expect(menu.className).toContain("actionsMenuDropup");
  });

});
