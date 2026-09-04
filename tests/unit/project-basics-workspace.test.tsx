import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { ProjectBasicsWorkspace } from "@/features/projects/components/basics/project-basics-workspace";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/projects/prj-1",
  useSearchParams: () => new URLSearchParams(),
}));

afterEach(() => {
  cleanup();
});

describe("ProjectBasicsWorkspace", () => {
  it("renders connected Basics services with fees, status tags, and live updates", () => {
    render(<ProjectBasicsWorkspace projectId="prj-1" projectName="Nila Residence" />);

    // Service names
    expect(screen.getByText("RCC Structural Engineering & Peer Review")).toBeInTheDocument();
    expect(screen.getByText("Integrated MEP Engineering (Electrical & Plumbing)")).toBeInTheDocument();
    expect(screen.getByText("Soil Geotechnical Investigation & Bearing Stability")).toBeInTheDocument();
    expect(screen.getByText("Building Permit & Statutory Sanctions Advisory")).toBeInTheDocument();

    // Providers & Leads
    expect(screen.getByText("Axis Structures (Kochi)")).toBeInTheDocument();
    expect(screen.getByText("Er. Rahul Nair")).toBeInTheDocument();
    expect(screen.getByText("Enviro MEP Consultants (Kozhikode)")).toBeInTheDocument();
    expect(screen.getByText("Siddharth K")).toBeInTheDocument();

    // Live update snippets
    expect(
      screen.getByText(/Uploaded Sheet ST-204 for first-floor slab beam reinforcement detailing/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Updated solar PV inverter tie-in circuits & breaker schedule/i)
    ).toBeInTheDocument();

    // Fees & Status tags
    expect(screen.getByText("Fee: ₹85,000")).toBeInTheDocument();
    expect(screen.getByText("Active (75%)")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("Sanctioned")).toBeInTheDocument();

    // Header title and count badge
    expect(screen.getByText(/Basics Services/i)).toBeInTheDocument();
    expect(screen.getByText("4 Connected Services")).toBeInTheDocument();
  });
});
