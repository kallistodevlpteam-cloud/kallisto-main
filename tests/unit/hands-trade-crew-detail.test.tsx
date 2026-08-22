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
    expect(screen.getAllByText("950").length).toBeGreaterThan(0);

    // Section nav
    expect(screen.getByRole("tab", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Capabilities" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Reviews" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Availability" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Request Deployment" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Request Crew" })).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Crew" })).not.toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Deployments" })).not.toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Documents" })).not.toBeInTheDocument();
  });

  it("renders structured technical capabilities step cards", () => {
    render(<TradeCrewDetail crewId="crew-masons-01" />);

    // Switch to Capabilities tab
    fireEvent.click(screen.getByRole("tab", { name: "Capabilities" }));
    expect(screen.getByText(/Structural RCC Masonry/i)).toBeInTheDocument();
    expect(screen.getByText(/AAC & Solid Concrete Blockwork/i)).toBeInTheDocument();
  });

  it("renders client reviews breakdown with verified testimonials", () => {
    render(<TradeCrewDetail crewId="crew-masons-01" />);

    // Switch to Client Reviews tab
    fireEvent.click(screen.getByRole("tab", { name: "Reviews" }));
    expect(screen.getByRole("heading", { level: 2, name: /Our Customer Reviews/i })).toBeInTheDocument();
    expect(screen.getByText("Marco MacGyver")).toBeInTheDocument();
    expect(screen.getByText("Robert Karmazov")).toBeInTheDocument();
    expect(screen.getByText("36 Reviews")).toBeInTheDocument();
    expect(screen.getByText("5 Reviews")).toBeInTheDocument();
  });

  it("renders availability calendar and schedule", () => {
    render(<TradeCrewDetail crewId="crew-masons-01" />);

    // Switch to Availability tab
    fireEvent.click(screen.getByRole("tab", { name: "Availability" }));
    expect(screen.getByText("August 2026")).toBeInTheDocument();
    expect(screen.getByText("Next available:")).toBeInTheDocument();
    expect(screen.getByText("28 August 2026")).toBeInTheDocument();
  });

  it("calculates live dynamic cost estimate in the request deployment tab and opens deployment request drawer", () => {
    render(<TradeCrewDetail crewId="crew-masons-01" />);

    // Switch to Request Deployment tab
    fireEvent.click(screen.getByRole("tab", { name: "Request Deployment" }));
    expect(screen.getByRole("heading", { level: 2, name: "Request Workforce Deployment" })).toBeInTheDocument();
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
