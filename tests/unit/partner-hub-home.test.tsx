import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { HubHomeOverviewWorkspace } from "@/partner-app/hub/components/hub-home-overview-workspace";

// Mock next/navigation router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    forward: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/partner/hub",
  useSearchParams: () => new URLSearchParams(),
}));

describe("HubHomeOverviewWorkspace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders context header with Good morning greeting, Hub Status, toggle switch and metadata bar", () => {
    render(<HubHomeOverviewWorkspace />);

    expect(screen.getByRole("heading", { name: /Good morning, BuildMart/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Fulfilment Zone:/i)).toBeInTheDocument();
    expect(screen.getByText(/Kochi · 25 km/i)).toBeInTheDocument();

    // Toggle switch button in metadata bar
    const toggleBtn = screen.getByRole("switch", { name: /Toggle Hub Operational Status/i });
    expect(toggleBtn).toBeInTheDocument();
    expect(toggleBtn).toHaveAttribute("aria-checked", "true");
    expect(screen.getAllByText("Active").length).toBeGreaterThanOrEqual(1);

    // Toggle to inactive
    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute("aria-checked", "false");
    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });

  it("renders Today's Business Snapshot cards and navigates to respective filtered views", () => {
    render(<HubHomeOverviewWorkspace />);

    expect(screen.getByText("New Requests")).toBeInTheDocument();
    expect(screen.getByText("Active Orders")).toBeInTheDocument();
    expect(screen.getByText("Active Order Value")).toBeInTheDocument();
    expect(screen.getByText("Pending Payments")).toBeInTheDocument();

    expect(screen.getByText("₹4.8L")).toBeInTheDocument();
    expect(screen.getByText("₹1.2L")).toBeInTheDocument();

    // Click on Pending Payments card
    const pendingPaymentsCard = screen.getByText("Pending Payments").closest('div[role="button"]');
    expect(pendingPaymentsCard).not.toBeNull();
    if (pendingPaymentsCard) {
      fireEvent.click(pendingPaymentsCard);
      expect(mockPush).toHaveBeenCalledWith("/partner/hub/payments");
    }
  });

  it("renders Orders Requiring Attention list and allows direct order drill-down", () => {
    render(<HubHomeOverviewWorkspace />);

    expect(screen.getByText("Orders Requiring Attention")).toBeInTheDocument();
    expect(screen.getByText("ORD-1024")).toBeInTheDocument();
    expect(screen.getByText("· Greenwood Villa")).toBeInTheDocument();
    expect(screen.getByText("ORD-1021")).toBeInTheDocument();
    expect(screen.getByText("ORD-1018")).toBeInTheDocument();

    // Click View All orders
    const viewAllBtn = screen.getAllByRole("button", { name: /View All/i })[0];
    fireEvent.click(viewAllBtn);
    expect(mockPush).toHaveBeenCalledWith("/partner/hub/orders");

    // Click on an order action button
    const reviewOrderBtn = screen.getByRole("button", { name: "Review" });
    fireEvent.click(reviewOrderBtn);
    expect(mockPush).toHaveBeenCalledWith("/partner/hub/orders?orderId=ORD-1024");
  });

  it("renders Product Alerts list and enables navigation to product catalog", () => {
    render(<HubHomeOverviewWorkspace />);

    expect(screen.getByText("Product Alerts")).toBeInTheDocument();
    expect(screen.getByText("Tata TMT 16mm")).toBeInTheDocument();
    expect(screen.getByText("Low availability · 3.2 MT remaining")).toBeInTheDocument();
    expect(screen.getByText("Asian Paints Apex")).toBeInTheDocument();
    expect(screen.getByText("UltraTech Cement")).toBeInTheDocument();

    const viewProductsBtn = screen.getByRole("button", { name: "View Products" });
    fireEvent.click(viewProductsBtn);
    expect(mockPush).toHaveBeenCalledWith("/partner/hub/products");
  });

  it("renders Odin Hub Intelligence panel with recommendation and interactive quick queries", () => {
    render(<HubHomeOverviewWorkspace />);

    expect(screen.getByRole("heading", { name: "Odin", level: 4 })).toBeInTheDocument();
    expect(screen.getByText("Hub Intelligence")).toBeInTheDocument();
    expect(screen.getByText("RECOMMENDED NEXT STEP")).toBeInTheDocument();
    expect(
      screen.getByText("Review ORD-1024 before its required delivery date.")
    ).toBeInTheDocument();

    // Click Review Order in Odin panel
    const reviewOrderOdinBtn = screen.getByRole("button", { name: /Review Order/i });
    fireEvent.click(reviewOrderOdinBtn);
    expect(mockPush).toHaveBeenCalledWith("/partner/hub/orders?orderId=ORD-1024");

    // Ask Odin a question via composer
    const input = screen.getByPlaceholderText(/Describe material/i);
    fireEvent.change(input, { target: { value: "Which order is most urgent?" } });
    const sendBtn = screen.getByRole("button", { name: /Send query/i });
    fireEvent.click(sendBtn);
    expect(
      screen.getByText(/ORD-1024 for Greenwood Villa is your most urgent item/i)
    ).toBeInTheDocument();
  });
});
