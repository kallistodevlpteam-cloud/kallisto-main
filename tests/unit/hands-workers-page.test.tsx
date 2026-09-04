import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { HandsWorkersWorkspace } from "@/partner-app/hands/components/workers/hands-workers-workspace";
import { PartnerAuthProvider } from "@/partner-app/auth/context/partner-auth-context";
import { PartnerAuthService } from "@/partner-app/auth/services/partner-auth-service";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/partner/hands/workers",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("Kallisto Hands - Workers Page & Directory", () => {
  beforeEach(async () => {
    cleanup();
    if (typeof window !== "undefined") {
      window.localStorage.setItem("kallisto_auth_token", "test-partner-token");
    }
    PartnerAuthService.clearSession();
    await PartnerAuthService.authenticate({
      emailOrPhone: "vikram@kallisto-hands.com",
      partnerType: "HANDS",
    });
  });

  afterEach(cleanup);

  it("renders page header with clean title, subtitle, and primary '+ Add Worker' CTA", () => {
    render(
      <PartnerAuthProvider>
        <HandsWorkersWorkspace />
      </PartnerAuthProvider>
    );

    expect(screen.getByRole("heading", { name: "Workers" })).toBeDefined();
    expect(
      screen.getByText("Manage your registered workforce, skills and availability.")
    ).toBeDefined();
    expect(screen.getByRole("button", { name: /Add Worker/i })).toBeDefined();
  });

  it("renders compact operational workforce summary cards (170, 128, 42, 8)", () => {
    render(
      <PartnerAuthProvider>
        <HandsWorkersWorkspace />
      </PartnerAuthProvider>
    );

    expect(screen.getAllByText("170").length).toBeGreaterThan(0);
    expect(screen.getByText("Total Workers")).toBeDefined();

    expect(screen.getByText("128")).toBeDefined();
    expect(screen.getByText("On Assignment")).toBeDefined();

    expect(screen.getAllByText("42").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Available Today").length).toBeGreaterThan(0);

    expect(screen.getByText("8")).toBeDefined();
    expect(screen.getAllByText("Needs Attention").length).toBeGreaterThan(0);
  });

  it("renders workforce table with columns and initial worker rows", () => {
    render(
      <PartnerAuthProvider>
        <HandsWorkersWorkspace />
      </PartnerAuthProvider>
    );

    expect(screen.getByText("Worker")).toBeDefined();
    expect(screen.getAllByText("Trade").length).toBeGreaterThan(0);
    expect(screen.getByText("Level")).toBeDefined();
    expect(screen.queryByText("Action")).toBeNull();

    expect(screen.getByText("Rajesh Kumar")).toBeDefined();
    expect(screen.getByText("KH-W-1042")).toBeDefined();
    expect(screen.getAllByText("Mason").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Senior").length).toBeGreaterThan(0);
    expect(screen.getAllByText("8 Years").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Available").length).toBeGreaterThan(0);

    expect(screen.getByText("Arun S")).toBeDefined();
    expect(screen.getByText("Greenwood Villa")).toBeDefined();
  });

  it("filters workers in real-time by search query keyword", () => {
    render(
      <PartnerAuthProvider>
        <HandsWorkersWorkspace />
      </PartnerAuthProvider>
    );

    const searchInput = screen.getByPlaceholderText(
      "Search workers by name, trade or worker ID..."
    );
    fireEvent.change(searchInput, { target: { value: "Rajesh" } });

    expect(screen.getByText("Rajesh Kumar")).toBeDefined();
    expect(screen.queryByText("Arun S")).toBeNull();
  });

  it("filters workers by trade dropdown selection", () => {
    render(
      <PartnerAuthProvider>
        <HandsWorkersWorkspace />
      </PartnerAuthProvider>
    );

    const tradeBtn = screen.getByRole("button", { name: /Filter by Trade/i });
    fireEvent.click(tradeBtn);

    const electricianOption = screen.getByRole("button", { name: "Electrician" });
    fireEvent.click(electricianOption);

    expect(screen.getByText("Arun S")).toBeDefined();
    expect(screen.queryByText("Rajesh Kumar")).toBeNull();
  });

  it("opens worker profile pop-up card modal when clicking a worker row", () => {
    render(
      <PartnerAuthProvider>
        <HandsWorkersWorkspace />
      </PartnerAuthProvider>
    );

    const rajeshRow = screen.getByText("Rajesh Kumar");
    fireEvent.click(rajeshRow);

    // Profile pop-up card contents
    expect(screen.getByRole("dialog", { name: /Worker Profile: Rajesh Kumar/i })).toBeDefined();
    expect(screen.getByText("SKILLS")).toBeDefined();
    expect(screen.getAllByText("Brickwork").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Plastering").length).toBeGreaterThan(0);
    expect(screen.getByText("VERIFICATION")).toBeDefined();
    expect(screen.getByText("CURRENT STATUS")).toBeDefined();
    expect(screen.getByText("RECENT WORK")).toBeDefined();
    expect(screen.getByRole("button", { name: /Assign to Work/i })).toBeDefined();
  });

  it("opens conversational one-by-one worker registration in Odin panel and registers worker", async () => {
    vi.useFakeTimers();
    render(
      <PartnerAuthProvider>
        <HandsWorkersWorkspace />
      </PartnerAuthProvider>
    );

    const addWorkerBtn = screen.getByRole("button", { name: /Add Worker/i });
    fireEvent.click(addWorkerBtn);

    // Q1: Name
    expect(screen.getByText(/What is the worker's/i)).toBeDefined();
    expect(screen.getByText(/Full Name/i)).toBeDefined();

    const input1 = screen.getByPlaceholderText(/Type worker's full name.../i);
    fireEvent.change(input1, { target: { value: "Deepak N" } });
    fireEvent.keyDown(input1, { key: "Enter", code: "Enter" });

    act(() => {
      vi.advanceTimersByTime(350);
    });

    // Q2: Phone
    expect(screen.getByText(/mobile number/i)).toBeDefined();
    const input2 = screen.getByPlaceholderText(/Type mobile number.../i);
    fireEvent.change(input2, { target: { value: "+91 98950 11223" } });
    fireEvent.keyDown(input2, { key: "Enter", code: "Enter" });

    act(() => {
      vi.advanceTimersByTime(350);
    });

    // Q3: Location
    expect(screen.getByText(/Primary Location/i)).toBeDefined();
    const kochiBtn = screen.getByRole("button", { name: "Kochi" });
    fireEvent.click(kochiBtn);

    act(() => {
      vi.advanceTimersByTime(350);
    });

    // Q4: Trade
    expect(screen.getByText(/primary trade/i)).toBeDefined();
    const masonBtn = screen.getByRole("button", { name: "Mason" });
    fireEvent.click(masonBtn);

    act(() => {
      vi.advanceTimersByTime(350);
    });

    // Q5: Experience
    expect(screen.getByText(/years of experience/i)).toBeDefined();
    const expBtn = screen.getByRole("button", { name: /5 Years/i });
    fireEvent.click(expBtn);

    act(() => {
      vi.advanceTimersByTime(350);
    });

    // Q6: Daily Wage
    expect(screen.getByText(/Daily Wage/i)).toBeDefined();
    const wageBtn = screen.getByRole("button", { name: /₹950/i });
    fireEvent.click(wageBtn);

    act(() => {
      vi.advanceTimersByTime(350);
    });

    // Review & Confirmation Card
    expect(screen.getByText(/registration review for/i)).toBeDefined();

    const registerBtn = screen.getByRole("button", {
      name: /Confirm & Register Worker/i,
    });
    fireEvent.click(registerBtn);

    expect(screen.getAllByText("Deepak N").length).toBeGreaterThan(0);
    vi.useRealTimers();
  });

  it("renders Odin Workforce Intelligence panel with quick action queries", () => {
    render(
      <PartnerAuthProvider>
        <HandsWorkersWorkspace />
      </PartnerAuthProvider>
    );

    expect(screen.getByText("Odin")).toBeDefined();
    expect(screen.getByText("Workforce AI")).toBeDefined();
    expect(screen.getByText("Find Available Workers")).toBeDefined();
    expect(screen.getByText("Match Workers to Requests")).toBeDefined();
    expect(
      screen.getByPlaceholderText("Ask Odin or type to register a worker...")
    ).toBeDefined();
  });
});
