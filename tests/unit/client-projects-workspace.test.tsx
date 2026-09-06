import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, within, cleanup } from "@testing-library/react";
import { ClientProjectsWorkspace } from "@/features/client/components/client-projects-workspace";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("ClientProjectsWorkspace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders page header and search input matching reference", () => {
    render(<ClientProjectsWorkspace />);

    expect(screen.getByRole("heading", { name: "Projects", level: 1 })).toBeInTheDocument();
    expect(
      screen.getByText("Manage active, upcoming, on hold and completed work across your practice.")
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search project, client or code...")).toBeInTheDocument();
  });

  it("renders Pre Construction, Construction, and Post Construction status tabs", () => {
    render(<ClientProjectsWorkspace />);

    const tabsNav = screen.getByRole("tablist", { name: /project status tabs/i });
    expect(within(tabsNav).getByRole("tab", { name: /^pre construction/i })).toBeInTheDocument();
    expect(within(tabsNav).getByRole("tab", { name: /^construction/i })).toBeInTheDocument();
    expect(within(tabsNav).getByRole("tab", { name: /^post construction/i })).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /^ownership/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^project phase/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^needs attention/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^location/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^recently updated/i })).toBeInTheDocument();
  });

  it("renders construction project photo cards with overlay phase badge and location", () => {
    render(<ClientProjectsWorkspace />);

    expect(screen.getAllByText("Nila Residence").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Greenfield Eco Resort").length).toBeGreaterThanOrEqual(1);

    expect(screen.getAllByText("In progress").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Kakkanad, Kochi").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Alappuzha Backwaters").length).toBeGreaterThanOrEqual(1);
  });

  it("switches to Pre Construction tab and displays pre-construction projects", () => {
    render(<ClientProjectsWorkspace />);

    const tabsNav = screen.getByRole("tablist", { name: /project status tabs/i });
    const preTab = within(tabsNav).getByRole("tab", { name: /^pre construction/i });
    fireEvent.click(preTab);

    expect(screen.getByText("Greenfield Villa")).toBeInTheDocument();
    expect(screen.getByText("Design development")).toBeInTheDocument();
  });

  it("switches to Post Construction tab and displays completed projects", () => {
    render(<ClientProjectsWorkspace />);

    const tabsNav = screen.getByRole("tablist", { name: /project status tabs/i });
    const postTab = within(tabsNav).getByRole("tab", { name: /^post construction/i });
    fireEvent.click(postTab);

    expect(screen.getByText("Palm Heights Penthouse")).toBeInTheDocument();
    expect(screen.getByText("Azure Bay Villa")).toBeInTheDocument();
  });

  it("filters project cards by search input", () => {
    render(<ClientProjectsWorkspace />);

    const searchInput = screen.getByPlaceholderText("Search project, client or code...");
    fireEvent.change(searchInput, { target: { value: "Eco Resort" } });

    expect(screen.getAllByText("Greenfield Eco Resort").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("Nila Residence")).not.toBeInTheDocument();
  });

  it("navigates to project detail page when a card is clicked", () => {
    render(<ClientProjectsWorkspace />);

    const firstCard = screen.getAllByRole("button", { name: /project nila residence/i })[0];
    fireEvent.click(firstCard);

    expect(mockPush).toHaveBeenCalledWith("/client/projects/proj-nila-residence");
  });
});
