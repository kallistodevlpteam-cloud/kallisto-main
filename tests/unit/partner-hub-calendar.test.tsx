import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { HubCalendarWorkspace } from "@/partner-app/hub/components/hub-calendar-workspace";

// Mock next/navigation router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    forward: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/partner/hub/calendar",
  useSearchParams: () => new URLSearchParams(),
}));

describe("HubCalendarWorkspace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders Calendar header, weekday columns, and plotted order items", () => {
    render(<HubCalendarWorkspace />);

    // Header title (July 2026 reference)
    expect(screen.getByRole("heading", { name: "July 2026", level: 2 })).toBeInTheDocument();

    // Weekday columns starting Monday
    expect(screen.getByText("Mon")).toBeInTheDocument();
    expect(screen.getByText("Tue")).toBeInTheDocument();
    expect(screen.getByText("Sun")).toBeInTheDocument();

    // Plotted order (e.g. ORD-1024)
    expect(screen.getByTestId("calendar-order-ORD-1024")).toBeInTheDocument();

    // Day schedule panel
    expect(screen.getByText("DAY SCHEDULE")).toBeInTheDocument();
  });

  it("filters orders when toggling bottom category checkboxes", () => {
    render(<HubCalendarWorkspace />);

    const requestCheckbox = screen.getByText("Meetings");
    fireEvent.click(requestCheckbox);

    // Unchecking Meetings should hide ORD-1024 (which is mapped to requests/meetings)
    expect(screen.queryByTestId("calendar-order-ORD-1024")).not.toBeInTheDocument();

    // Toggle back on
    fireEvent.click(requestCheckbox);
    expect(screen.getByTestId("calendar-order-ORD-1024")).toBeInTheDocument();
  });

  it("filters calendar orders by search query in top bar", () => {
    render(<HubCalendarWorkspace />);

    const searchInput = screen.getByPlaceholderText(/Search.../i);
    fireEvent.change(searchInput, { target: { value: "Greenwood" } });

    // Should display ORD-1024 (Greenwood Villa) and hide other orders
    expect(screen.getByTestId("calendar-order-ORD-1024")).toBeInTheDocument();
    expect(screen.queryByTestId("calendar-order-ORD-1022")).not.toBeInTheDocument();
  });

  it("expands order in the right Day Schedule panel and navigates to orders workspace", () => {
    render(<HubCalendarWorkspace />);

    const orderPill = screen.getByTestId("calendar-order-ORD-1024");
    fireEvent.click(orderPill);

    // Day Schedule panel displays contractor and action button
    expect(screen.getByText("Arun Kumar (Lead Contractor)")).toBeInTheDocument();
    const openBtn = screen.getByText(/Open in Orders Workspace/i);
    fireEvent.click(openBtn);

    expect(mockPush).toHaveBeenCalledWith("/partner/hub/orders?orderId=ORD-1024");
  });

  it("navigates months using previous and next arrow buttons", () => {
    render(<HubCalendarWorkspace />);

    expect(screen.getByRole("heading", { name: "July 2026", level: 2 })).toBeInTheDocument();

    const nextBtn = screen.getByLabelText("Next month");
    fireEvent.click(nextBtn);
    expect(screen.getByRole("heading", { name: "August 2026", level: 2 })).toBeInTheDocument();

    const prevBtn = screen.getByLabelText("Previous month");
    fireEvent.click(prevBtn);
    expect(screen.getByRole("heading", { name: "July 2026", level: 2 })).toBeInTheDocument();
  });
});
