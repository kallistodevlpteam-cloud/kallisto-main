import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { PartnerSettingsHub } from "@/partner-app/settings/partner-settings-hub";
import { PartnerAuthProvider } from "@/partner-app/auth/context/partner-auth-context";

vi.mock("next/navigation", () => ({
  usePathname: () => "/partner/settings",
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}));

describe("Kallisto Hub Partner Settings System", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders PartnerSettingsHub with all approved categories and navigation items", () => {
    render(
      <PartnerAuthProvider>
        <PartnerSettingsHub />
      </PartnerAuthProvider>
    );

    expect(screen.getByRole("heading", { level: 1, name: "Settings" })).toBeDefined();
    expect(screen.getByText("Account")).toBeDefined();
    expect(screen.getByText("Business & Logistics")).toBeDefined();
    expect(screen.getByText("Catalogue & Orders")).toBeDefined();
    expect(screen.getByText("Preferences")).toBeDefined();

    expect(screen.getByRole("button", { name: "Profile" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Security & Login" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Business Profile" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Fulfilment & Delivery Zones" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Catalogue Preferences" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Dispatch Notifications" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Appearance & Region" })).toBeDefined();
  });

  it("switches settings sections interactively on nav click", () => {
    render(
      <PartnerAuthProvider>
        <PartnerSettingsHub />
      </PartnerAuthProvider>
    );

    // Initial section is Personal Profile
    expect(screen.getByRole("heading", { level: 2, name: "Personal Profile" })).toBeDefined();

    // Click Business Profile
    const bizBtn = screen.getByRole("button", { name: /Business Profile/i });
    fireEvent.click(bizBtn);
    expect(
      screen.getByRole("heading", { level: 2, name: /Business Registration & Legal Entity/i })
    ).toBeDefined();

    // Click Fulfilment & Delivery Zones
    const fulBtn = screen.getByRole("button", { name: /Fulfilment & Delivery Zones/i });
    fireEvent.click(fulBtn);
    expect(
      screen.getByRole("heading", { level: 2, name: /Fulfilment & Delivery Zones/i })
    ).toBeDefined();

    // Click Security & Login
    const secBtn = screen.getByRole("button", { name: /Security & Login/i });
    fireEvent.click(secBtn);
    expect(
      screen.getByRole("heading", { level: 2, name: /Security & Login/i })
    ).toBeDefined();
  });

  it("manages multiple bank accounts, shows primary badge, and links new bank account", () => {
    render(
      <PartnerAuthProvider>
        <PartnerSettingsHub />
      </PartnerAuthProvider>
    );

    // Navigate to Business Profile
    const bizBtn = screen.getByRole("button", { name: /Business Profile/i });
    fireEvent.click(bizBtn);

    // Verify multiple bank accounts
    expect(screen.getByText("HDFC Bank")).toBeDefined();
    expect(screen.getByText("ICICI Bank")).toBeDefined();
    expect(screen.getByText("Primary")).toBeDefined();

    // Make ICICI Bank primary
    const setPrimaryBtn = screen.getByRole("button", { name: "Set as Primary" });
    fireEvent.click(setPrimaryBtn);
    expect(screen.getByText("Primary settlement account updated")).toBeDefined();

    // Click Add Bank Account
    const addBankBtn = screen.getByRole("button", { name: /Add Bank Account/i });
    fireEvent.click(addBankBtn);

    expect(screen.getByText("Link New Escrow Settlement Account")).toBeDefined();

    // Fill form
    const accInput = screen.getByPlaceholderText("Enter full 12-16 digit account number");
    fireEvent.change(accInput, { target: { value: "12345678901234" } });

    const ifscInput = screen.getByPlaceholderText("e.g. SBIN0001234");
    fireEvent.change(ifscInput, { target: { value: "SBIN0001234" } });

    // Submit
    const verifyBtn = screen.getByRole("button", { name: /Verify & Link Account/i });
    fireEvent.click(verifyBtn);

    expect(screen.getByText("New bank account linked successfully")).toBeDefined();
    expect(screen.getByText("State Bank of India")).toBeDefined();
  });
});
