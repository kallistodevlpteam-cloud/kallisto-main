import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { PartnerAuthProvider } from "@/partner-app/auth/context/partner-auth-context";
import { PartnerSignInCard } from "@/partner-app/auth/components/partner-sign-in-card";
import { PartnerAuthService } from "@/partner-app/auth/services/partner-auth-service";

describe("Partner Authentication & Context", () => {
  beforeEach(() => {
    cleanup();
    PartnerAuthService.clearSession();
  });

  it("renders partner sign-in card with Hands, Hub, and Basics options", () => {
    render(
      <PartnerAuthProvider>
        <PartnerSignInCard />
      </PartnerAuthProvider>
    );

    expect(screen.getByText("Sign In to Partner Portal")).toBeDefined();
    expect(screen.getByText("Partner Workspace")).toBeDefined();
    expect(screen.getAllByText("Hands").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Hub").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Basics").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /Sign In to Kallisto Hands/i })).toBeDefined();
  });

  it("switches partner ecosystem selection dynamically", async () => {
    render(
      <PartnerAuthProvider>
        <PartnerSignInCard />
      </PartnerAuthProvider>
    );

    const hubButton = screen.getAllByText("Hub")[0];
    fireEvent.click(hubButton);

    expect(screen.getByRole("button", { name: /Sign In to Kallisto Hub/i })).toBeDefined();

    const basicsButton = screen.getAllByText("Basics")[0];
    fireEvent.click(basicsButton);

    expect(screen.getByRole("button", { name: /Sign In to Kallisto Basics/i })).toBeDefined();
  });

  it("persists partner session in cookies and localStorage on authentication", async () => {
    const authResult = await PartnerAuthService.authenticate({
      emailOrPhone: "vikram@kallisto-hands.com",
      partnerType: "HANDS",
    });

    expect(authResult.success).toBe(true);
    expect(authResult.session?.partnerType).toBe("HANDS");

    const restored = PartnerAuthService.restoreSession();
    expect(restored).not.toBeNull();
    expect(restored?.partnerType).toBe("HANDS");
    expect(restored?.user.partnerBusinessName).toBe("Kallisto Hands Trade Fleet Kochi");
  });

  it("supports role switching between Hub and Basics", async () => {
    await PartnerAuthService.authenticate({
      emailOrPhone: "hub@kallisto.com",
      partnerType: "HUB",
    });

    let restored = PartnerAuthService.restoreSession();
    expect(restored?.partnerType).toBe("HUB");

    await PartnerAuthService.authenticate({
      emailOrPhone: "basics@kallisto.com",
      partnerType: "BASICS",
    });

    restored = PartnerAuthService.restoreSession();
    expect(restored?.partnerType).toBe("BASICS");
  });
});
