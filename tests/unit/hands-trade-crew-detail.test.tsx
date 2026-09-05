import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { TradeCrewDetail } from "@/features/hands/components/trade-crew-detail";

// Mock next/navigation
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
    expect(
      screen.getByRole("heading", { level: 1, name: /Master Masons & Brickwork Team/i })
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Civil & Masonry/i).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/Verified trade crew/i)).toBeInTheDocument();
    expect(screen.getAllByText("950").length).toBeGreaterThan(0);

    // Modern Segmented Tabs
    expect(screen.getByRole("tab", { name: /Services/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Overview/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Experience & Credentials/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Reviews/i })).toBeInTheDocument();
  });

  it("renders services packages with Select Plan buttons and allows selecting a plan interactively", () => {
    render(<TradeCrewDetail crewId="crew-masons-01" />);

    // Package titles
    expect(screen.getByRole("heading", { level: 2, name: /Standard Gang/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /Fast-Track Squad/i })).toBeInTheDocument();

    // Both buttons should say "Select Plan" when entering without pre-selected packageId
    const selectButtons = screen.getAllByRole("link", { name: "Select Plan" });
    expect(selectButtons.length).toBe(2);

    // Clicking the first plan's button selects it and changes text to "Selected ✓"
    fireEvent.click(selectButtons[0]);
    expect(screen.getByRole("link", { name: "Selected ✓" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Select Plan" }).length).toBe(1);
  });

  it("respects pre-selected packageId prop when supplied", () => {
    render(<TradeCrewDetail crewId="crew-masons-01" packageId="scaled-squad" />);

    expect(screen.getByRole("link", { name: "Selected ✓" })).toHaveAttribute(
      "href",
      expect.stringContaining("packageId=scaled-squad")
    );
  });

  it("switches to Overview tab and renders structured crew specs", () => {
    render(<TradeCrewDetail crewId="crew-masons-01" />);

    fireEvent.click(screen.getByRole("tab", { name: /Overview/i }));
    expect(screen.getByRole("heading", { level: 2, name: /Trade Specializations/i })).toBeInTheDocument();
    expect(screen.getByText("Primary Trade")).toBeInTheDocument();
  });

  it("switches to Reviews tab and renders customer testimonials", () => {
    render(<TradeCrewDetail crewId="crew-masons-01" />);

    fireEvent.click(screen.getByRole("tab", { name: /Reviews/i }));
    expect(screen.getByRole("heading", { level: 2, name: "Reviews" })).toBeInTheDocument();
    expect(screen.getByText("Marco MacGyver")).toBeInTheDocument();
  });

  it("renders friendly fallback for non-existent crew ID", () => {
    render(<TradeCrewDetail crewId="invalid-crew-id" />);

    expect(screen.getByText("Trade Crew Not Found")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Return to Trade Directory" })).toBeInTheDocument();
  });
});
