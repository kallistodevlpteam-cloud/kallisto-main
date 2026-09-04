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
    expect(screen.getByRole("tab", { name: "Availability" })).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Request Deployment" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Request Crew" })).toHaveAttribute("href", "/hands/trades/crew-masons-01/request");
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

  it("renders friendly fallback for non-existent crew ID", () => {
    render(<TradeCrewDetail crewId="invalid-crew-id" />);

    expect(screen.getByText("Trade Crew Not Found")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Return to Trade Directory" })).toBeInTheDocument();
  });
});
