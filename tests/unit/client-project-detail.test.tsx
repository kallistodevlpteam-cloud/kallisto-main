import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import { ClientProjectDetailWorkspace } from "@/features/client/components/client-project-detail-workspace";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => "/client/projects/proj-nila-residence",
  useSearchParams: () => new URLSearchParams(),
}));

describe("ClientProjectDetailWorkspace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders project header, location, and title actions", () => {
    render(<ClientProjectDetailWorkspace projectId="proj-nila-residence" />);

    expect(screen.getByRole("heading", { name: "Nila Residence", level: 1 })).toBeInTheDocument();
    expect(screen.getAllByText("Kochi").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Received Jul 23, 2026/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /share nila residence/i })).toBeInTheDocument();

    const navChips = within(screen.getByLabelText("Project Navigation Options"));
    expect(navChips.getByRole("link", { name: /task/i })).toHaveAttribute("href", "/client/projects/proj-nila-residence/tasks");
    expect(navChips.getByRole("link", { name: /drive/i })).toHaveAttribute("href", "/client/projects/proj-nila-residence/documents");
    expect(navChips.getByRole("link", { name: /boq/i })).toHaveAttribute("href", "/client/projects/proj-nila-residence/boq");
    expect(navChips.getByRole("link", { name: /finance/i })).toHaveAttribute("href", "/client/projects/proj-nila-residence/finance");
    expect(navChips.getByRole("link", { name: /site/i })).toHaveAttribute("href", "/client/projects/proj-nila-residence/site");
  });

  it("renders inner navigation tabs and allows switching", () => {
    render(<ClientProjectDetailWorkspace projectId="proj-nila-residence" />);

    expect(screen.getByRole("tab", { name: /overview/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /client context/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /requirements/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /site & evidence/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /activity/i })).toBeInTheDocument();

    const contextTab = screen.getByRole("tab", { name: /client context/i });
    fireEvent.click(contextTab);
    expect(contextTab).toHaveAttribute("aria-selected", "true");
  });

  it("renders Odin project brief and project snapshot metrics with Service Provider", () => {
    render(<ClientProjectDetailWorkspace projectId="proj-nila-residence" />);

    expect(screen.getByText("ODIN PROJECT BRIEF")).toBeInTheDocument();
    expect(
      screen.getByText(/Ananya Builders is seeking a residential fit-out/i)
    ).toBeInTheDocument();

    expect(screen.getByText("Project Type")).toBeInTheDocument();
    expect(screen.getAllByText("Residential Design").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Built-up Area")).toBeInTheDocument();
    expect(screen.getByText("2,800 – 3,200 sq ft")).toBeInTheDocument();
    expect(screen.getByText("Service Provider")).toBeInTheDocument();
    expect(screen.getAllByText("Arjun Architects").length).toBeGreaterThanOrEqual(1);
  });

  it("renders verified Service Provider & Specialist Team section with 4 cards", () => {
    render(<ClientProjectDetailWorkspace projectId="proj-nila-residence" />);

    expect(screen.getByText("SERVICE PROVIDER & SPECIALIST TEAM")).toBeInTheDocument();
    expect(screen.getByText("4 Verified Partners")).toBeInTheDocument();
    expect(screen.getByText("Kallisto Verified Partners")).toBeInTheDocument();

    expect(screen.getByText("Terra Geotechnics")).toBeInTheDocument();
    expect(screen.getByText("Geotechnical Engineering")).toBeInTheDocument();
    expect(screen.getAllByText("Arjun Architects").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Apex Consultants")).toBeInTheDocument();
    expect(screen.getByText("Studio Luxe")).toBeInTheDocument();
    expect(screen.getAllByText("View").length).toBe(4);
  });

  it("renders client context & priorities drivers", () => {
    render(<ClientProjectDetailWorkspace projectId="proj-nila-residence" />);
    fireEvent.click(screen.getByRole("tab", { name: /client context/i }));

    expect(screen.getByText("Natural light & cross ventilation")).toBeInTheDocument();
    expect(screen.getByText("Teak joinery & premium finishes")).toBeInTheDocument();
    expect(screen.getByText("Dedicated home office & study")).toBeInTheDocument();
    expect(screen.getByText("Budget sensitivity & control")).toBeInTheDocument();
    expect(screen.getByText("Energy efficiency & sustainability")).toBeInTheDocument();
  });

  it("renders live project updates feed", () => {
    render(<ClientProjectDetailWorkspace projectId="proj-nila-residence" />);

    expect(screen.getByText("Project Updates")).toBeInTheDocument();
    expect(screen.getAllByText("Arjun Menon").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Priya Sharma").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Rahul Nair").length).toBeGreaterThanOrEqual(1);
  });
});
