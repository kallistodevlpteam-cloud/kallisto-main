import React from "react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { HubOrdersWorkspace } from "@/partner-app/hub/components/hub-orders-workspace";

describe("HubOrdersWorkspace", () => {
  beforeEach(() => {
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders page header and segmented workflow tabs", () => {
    render(<HubOrdersWorkspace />);

    expect(screen.getByRole("heading", { name: "Orders" })).toBeDefined();
    expect(screen.getByText(/Active Requisitions & Demands/i)).toBeDefined();

    expect(screen.getByRole("button", { name: /Requests/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Active Orders/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Completed/i })).toBeDefined();
  });

  it("displays 4 summary metrics cards and filters tab on click", () => {
    render(<HubOrdersWorkspace />);

    expect(screen.getByText("New Requests")).toBeDefined();
    expect(screen.getAllByText("Active Orders")[0]).toBeDefined();
    expect(screen.getByText("Active Value")).toBeDefined();
    expect(screen.getAllByText("Need Attention")[0]).toBeDefined();

    // Click Active Orders card
    const activeMetricCard = screen.getAllByText("Active Orders")[0];
    fireEvent.click(activeMetricCard);

    // Table renders
    expect(screen.getAllByText(/ORD-/i)[0]).toBeDefined();
  });

  it("filters orders by search query", () => {
    render(<HubOrdersWorkspace />);

    const searchInput = screen.getByPlaceholderText("Search orders, projects, materials...");
    fireEvent.change(searchInput, { target: { value: "ORD-1024" } });

    expect(screen.getAllByText(/ORD-1024/)[0]).toBeDefined();
    expect(screen.queryByText("ORD-1023")).toBeNull();
  });

  it("opens dedicated order workspace when clicking an order row", () => {
    render(<HubOrdersWorkspace />);

    // Click on ORD-1024 row
    const row = screen.getAllByText("ORD-1024")[0];
    fireEvent.click(row);

    // Should show order header and detail stepper
    expect(screen.getByText("Customer & Site Details")).toBeDefined();
    expect(screen.getByText("Fulfillment Schedule")).toBeDefined();
    expect(screen.getByText(/Material Requirements/i)).toBeDefined();

    // Line items verification
    expect(screen.getByText("UltraTech Super Cement (50kg)")).toBeDefined();
    expect(screen.getByText("Supreme CPVC High-Pressure Pipes 1-inch")).toBeDefined();
    expect(screen.getByText("Requires Sourcing")).toBeDefined();
  });

  it("progresses order through lifecycle state machine and quote builder", () => {
    render(<HubOrdersWorkspace />);

    // Open ORD-1024 order
    fireEvent.click(screen.getAllByText("ORD-1024")[0]);

    // Click Build & Send Quote
    const quoteBtn = screen.getByRole("button", { name: /Build & Send Quote/i });
    fireEvent.click(quoteBtn);

    // Should open quotation builder
    expect(screen.getByText(/Quick Contractor Quotation Builder/i)).toBeDefined();

    // Submit quote
    const sendQuoteBtn = screen.getByRole("button", { name: /Send Official Quote to Contractor/i });
    fireEvent.click(sendQuoteBtn);

    // Now status should be QUOTED and show confirmation action
    expect(screen.getByRole("button", { name: /Confirm Contractor Acceptance/i })).toBeDefined();

    // Confirm acceptance
    fireEvent.click(screen.getByRole("button", { name: /Confirm Contractor Acceptance/i }));

    // Now status should be CONFIRMED and show Start Preparing action
    expect(screen.getByRole("button", { name: /Start Preparing in Depot/i })).toBeDefined();

    // Start preparing
    fireEvent.click(screen.getByRole("button", { name: /Start Preparing in Depot/i }));

    // Now status should be PREPARING and show Dispatch Order action
    const dispatchBtn = screen.getAllByRole("button", { name: /Dispatch Order/i })[0];
    fireEvent.click(dispatchBtn);

    // Now status should be DISPATCHED and show Mark Delivered action
    expect(screen.getByRole("button", { name: /Mark Delivered & Completed/i })).toBeDefined();

    // Complete order
    fireEvent.click(screen.getByRole("button", { name: /Mark Delivered & Completed/i }));

    // Order is now completed
    expect(screen.getByText("Order Fulfilled and Settled")).toBeDefined();
  });
});
