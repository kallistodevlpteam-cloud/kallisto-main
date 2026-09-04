import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DeploymentProjectCard } from "./deployment-project-card";
import { ActiveDeploymentsCard } from "./active-deployments-card";
import type { Deployment } from "../types/hands.types";

afterEach(() => {
  cleanup();
});

const sampleDeployment: Deployment = {
  id: "dep-1",
  projectId: "proj-001",
  projectName: "Nila Luxury Residence",
  location: "Trivandrum, Kerala",
  workforce: "8 masons · 10 helpers",
  shift: "8:00 AM – 5:00 PM",
  attendance: { state: "recorded", present: 16, total: 18 },
  supervisor: "Rajeev K.",
  dailyCost: 19800,
  status: "Needs attention",
  startDate: "22 Jul 2026",
  endDate: "08 Aug 2026",
  coverImage: "/assets/projectbg.webp",
  category: "Construction & Structural",
  overallProgress: 70,
  dueLabel: "Due in 3d",
  workerUpdate: "8 masons · 10 helpers (16/18 checked in • 2 absent)",
};

describe("DeploymentProjectCard", () => {
  it("renders project cover image, category, status, overall progress % and workers update", () => {
    const handleSelect = vi.fn();

    render(
      <DeploymentProjectCard
        deployment={sampleDeployment}
        onSelect={handleSelect}
      />,
    );

    // Media badges
    expect(screen.getByText("Construction & Structural")).toBeInTheDocument();
    expect(screen.getByText("Needs attention")).toBeInTheDocument();

    // Title & progress
    expect(screen.getByText("Nila Luxury Residence")).toBeInTheDocument();
    expect(screen.getByText("70%")).toBeInTheDocument();

    // Location & Due
    expect(screen.getByText("Trivandrum, Kerala")).toBeInTheDocument();
    expect(screen.getByText("Due in 3d")).toBeInTheDocument();

    // Active workers & on leave
    expect(screen.getByText("16")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText(/on leave/i)).toBeInTheDocument();

    // Worker type & supervisor & daily cost
    expect(screen.getByText("8 masons · 10 helpers")).toBeInTheDocument();
    expect(screen.getByText("Rajeev K.")).toBeInTheDocument();
    expect(screen.getByText("₹19,800/d")).toBeInTheDocument();

    // Click handler
    fireEvent.click(screen.getByRole("button"));
    expect(handleSelect).toHaveBeenCalledWith(sampleDeployment);
  });
});

describe("ActiveDeploymentsCard with Grid & Table views", () => {
  it("renders cards grid by default and allows switching to table view", () => {
    const handleSelect = vi.fn();
    const handleNavigate = vi.fn();
    const handleRequest = vi.fn();

    render(
      <ActiveDeploymentsCard
        deployments={[sampleDeployment]}
        onSelectDeployment={handleSelect}
        onNavigateTab={handleNavigate}
        onRequestWorkforce={handleRequest}
      />,
    );

    // By default renders card
    expect(
      screen.getByRole("heading", { name: "Nila Luxury Residence" }),
    ).toBeInTheDocument();
    expect(screen.getByText("70%")).toBeInTheDocument();

    // Switch to table view
    const tableToggle = screen.getByRole("button", { name: "Table list view" });
    fireEvent.click(tableToggle);

    // Table headers should now be present
    expect(screen.getByText("Project / site")).toBeInTheDocument();
    expect(screen.getByText("Workforce")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();

    // Switch back to grid view
    const gridToggle = screen.getByRole("button", { name: "Cards grid view" });
    fireEvent.click(gridToggle);
    expect(screen.getByText("Construction & Structural")).toBeInTheDocument();
  });
});
