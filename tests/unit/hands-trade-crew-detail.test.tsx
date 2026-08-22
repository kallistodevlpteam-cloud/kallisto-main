import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { TradeCrewDetail } from "@/features/hands/components/trade-crew-detail";

// Mock next/navigation and next/image
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  usePathname: () => "/hands/trades/crew-masons-01",
  useSearchParams: () => new URLSearchParams(""),
}));

describe("TradeCrewDetail Component", () => {
  beforeEach(() => {
    cleanup();
  });
  it("renders crew identity header with verified badge, stats, and rate", () => {
    render(<TradeCrewDetail crewId="crew-masons-01" />);

    // Identity
    expect(screen.getByRole("heading", { level: 1, name: /Master Masons & Brickwork Team/i })).toBeInTheDocument();
    expect(screen.getAllByText("Civil & Masonry").length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/Verified/i)).toBeInTheDocument();
    expect(screen.getByText("14 yrs")).toBeInTheDocument();
    expect(screen.getByText("64+")).toBeInTheDocument();
    expect(screen.getByText("₹950")).toBeInTheDocument();

    // Section nav
    expect(screen.getByRole("tab", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Capabilities" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Crew" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Deployments" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Reviews" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Availability" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Documents" })).toBeInTheDocument();
  });

  it("renders structured crew composition and capabilities with specializations", () => {
    render(<TradeCrewDetail crewId="crew-masons-01" />);

    // Crew composition
    expect(screen.getByText("Total Workforce")).toBeInTheDocument();
    expect(screen.getByText("Site Lead")).toBeInTheDocument();
    expect(screen.getByText("Masons")).toBeInTheDocument();
    expect(screen.getByText("Helpers")).toBeInTheDocument();

    // Capabilities
    expect(screen.getByText("Brick Masonry")).toBeInTheDocument();
    expect(screen.getByText("Block Masonry")).toBeInTheDocument();
    expect(screen.getByText("Residential")).toBeInTheDocument();
    expect(screen.getByText("Commercial")).toBeInTheDocument();
    expect(screen.getByText("High-rise")).toBeInTheDocument();
  });

  it("renders evidence-based recent deployments and client reviews breakdown", () => {
    render(<TradeCrewDetail crewId="crew-masons-01" />);

    // Recent Deployments
    expect(screen.getByText("Residential Villa — Kakkanad")).toBeInTheDocument();
    expect(screen.getByText("Commercial Building — Kochi")).toBeInTheDocument();

    // Client Reviews
    expect(screen.getByText("Reliability")).toBeInTheDocument();
    expect(screen.getByText("Quality")).toBeInTheDocument();
    expect(screen.getByText("Timeliness")).toBeInTheDocument();
    expect(screen.getByText("Communication")).toBeInTheDocument();
  });

  it("renders availability calendar and verification trust checklist", () => {
    render(<TradeCrewDetail crewId="crew-masons-01" />);

    // Availability
    expect(screen.getByText("August 2026")).toBeInTheDocument();
    expect(screen.getByText("Next available:")).toBeInTheDocument();
    expect(screen.getByText("28 August 2026")).toBeInTheDocument();

    // Verification
    expect(screen.getByText("Identity verified")).toBeInTheDocument();
    expect(screen.getByText("Crew lead verified")).toBeInTheDocument();
    expect(screen.getByText("Experience verified")).toBeInTheDocument();
    expect(screen.getByText("Documents verified")).toBeInTheDocument();
  });

  it("calculates live dynamic cost estimate in the sticky request panel and opens deployment request drawer", () => {
    render(<TradeCrewDetail crewId="crew-masons-01" />);

    // Sticky Request Panel: 8 workers × ₹950 × 15 days = ₹114,000
    expect(screen.getByRole("heading", { level: 2, name: "Request This Crew" })).toBeInTheDocument();
    expect(screen.getByText("₹1,14,000")).toBeInTheDocument();

    // Increase duration by 1 day
    const increaseDurationBtn = screen.getByRole("button", { name: "Increase duration by 1 day" });
    fireEvent.click(increaseDurationBtn);

    // 8 workers × ₹950 × 16 days = ₹121,600
    expect(screen.getByText("₹1,21,600")).toBeInTheDocument();

    // Click Request Deployment
    const requestBtn = screen.getByRole("button", { name: "Request Deployment" });
    fireEvent.click(requestBtn);

    // Verify WorkforceRequestDrawer opened
    expect(screen.getByRole("heading", { level: 2, name: "Request workforce" })).toBeInTheDocument();
  });

  it("renders friendly fallback for non-existent crew ID", () => {
    render(<TradeCrewDetail crewId="invalid-crew-id" />);

    expect(screen.getByText("Crew Profile Not Found")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Return to Trade Directory" })).toBeInTheDocument();
  });
});
