import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProviderCard } from "@/features/basics/components/provider-card";
import { ProviderOrderPanel } from "@/features/basics/components/provider-order-panel";
import { BasicsEmptyState } from "@/features/basics/components/basics-shared";
import { BasicsOverview } from "@/features/basics/components/basics-overview";
import { ExpertDiscovery } from "@/features/basics/components/expert-discovery";
import { MOCK_BASICS_PROVIDERS } from "@/features/basics/data/mock-basics-data";

describe("Basics shared interface", () => {
  afterEach(() => {
    cleanup();
  });
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

  it("renders top right quick actions with text labels and working routes in BasicsOverview", () => {
    render(<BasicsOverview projectId="proj-001" />);

    // Saved button with text label
    const savedLink = screen.getByRole("link", { name: /View saved specialists/i });
    expect(savedLink).toBeInTheDocument();
    expect(savedLink).toHaveAttribute("href", "/basics/experts?saved=true&projectId=proj-001");
    expect(savedLink).toHaveTextContent("Saved");

    // Orders button with text label
    const ordersLink = screen.getByRole("link", { name: /View orders and engagements/i });
    expect(ordersLink).toBeInTheDocument();
    expect(ordersLink).toHaveAttribute("href", "/basics/engagements?projectId=proj-001");
    expect(ordersLink).toHaveTextContent("Orders");

    // Basics Hub side panel button with text label
    const hubBtn = screen.getByRole("button", { name: /Toggle Basics Hub side panel/i });
    expect(hubBtn).toBeInTheDocument();
    expect(hubBtn).toHaveTextContent("Basics Hub");

    // Clicking Basics Hub opens the drawer
    fireEvent.click(hubBtn);
    expect(screen.getByRole("complementary", { name: "Basics Quick Hub" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Basics Hub" })).toBeInTheDocument();
    expect(screen.getByText("Quick Actions")).toBeInTheDocument();
  });

  it("renders ExpertDiscovery with polished search area, top nav buttons with text, sort dropdown, and hub drawer", async () => {
    render(<ExpertDiscovery />);

    // 1. Search Area: input with correct placeholder
    const searchInput = screen.getByRole("textbox", {
      name: /Search specialists, skills, software, location/i,
    });
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute(
      "placeholder",
      "Search specialists, skills, software, location...",
    );

    // 2. Top Right Actions: Saved, Orders, Basics Hub with text
    const savedBtn = screen.getByRole("button", { name: /Toggle saved specialists/i });
    expect(savedBtn).toBeInTheDocument();
    expect(savedBtn).toHaveTextContent("Saved");

    const ordersLink = screen.getByRole("link", { name: /View orders and engagements/i });
    expect(ordersLink).toBeInTheDocument();
    expect(ordersLink).toHaveTextContent("Orders");

    const hubBtn = screen.getByRole("button", { name: /Toggle Basics Hub side panel/i });
    expect(hubBtn).toBeInTheDocument();
    expect(hubBtn).toHaveTextContent("Basics Hub");

    // 3. Sort Select Dropdown
    const sortSelect = screen.getByLabelText(/Sort experts/i);
    expect(sortSelect).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Sort: Recommended/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Sort: Highest rated/i })).toBeInTheDocument();

    // 4. Basics Hub Drawer opens on click
    fireEvent.click(hubBtn);
    expect(screen.getByRole("complementary", { name: "Basics Quick Hub" })).toBeInTheDocument();
  });
});
