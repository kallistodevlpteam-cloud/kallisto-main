import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DeploymentProjectCard } from "./deployment-project-card";
import { DeploymentDetailsDrawer } from "./deployment-details-drawer";
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

  it("renders single labour contractor name when one contractor is assigned", () => {
    const singleContractorDep: Deployment = {
      ...sampleDeployment,
      contractorName: "Chroma Finishes & Paint Crew",
      contractors: [
        { name: "Chroma Finishes & Paint Crew", trade: "Painters", workerCount: 6 },
      ],
    };

    render(
      <DeploymentProjectCard
        deployment={singleContractorDep}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByText("Labour Contractor :")).toBeInTheDocument();
    expect(screen.getByText("Chroma Finishes & Paint Crew")).toBeInTheDocument();
    expect(screen.getByText("(6 Painters)")).toBeInTheDocument();
  });

  it("renders multiple labour contractor names and badges when multiple contractors work on the same project", () => {
    const multiContractorDep: Deployment = {
      ...sampleDeployment,
      contractors: [
        { name: "Apex Integrated Civil", trade: "Masonry", workerCount: 8 },
        { name: "Malabar Site Crew", trade: "Helpers", workerCount: 10 },
      ],
    };

    render(
      <DeploymentProjectCard
        deployment={multiContractorDep}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByText("Labour Contractors (2) :")).toBeInTheDocument();
    expect(screen.getByText("Apex Integrated Civil")).toBeInTheDocument();
    expect(screen.getByText("(8 Masonry)")).toBeInTheDocument();
    expect(screen.getByText("Malabar Site Crew")).toBeInTheDocument();
    expect(screen.getByText("(10 Helpers)")).toBeInTheDocument();
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

describe("DeploymentDetailsDrawer Contractor Profiles", () => {
  it("renders rich contractor profiles with rating, lead, experience and profile links", () => {
    const multiContractorDep: Deployment = {
      ...sampleDeployment,
      contractors: [
        {
          id: "contractor-apex",
          name: "Apex Integrated Civil",
          trade: "Masonry",
          workerCount: 8,
          crewId: "crew-masons-01",
          rating: 4.9,
          reviewCount: 42,
          leadName: "Rajan K.",
          experienceYears: 14,
          verified: true,
          badge: "Kallisto Civil Guild",
          specialization: "Structural Brickwork & AAC Blockwork",
        },
        {
          id: "contractor-malabar",
          name: "Malabar Site Crew",
          trade: "Helpers",
          workerCount: 10,
          crewId: "crew-helpers-01",
          rating: 4.8,
          reviewCount: 54,
          leadName: "Gireesh Kumar",
          experienceYears: 7,
          verified: true,
          badge: "Verified Site Workforce",
          specialization: "Material Staging & Site Handling",
        },
      ],
    };

    render(
      <DeploymentDetailsDrawer
        deployment={multiContractorDep}
        onClose={vi.fn()}
        onNavigateTab={vi.fn()}
      />,
    );

    // Section header
    expect(
      screen.getByText("Labour Contractor Profiles (2)"),
    ).toBeInTheDocument();
    expect(screen.getByText("2 contractors")).toBeInTheDocument();

    // Contractor 1
    expect(screen.getByText("Apex Integrated Civil")).toBeInTheDocument();
    expect(screen.getByText("Kallisto Civil Guild")).toBeInTheDocument();
    expect(screen.getByText("8 Masonry Deployed")).toBeInTheDocument();
    expect(screen.getByText("Rajan K.")).toBeInTheDocument();
    expect(screen.getByText("14+ yrs verified")).toBeInTheDocument();
    expect(
      screen.getByText("Structural Brickwork & AAC Blockwork"),
    ).toBeInTheDocument();

    // Contractor 2
    expect(screen.getByText("Malabar Site Crew")).toBeInTheDocument();
    expect(screen.getByText("Verified Site Workforce")).toBeInTheDocument();
    expect(screen.getByText("10 Helpers Deployed")).toBeInTheDocument();
    expect(screen.getByText("Gireesh Kumar")).toBeInTheDocument();
    expect(screen.getByText("7+ yrs verified")).toBeInTheDocument();

    // Profile links
    const profileLinks = screen.getAllByText("View Contractor Profile");
    expect(profileLinks.length).toBe(2);
  });
});
