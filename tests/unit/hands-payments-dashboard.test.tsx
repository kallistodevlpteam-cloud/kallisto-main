import React from "react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { HandsPaymentsDashboard } from "@/partner-app/hands/components/payments/hands-payments-dashboard";

describe("HandsPaymentsDashboard Component", () => {
  afterEach(cleanup);

  it("renders page header and 4-card KPI financial overview", () => {
    render(<HandsPaymentsDashboard />);

    // Header
    expect(screen.getByRole("heading", { level: 1, name: /Payments & Settlements/i })).toBeDefined();

    // 4 KPI Cards
    expect(screen.getAllByText("Provider Settled").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Pending & In Processing").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Labor Wages Paid").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Daily Wage Commitment").length).toBeGreaterThan(0);
  });

  it("renders Trade Wage Rate Schedule card with trades, rates, and blended daily total", () => {
    render(<HandsPaymentsDashboard />);

    // Check Trade Wage Rate Schedule card header
    expect(screen.getAllByText(/Trade Wage Rate Schedule/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Assigned Personnel/i).length).toBeGreaterThan(0);

    // Columns
    expect(screen.getAllByText("Trade Category").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Worker Count").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Daily Rate / Head").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Daily Wage Cost").length).toBeGreaterThan(0);

    // Total row
    expect(screen.getAllByText("Total Daily Wage Commitment").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Blended Daily Total").length).toBeGreaterThan(0);
  });

  it("renders two separate tables with proper headings", () => {
    render(<HandsPaymentsDashboard />);

    // Table 1: Provider Payments
    const table1Heading = screen.getByRole("heading", { level: 2, name: /^Provider Payments$/i });
    expect(table1Heading).toBeDefined();
    expect(screen.getByText(/Contract milestone advances, weekly deployment cycle disbursements/i)).toBeDefined();

    // Verify detailed scope description is shown instead of generic "Disbursed to: Labor Contractor"
    expect(screen.getByText(/Initial mobilization advance paid to labor contractor/i)).toBeDefined();
    expect(screen.queryByText(/Disbursed to:\s*Labor Contractor/i)).toBeNull();

    // Table 2: Labor Payments
    const table2Heading = screen.getByRole("heading", { level: 2, name: /^Labor Payments$/i });
    expect(table2Heading).toBeDefined();
    expect(screen.getByText(/Direct worker wage payouts, daily trade allowances/i)).toBeDefined();
  });

  it("filters Provider table records when searching or clicking status pills", () => {
    render(<HandsPaymentsDashboard />);

    const searchInput = screen.getByLabelText(/Search provider contractor settlements/i) as HTMLInputElement;

    // Search for a milestone advance
    fireEvent.change(searchInput, { target: { value: "Advance" } });
    expect(screen.getByText(/Milestone Deployment Advance/i)).toBeDefined();

    // Clear search using the X button
    const clearBtn = screen.getByLabelText(/Clear provider search/i);
    fireEvent.click(clearBtn);
    expect(searchInput.value).toBe("");
  });

  it("filters Labor table records when searching or clicking status pills", () => {
    render(<HandsPaymentsDashboard />);

    const searchInput = screen.getByLabelText(/Search contractor labor wages/i) as HTMLInputElement;

    // Search for a worker
    fireEvent.change(searchInput, { target: { value: "Arun" } });
    expect(screen.getByText(/Arun S/i)).toBeDefined();

    // Clear search using the X button
    const clearBtn = screen.getByLabelText(/Clear labor search/i);
    fireEvent.click(clearBtn);
    expect(searchInput.value).toBe("");
  });

  it("supports independent 5-row pagination for both tables", () => {
    render(<HandsPaymentsDashboard />);

    // Provider table pagination
    const providerNext = screen.getByLabelText(/Next provider page/i) as HTMLButtonElement;
    const providerPrev = screen.getByLabelText(/Previous provider page/i) as HTMLButtonElement;

    expect(providerPrev.disabled).toBe(true);
    expect(providerNext.disabled).toBe(false);

    fireEvent.click(providerNext);
    expect(providerPrev.disabled).toBe(false);

    // Labor table pagination
    const laborNext = screen.getByLabelText(/Next labor page/i) as HTMLButtonElement;
    const laborPrev = screen.getByLabelText(/Previous labor page/i) as HTMLButtonElement;

    expect(laborPrev.disabled).toBe(true);
    expect(laborNext.disabled).toBe(false);

    fireEvent.click(laborNext);
    expect(laborPrev.disabled).toBe(false);
  });

  it("opens and closes voucher / slip modal from both tables", () => {
    render(<HandsPaymentsDashboard />);

    // 1. Open voucher from Provider table
    const providerVoucherBtn = screen.getAllByTitle(/View voucher for/i)[0];
    fireEvent.click(providerVoucherBtn);
    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText(/Settlement Voucher & Payment Receipt/i)).toBeDefined();

    // Close
    const closeBtn1 = screen.getByRole("button", { name: /Close dialog/i });
    fireEvent.click(closeBtn1);
    expect(screen.queryByRole("dialog")).toBeNull();

    // 2. Open wage slip from Labor table
    const laborSlipBtn = screen.getAllByTitle(/View wage slip for/i)[0];
    fireEvent.click(laborSlipBtn);
    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText(/Labor Wage Payout Slip/i)).toBeDefined();

    // Close
    const closeBtn2 = screen.getByRole("button", { name: /Close dialog/i });
    fireEvent.click(closeBtn2);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
