import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { HandsWorkersWorkspace } from "@/partner-app/hands/components/workers/hands-workers-workspace";
import { PartnerAuthProvider } from "@/partner-app/auth/context/partner-auth-context";
import { PartnerAuthService } from "@/partner-app/auth/services/partner-auth-service";

const mockPush = vi.fn();

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/partner/hands/workers",
  useRouter: () => ({
    push: mockPush,
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

  it("navigates to worker detail page when clicking a worker row", () => {
    render(
      <PartnerAuthProvider>
        <HandsWorkersWorkspace />
      </PartnerAuthProvider>
    );

    const rajeshRow = screen.getByText("Rajesh Kumar");
    fireEvent.click(rajeshRow);

    // Should navigate to full worker detail page
    expect(mockPush).toHaveBeenCalledWith("/partner/hands/workers/KH-W-1042");
  });

  it("opens manual labor registration form modal overlay on clicking '+ Add Worker'", () => {
    render(
      <PartnerAuthProvider>
        <HandsWorkersWorkspace />
      </PartnerAuthProvider>
    );

    const addWorkerBtn = screen.getByRole("button", { name: /Add Worker/i });
    fireEvent.click(addWorkerBtn);

    expect(screen.getByRole("dialog", { name: /Basic info/i })).toBeDefined();
    expect(screen.getAllByText("Basic info").length).toBeGreaterThan(0);
    expect(screen.getByPlaceholderText(/Yashna Dev/i)).toBeDefined();
  });

  it("expands Odin Workforce Intelligence panel when clicking 'Ask Odin'", () => {
    render(
      <PartnerAuthProvider>
        <HandsWorkersWorkspace />
      </PartnerAuthProvider>
    );

    const askOdinBtn = screen.getAllByRole("button", { name: /Ask Odin/i })[0];
    fireEvent.click(askOdinBtn);

    expect(screen.getByText("Odin")).toBeDefined();
    expect(screen.getByText("Workforce AI")).toBeDefined();
    expect(screen.getByText("Find Available Workers")).toBeDefined();
    expect(screen.getByText("Match Workers to Requests")).toBeDefined();
    expect(
      screen.getByPlaceholderText("Ask Odin or type to register a worker...")
    ).toBeDefined();
  });
});
