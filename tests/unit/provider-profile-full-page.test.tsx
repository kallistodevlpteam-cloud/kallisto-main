import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { ProviderProfileFullPage } from "@/features/client/providers/components/provider-profile-full-page";
import { REGISTERED_SERVICE_PROVIDERS } from "@/features/client/providers/data/registered-providers.mock";
import { OdinProvider } from "@/contexts/odin-context";

describe("ProviderProfileFullPage", () => {
  afterEach(() => {
    cleanup();
  });

  const testProvider = REGISTERED_SERVICE_PROVIDERS[0];

  const renderComponent = () => {
    return render(
      <OdinProvider>
        <ProviderProfileFullPage provider={testProvider} />
      </OdinProvider>
    );
  };

  it("renders full practice profile details including overview, philosophy, services, and actions", () => {
    renderComponent();

    // Header & identity
    expect(screen.getByRole("heading", { name: testProvider.name, level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Back to Practices")).toBeInTheDocument();
    expect(screen.getByText(testProvider.verificationBadge)).toBeInTheDocument();

    // Section headings
    expect(screen.getByText("Practice Overview")).toBeInTheDocument();
    expect(screen.getByText("Studio Philosophy")).toBeInTheDocument();
    expect(screen.getByText("Services & Deliverables")).toBeInTheDocument();
    expect(screen.getByText("Specializations")).toBeInTheDocument();
    expect(screen.getByText("Featured Projects")).toBeInTheDocument();
    expect(screen.getByText("Virtual Office Team")).toBeInTheDocument();

    // Sticky Actions
    expect(screen.getByRole("button", { name: "Connect Practice" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ask Odin AI" })).toBeInTheDocument();
    expect(screen.getByText(testProvider.baseFee)).toBeInTheDocument();
  });
});
