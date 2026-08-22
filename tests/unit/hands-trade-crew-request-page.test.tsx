import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { TradeCrewRequestPage } from "@/features/hands/components/trade-crew-request-page";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  usePathname: () => "/hands/trades/crew-masons-01/request",
  useSearchParams: () => new URLSearchParams(""),
}));

describe("TradeCrewRequestPage Component", () => {
  beforeEach(() => {
    cleanup();
  });

  it("renders dedicated request page with crew summary and back navigation link", () => {
    render(<TradeCrewRequestPage crewId="crew-masons-01" />);

    // Header & Navigation
    expect(screen.getByRole("heading", { level: 1, name: "Request Workforce Deployment" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Back to Master Masons & Brickwork Team/i })).toHaveAttribute(
      "href",
      "/hands/trades/crew-masons-01"
    );

    // Crew summary banner
    expect(screen.getByRole("heading", { level: 2, name: /Master Masons & Brickwork Team/i })).toBeInTheDocument();
    expect(screen.getByText("Civil & Masonry")).toBeInTheDocument();
    expect(screen.getByText("950")).toBeInTheDocument();
  });

  it("calculates live cost estimates when modifying duration and crew size, and opens request drawer", () => {
    render(<TradeCrewRequestPage crewId="crew-masons-01" />);

    // Initial default: 8 workers × ₹950 × 15 days = ₹114,000
    expect(screen.getByText("₹1,14,000")).toBeInTheDocument();

    // Increase duration by 1 day
    const increaseDurationBtn = screen.getByRole("button", { name: "Increase duration by 1 day" });
    fireEvent.click(increaseDurationBtn);

    // 8 workers × ₹950 × 16 days = ₹121,600
    expect(screen.getByText("₹1,21,600")).toBeInTheDocument();

    // Increase crew size by 1 worker
    const increaseCrewBtn = screen.getByRole("button", { name: "Increase crew size by 1 worker" });
    fireEvent.click(increaseCrewBtn);

    // 9 workers × ₹950 × 16 days = ₹136,800
    expect(screen.getByText("₹1,36,800")).toBeInTheDocument();

    // Click quick preset chip 6d
    const sixDayChip = screen.getByRole("button", { name: "6d (1 Wk)" });
    fireEvent.click(sixDayChip);

    // 9 workers × ₹950 × 6 days = ₹51,300
    expect(screen.getByText("₹51,300")).toBeInTheDocument();

    // Click Request Deployment button
    const requestBtn = screen.getByRole("button", { name: "Request Deployment" });
    fireEvent.click(requestBtn);

    // Verify WorkforceRequestDrawer modal opened
    expect(screen.getByRole("heading", { level: 2, name: "Request workforce" })).toBeInTheDocument();
  });

  it("renders fallback when crew does not exist", () => {
    render(<TradeCrewRequestPage crewId="non-existent-crew" />);

    expect(screen.getByRole("heading", { level: 1, name: "Crew Not Found" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Return to Trade Directory" })).toBeInTheDocument();
  });
});
