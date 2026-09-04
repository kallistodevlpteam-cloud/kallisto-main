import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { ClientProvidersWorkspace } from "@/features/client/providers/components/client-providers-workspace";
import { OdinProvider } from "@/contexts/odin-context";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("ClientProvidersWorkspace", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const renderWithProviders = () => {
    return render(
      <OdinProvider>
        <ClientProvidersWorkspace />
      </OdinProvider>
    );
  };

  it("renders top nav tabs, hero spotlight banner, latest practices, and right sidebar feed", () => {
    renderWithProviders();

    // Top Navigation
    expect(screen.getByAltText("Kallisto")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Home" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Architecture" }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("button", { name: "Interiors" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Structural" })).toBeInTheDocument();

    // 2-in-a-row Cinematic Hero Banners
    expect(screen.getAllByText("Arjun Architects").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Studio Luxe Interiors").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole("button", { name: "CONSULT" }).length).toBeGreaterThanOrEqual(2);

    // Latest analyzed practices
    expect(screen.getByText("The latest analyzed practices")).toBeInTheDocument();

    // Right Sidebar Feed
    expect(screen.getByText("Recent updates")).toBeInTheDocument();
    expect(screen.getAllByText("Top Practices").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Arjun Architects completes Kumarakom/i)).toBeInTheDocument();
  });

  it("switches spotlight hero when clicking category navigation tabs", () => {
    renderWithProviders();

    const interiorTab = screen.getByRole("button", { name: "Interiors" });
    fireEvent.click(interiorTab);

    expect(screen.getAllByText("Studio Luxe Interiors").length).toBeGreaterThanOrEqual(1);
  });

  it("filters providers when clicking category navigation tabs", () => {
    renderWithProviders();

    const structuralTab = screen.getByRole("button", { name: "Structural" });
    fireEvent.click(structuralTab);

    expect(screen.getAllByText("Apex Structural Consultants").length).toBeGreaterThanOrEqual(1);
  });

  it("filters providers based on search query", () => {
    renderWithProviders();

    const searchInput = screen.getByLabelText("Search registered providers");
    fireEvent.change(searchInput, { target: { value: "Apex" } });

    expect(screen.getAllByText("Apex Structural Consultants").length).toBeGreaterThanOrEqual(1);
  });

  it("navigates to provider full page when clicking CONSULT or a provider card", () => {
    renderWithProviders();

    const consultBtns = screen.getAllByRole("button", { name: "CONSULT" });
    fireEvent.click(consultBtns[0]);

    expect(mockPush).toHaveBeenCalledWith("/client/providers/provider-arjun-architects");
  });
});
