import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProviderCard } from "@/features/basics/components/provider-card";
import { ProviderOrderPanel } from "@/features/basics/components/provider-order-panel";
import { BasicsEmptyState } from "@/features/basics/components/basics-shared";
import { MOCK_BASICS_PROVIDERS } from "@/features/basics/data/mock-basics-data";

describe("Basics shared interface", () => {
  it("renders evidence-based provider cards with working route actions", () => {
    const provider = MOCK_BASICS_PROVIDERS[0];
    render(
      <ProviderCard
        provider={provider}
        projectId="proj-001"
        discovery
        onToggleCompare={vi.fn()}
        onToggleSave={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("heading", { name: provider.name }),
    ).toBeInTheDocument();
    expect(screen.getByText(`${provider.yearsOfExperience} years`)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: `View ${provider.name} specialist profile` }),
    ).toBeInTheDocument();
  });

  it("gives empty states one clear next action", () => {
    render(
      <BasicsEmptyState
        title="No proposals"
        description="Post a requirement to receive proposals."
        actionLabel="Post a requirement"
        href="/basics/requirements/new"
      />,
    );

    expect(screen.getByRole("heading", { name: "No proposals" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Post a requirement/i }),
    ).toHaveAttribute("href", "/basics/requirements/new");
  });

  it("renders the interactive order panel with service selection and place order action", () => {
    const provider = MOCK_BASICS_PROVIDERS[0];
    render(
      <ProviderOrderPanel
        provider={provider}
        projectId="proj-001"
      />,
    );

    expect(screen.getByRole("complementary", { name: "Place an order with this provider" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Place Order/i })).toHaveAttribute(
      "href",
      expect.stringContaining("intent=order"),
    );
    expect(screen.getByRole("link", { name: /Request Custom Proposal/i })).toHaveAttribute(
      "href",
      expect.stringContaining("intent=proposal"),
    );
    expect(screen.getByText("Kallisto Milestone Protection")).toBeInTheDocument();
  });
});
