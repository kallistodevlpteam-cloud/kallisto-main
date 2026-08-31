import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { ProjectOverviewActivitySections } from "@/features/documents/components/project-overview-activity-sections";

describe("ProjectOverviewActivitySections", () => {
  it("renders all 5 activity sections correctly", () => {
    render(<ProjectOverviewActivitySections projectId="proj-001" />);

    // Section 1: PROJECT PROGRESS
    expect(screen.getByText("PROJECT PROGRESS")).toBeDefined();
    expect(screen.getByText("Overall Progress")).toBeDefined();
    expect(screen.getByText("42%")).toBeDefined();
    expect(screen.getByText("Planning")).toBeDefined();
    expect(screen.getByText("Design")).toBeDefined();
    expect(screen.getAllByText("Execution").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Handover")).toBeDefined();
    expect(screen.getAllByText("Interior Design").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("MEP Coordination").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Due in 4 days/i)).toBeDefined();

    // Section 2: TODAY'S ACTIVITY + PENDING REVIEW
    expect(screen.getByText(/TODAY'S ACTIVITY/i)).toBeDefined();
    expect(screen.getByText("Active Tasks")).toBeDefined();
    expect(screen.getByText("08")).toBeDefined();
    expect(screen.getByText("MEP layout review")).toBeDefined();
    expect(screen.getByText("Living room elevation")).toBeDefined();
    expect(screen.getByText("Electrical point marking")).toBeDefined();
    expect(screen.getByText("Marble specification approval")).toBeDefined();
    expect(screen.getByText(/View all tasks/i)).toBeDefined();

    expect(screen.getByText(/PENDING REVIEW & REQUESTS/i)).toBeDefined();
    expect(screen.getByText(/3 items require your attention/i)).toBeDefined();
    expect(screen.getByText("Task Reviews")).toBeDefined();
    expect(screen.getByText("Client Requests")).toBeDefined();
    expect(screen.getByText("Approval Requests")).toBeDefined();
    expect(screen.getByText("BOQ / Quote Requests")).toBeDefined();
    expect(screen.getByText(/Review all/i)).toBeDefined();

    // Section 3: PROJECT TIMELINE
    expect(screen.getByText("PROJECT TIMELINE")).toBeDefined();
    expect(screen.getByText("Project Brief")).toBeDefined();
    expect(screen.getByText(/Completed · 12 May/i)).toBeDefined();
    expect(screen.getByText("Site Assessment")).toBeDefined();
    expect(screen.getByText(/Completed · 18 May/i)).toBeDefined();
    expect(screen.getByText("Concept Design")).toBeDefined();
    expect(screen.getByText(/Completed · 28 May/i)).toBeDefined();
    expect(screen.getByText(/Upcoming · 04 Sep/i)).toBeDefined();
    expect(screen.getByText(/Upcoming · 20 Sep/i)).toBeDefined();
    expect(screen.getByText(/View Full Timeline/i)).toBeDefined();

    // Section 4: HANDS / LABOUR + ACTIVE TEAM
    expect(screen.getByText("HANDS")).toBeDefined();
    expect(screen.getAllByText(/₹16,850/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Total Labour")).toBeDefined();
    expect(screen.getAllByText(/Active Today/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("On Leave")).toBeDefined();
    expect(screen.getByText("Not Assigned")).toBeDefined();
    expect(screen.getAllByText(/Mason/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Carpenter/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Electrician/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Plumber/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Painter/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/View Hands/i)).toBeDefined();

    expect(screen.getByText("ACTIVE PROJECT TEAM")).toBeDefined();
    expect(screen.getByText("08 Members")).toBeDefined();
    expect(screen.getByText("Arjun Menon")).toBeDefined();
    expect(screen.getByText("Project Manager")).toBeDefined();
    expect(screen.getByText("Priya Sharma")).toBeDefined();
    expect(screen.getByText("Lead Architect")).toBeDefined();
    expect(screen.getByText("Rahul Nair")).toBeDefined();
    expect(screen.getByText("Structural Engineer")).toBeDefined();
    expect(screen.getByText("Anjali Thomas")).toBeDefined();
    expect(screen.getByText("Interior Designer")).toBeDefined();
    expect(screen.getByText(/\+4 more/i)).toBeDefined();
    expect(screen.getByText(/View Team/i)).toBeDefined();

    // Section 5: PROJECT MATERIALS + HIVE PRODUCTS
    expect(screen.getByText("PROJECT MATERIALS")).toBeDefined();
    expect(screen.getByText("Total Spent")).toBeDefined();
    expect(screen.getByText("₹5.6L")).toBeDefined();
    expect(screen.getByText("Available Value")).toBeDefined();
    expect(screen.getByText("₹2.8L")).toBeDefined();
    expect(screen.getAllByText("BOQ Required").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("₹3.6L")).toBeDefined();
    expect(screen.getByText("Italian Marble Flooring")).toBeDefined();
    expect(screen.getByText("Structural Cement (53 Grade)")).toBeDefined();
    expect(screen.getByText(/Teak Wood Framing/i)).toBeDefined();
    expect(screen.getByText(/Conduit & Electrical Wiring/i)).toBeDefined();
    expect(screen.getByText(/View BOQ Materials/i)).toBeDefined();

    expect(screen.getByText("HIVE SERVICES")).toBeDefined();
    expect(screen.getByText("04 Services Used")).toBeDefined();
    expect(screen.getByText(/3D Architectural Rendering/i)).toBeDefined();
    expect(screen.getByText(/4 Photorealistic Views Approved/i)).toBeDefined();
    expect(screen.getByText(/Structural Load & FEA Stress Analysis/i)).toBeDefined();
    expect(screen.getByText(/MEP BIM Routing & Coordination/i)).toBeDefined();
    expect(screen.getByText(/Site Feasibility & Digital Contour Scan/i)).toBeDefined();
    expect(screen.getByText(/View Hive Services/i)).toBeDefined();
  });
});
