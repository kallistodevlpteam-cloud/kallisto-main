import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { HandsProjectDetailView } from "@/partner-app/hands/components/projects/hands-project-detail-view";
import { INITIAL_HANDS_PROJECTS } from "@/partner-app/hands/mock/projects-mock-data";

describe("HandsProjectDetailView Component", () => {
  const mockProject = INITIAL_HANDS_PROJECTS[0]; // Nila Luxury Residence

  it("renders project title, category, location, and service provider name", () => {
    render(<HandsProjectDetailView project={mockProject} />);

    expect(screen.getByText("Nila Luxury Residence")).toBeDefined();
    expect(screen.getByText("Luxury Residential Villa")).toBeDefined();
    expect(screen.getByText("Trivandrum, Kerala")).toBeDefined();
    expect(screen.getByText(/Service Provider:\s*Anoop Kumar/i)).toBeDefined();
    expect(screen.getByText("Back to Projects Directory")).toBeDefined();
    expect(screen.getByText("Call Supervisor")).toBeDefined();
  });

  it("renders Odin Project Brief card and project header details", () => {
    render(<HandsProjectDetailView project={mockProject} />);

    expect(screen.getAllByText(/ODIN PROJECT BRIEF/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Service Provider:\s*Anoop Kumar/i).length).toBeGreaterThan(0);
  });

  it("switches tabs between Overview, Assignments, Workers, Documents, and Accounts & Billing", () => {
    render(<HandsProjectDetailView project={mockProject} />);

    // Default Overview & Odin AI tab
    expect(screen.getAllByText(/ODIN PROJECT BRIEF/i).length).toBeGreaterThan(0);

    // Click Assignments tab
    const assignmentsTab = screen.getAllByRole("tab", { name: /Assignments/i })[0];
    fireEvent.click(assignmentsTab);
    expect(screen.getByText("Level 2 Structural Masonry")).toBeDefined();
    expect(screen.getByText("Foundation Waterproofing")).toBeDefined();

    // Click Workers tab
    const workersTab = screen.getAllByRole("tab", { name: /Workers/i })[0];
    fireEvent.click(workersTab);
    expect(screen.getByText("Rajesh Kumar")).toBeDefined();
    expect(screen.getByText("Biju K")).toBeDefined();

    // Click Documents tab
    const docsTab = screen.getAllByRole("tab", { name: /Documents/i })[0];
    fireEvent.click(docsTab);
    expect(screen.getByText(/Site Feasibility & Soil Audit Report/i)).toBeDefined();

    // Click Accounts & Billing tab
    const finTab = screen.getAllByRole("tab", { name: /Accounts & Billing/i })[0];
    fireEvent.click(finTab);
    expect(screen.getByText("Total Contract Value")).toBeDefined();
  });
});
