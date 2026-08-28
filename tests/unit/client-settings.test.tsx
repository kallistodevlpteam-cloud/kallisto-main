import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ClientSettingsHub } from "@/features/client/settings/components/client-settings-hub";
import {
  ClientSettingsNavigation,
  CLIENT_SETTINGS_CATEGORIES,
} from "@/features/client/settings/components/client-settings-navigation";
import { ProfileSettingsSection } from "@/features/client/settings/components/sections/profile-settings-section";
import { SecuritySettingsSection } from "@/features/client/settings/components/sections/security-settings-section";
import { ProjectPreferencesSection } from "@/features/client/settings/components/sections/project-preferences-section";
import { ProjectAccessSection } from "@/features/client/settings/components/sections/project-access-section";
import { NotificationsSection } from "@/features/client/settings/components/sections/notifications-section";
import { CommunicationSection } from "@/features/client/settings/components/sections/communication-section";
import { PaymentMethodsSection } from "@/features/client/settings/components/sections/payment-methods-section";
import { BillingInvoicesSection } from "@/features/client/settings/components/sections/billing-invoices-section";
import { AppearanceSection } from "@/features/client/settings/components/sections/appearance-section";
import { LanguageRegionSection } from "@/features/client/settings/components/sections/language-region-section";
import { PrivacyDataSection } from "@/features/client/settings/components/sections/privacy-data-section";
import { AccountPopover } from "@/components/layout/account-popover";

vi.mock("next/navigation", () => ({
  usePathname: () => "/client/settings/profile",
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}));

describe("Kallisto Client Settings System", () => {
  afterEach(() => {
    cleanup();
  });
  it("renders ClientSettingsHub with all 5 approved categories", () => {
    render(<ClientSettingsHub />);
    expect(screen.getByRole("heading", { level: 1, name: "Settings" })).toBeDefined();
    expect(screen.getByText("Account")).toBeDefined();
    expect(screen.getByText("Projects")).toBeDefined();
    expect(screen.getByText("Communication")).toBeDefined();
    expect(screen.getByText("Payments")).toBeDefined();
    expect(screen.getByText("Preferences")).toBeDefined();

    expect(screen.getByText("Profile")).toBeDefined();
    expect(screen.getByText("Security & Login")).toBeDefined();
    expect(screen.getByText("Project Preferences")).toBeDefined();
    expect(screen.getByText("Project Access")).toBeDefined();
    expect(screen.getByText("Notifications")).toBeDefined();
    expect(screen.getByText("Payment Methods")).toBeDefined();
    expect(screen.getByText("Billing & Invoices")).toBeDefined();
    expect(screen.getByText("Privacy & Data")).toBeDefined();
  });

  it("verifies CLIENT_SETTINGS_CATEGORIES config contains all 11 subroutes", () => {
    const allHrefs = CLIENT_SETTINGS_CATEGORIES.flatMap((c) => c.items.map((i) => i.href));
    expect(allHrefs).toEqual([
      "/client/settings/profile",
      "/client/settings/security",
      "/client/settings/project-preferences",
      "/client/settings/project-access",
      "/client/settings/notifications",
      "/client/settings/communication",
      "/client/settings/payment-methods",
      "/client/settings/billing",
      "/client/settings/appearance",
      "/client/settings/language-region",
      "/client/settings/privacy",
    ]);
  });

  it("renders ClientSettingsNavigation with active link highlighting", () => {
    render(<ClientSettingsNavigation />);
    const profileLink = screen.getByRole("link", { name: /profile/i });
    expect(profileLink.getAttribute("aria-current")).toBe("page");
  });

  it("renders ProfileSettingsSection and saves updated information", () => {
    render(<ProfileSettingsSection />);
    expect(screen.getByText("Personal Profile")).toBeDefined();
    const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement;
    expect(nameInput.value).toBe("Ananya Sharma");

    fireEvent.change(nameInput, { target: { value: "Ananya Kumar Sharma" } });
    expect(nameInput.value).toBe("Ananya Kumar Sharma");

    const saveBtn = screen.getByRole("button", { name: /save changes/i });
    fireEvent.click(saveBtn);
    expect(screen.getByText("Profile saved")).toBeDefined();
  });

  it("renders SecuritySettingsSection with 2FA and active devices", () => {
    render(<SecuritySettingsSection />);
    expect(screen.getByText("Security & Credentials")).toBeDefined();
    expect(screen.getByText("MacBook Pro 16”")).toBeDefined();
    expect(screen.getByText("This Device")).toBeDefined();
    expect(screen.getByText("Two-Factor Authentication (2FA)")).toBeDefined();
  });

  it("renders ProjectPreferencesSection with primary project selector", () => {
    render(<ProjectPreferencesSection />);
    expect(screen.getByText("Primary / Default Project Context")).toBeDefined();
    expect(screen.getByText(/Nila Residence/)).toBeDefined();
    expect(screen.getByText("Currency Format")).toBeDefined();
    expect(screen.getByText("Measurement System")).toBeDefined();

    const saveBtn = screen.getByRole("button", { name: /save preferences/i });
    fireEvent.click(saveBtn);
    expect(screen.getByText("Preferences saved")).toBeDefined();
  });

  it("renders ProjectAccessSection with member roles and allows filtering", () => {
    render(<ProjectAccessSection />);
    expect(screen.getByText("Project Collaborators & Access")).toBeDefined();
    expect(screen.getByText("Saran Kumar")).toBeDefined();
    expect(screen.getByText("Arjun Menon")).toBeDefined();
    expect(screen.getByText("Priya Sharma")).toBeDefined();

    const inviteBtn = screen.getByRole("button", { name: /invite person/i });
    fireEvent.click(inviteBtn);
    expect(screen.getByText("Invite Project Collaborator")).toBeDefined();
  });

  it("renders NotificationsSection with delivery channels and categories", () => {
    render(<NotificationsSection />);
    expect(screen.getByText("Delivery Channels")).toBeDefined();
    expect(screen.getByText("In-App Notifications")).toBeDefined();
    expect(screen.getByText("WhatsApp Notifications")).toBeDefined();
    expect(screen.getByText("Email Summaries")).toBeDefined();
    expect(screen.getByText("Project Alerts")).toBeDefined();
    expect(screen.getByText("Payments & Escrow")).toBeDefined();
  });

  it("renders CommunicationSection and allows changing preferred contact channel", () => {
    render(<CommunicationSection />);
    expect(screen.getByText("Preferred Contact Method")).toBeDefined();
    expect(screen.getByText("Service Provider Communication Permissions")).toBeDefined();
    expect(screen.getByText("In-App Only (Strict)")).toBeDefined();

    const saveBtn = screen.getByRole("button", { name: /save communication preferences/i });
    fireEvent.click(saveBtn);
    expect(screen.getByText("Preferences saved")).toBeDefined();
  });

  it("renders PaymentMethodsSection with UPI, Card, and Bank account items", () => {
    render(<PaymentMethodsSection />);
    expect(screen.getByText("Payment Methods")).toBeDefined();
    expect(screen.getByText("UPI Virtual Payment Address")).toBeDefined();
    expect(screen.getByText("HDFC Regalia Visa Platinum")).toBeDefined();
    expect(screen.getByText("Default")).toBeDefined();

    const addBtn = screen.getByRole("button", { name: /add payment method/i });
    fireEvent.click(addBtn);
    expect(screen.getAllByText("Add Payment Method").length).toBeGreaterThanOrEqual(1);
  });

  it("renders BillingInvoicesSection with invoice list and INR amounts", () => {
    render(<BillingInvoicesSection />);
    expect(screen.getByText("Billing Statements & Invoices")).toBeDefined();
    expect(screen.getByText("KAL-INV-2026-089")).toBeDefined();
    expect(screen.getByText("1,50,000")).toBeDefined();
    expect(screen.getAllByText("Paid & Settled").length).toBeGreaterThan(0);
  });

  it("renders AppearanceSection with theme and density controls", () => {
    render(<AppearanceSection />);
    expect(screen.getByText("Color Theme")).toBeDefined();
    expect(screen.getByText("Light Mode")).toBeDefined();
    expect(screen.getByText("Dark Mode")).toBeDefined();
    expect(screen.getByText("Interface Density")).toBeDefined();
  });

  it("renders LanguageRegionSection with locale formats", () => {
    render(<LanguageRegionSection />);
    expect(screen.getByText("Language & Region")).toBeDefined();
    expect(screen.getByText("English (India)")).toBeDefined();
    expect(screen.getByText("India (IN)")).toBeDefined();
    expect(screen.getByText("India Standard Time (IST · GMT+5:30)")).toBeDefined();
  });

  it("renders PrivacyDataSection with Odin AI intelligence context transparency", () => {
    render(<PrivacyDataSection />);
    expect(screen.getByText("Odin & AI Intelligence Context")).toBeDefined();
    expect(screen.getByText("Project-Aware Context")).toBeDefined();
    expect(screen.getByText("Document & Drawing Analysis")).toBeDefined();
    expect(screen.getByText("Danger Zone")).toBeDefined();
    expect(screen.getByText("Delete Kallisto Account")).toBeDefined();
  });

  it("renders AccountPopover with Client Settings options when on client route", () => {
    // Note that usePathname mock returns "/client/settings/profile"
    render(
      <AccountPopover
        isOpen={true}
        onClose={() => {}}
        consoleState={{
          activeUser: { role: "client" },
          activeEnvironment: "production",
        } as any}
        onOpenDevConsole={() => {}}
      />
    );

    expect(screen.getByRole("button", { name: /profile/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /security and login/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /project preferences/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /project access/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /payment methods/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /billing and invoices/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /help and support/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /sign out/i })).toBeDefined();
  });
});
