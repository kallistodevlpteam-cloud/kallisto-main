import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import React from "react";
import { ProjectOverviewActivitySections } from "@/features/documents/components/project-overview-activity-sections";

describe("ProjectOverviewActivitySections", () => {
  afterEach(() => {
    cleanup();
  });

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
    expect(screen.getByText("02 Members")).toBeDefined();
    expect(screen.getByText("Arjun Menon")).toBeDefined();
    expect(screen.getByText("Project Manager")).toBeDefined();
    expect(screen.getByText("Priya Sharma")).toBeDefined();
    expect(screen.getByText("Lead Architect")).toBeDefined();
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

    expect(screen.getByText("HIVE STUDIO")).toBeDefined();
    expect(screen.getByText("04 Workspaces Used")).toBeDefined();
    expect(screen.getByText(/AI Requirement Brief & Spatial Synthesis/i)).toBeDefined();
    expect(screen.getByText(/ODIN Brief & 10 Domain Specs Synced/i)).toBeDefined();
    expect(screen.getByText(/Concept Scheme & Palette Studio/i)).toBeDefined();
    expect(screen.getByText(/Automated Proposal & Scope Generator/i)).toBeDefined();
    expect(screen.getByText(/CAD Spec & Feasibility Verifier/i)).toBeDefined();
    expect(screen.getByText(/Open Hive Studio/i)).toBeDefined();
  });

  it("omits project progress and below content when project is upcoming", async () => {
    const { ProjectOverviewCard } = await import("@/features/documents/components/project-overview-card");
    render(
      <ProjectOverviewCard
        projectId="proj-007"
        projectName="Skyline Heights Phase II"
        projectStatus="upcoming"
        isUpcoming={true}
        statValues={{
          projectType: "Residential Design",
          duration: "Within 6 Months",
          builtUpArea: "2,800 – 3,200 sq ft",
          budget: "₹40L – ₹60L",
          client: "Ananya Builders",
        }}
      />
    );

    expect(screen.getByText("ODIN PROJECT BRIEF")).toBeDefined();
    expect(screen.getByText("PROJECT SNAPSHOT")).toBeDefined();

    // 4 allowed tabs for upcoming projects
    expect(screen.getByRole("tab", { name: /overview/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /client context/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /requirements/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /site & evidence/i })).toBeDefined();

    // Omitted tabs for upcoming projects
    expect(screen.queryByRole("tab", { name: /team members/i })).toBeNull();
    expect(screen.queryByRole("tab", { name: /materials/i })).toBeNull();
    expect(screen.queryByRole("tab", { name: /hands/i })).toBeNull();
    expect(screen.queryByRole("tab", { name: /basics/i })).toBeNull();
    expect(screen.queryByRole("tab", { name: /activity/i })).toBeNull();

    expect(screen.queryByText("PROJECT PROGRESS")).toBeNull();
    expect(screen.queryByText("Overall Progress")).toBeNull();
    expect(screen.queryByText(/TODAY'S ACTIVITY/i)).toBeNull();
    expect(screen.queryByText(/PENDING REVIEW & REQUESTS/i)).toBeNull();
    expect(screen.queryByText("PROJECT TIMELINE")).toBeNull();
    expect(screen.queryByText("HANDS")).toBeNull();
    expect(screen.queryByText("ACTIVE PROJECT TEAM")).toBeNull();
    expect(screen.queryByText("PROJECT MATERIALS")).toBeNull();
    expect(screen.queryByText("HIVE STUDIO")).toBeNull();
  });

  it("renders project progress and below content when project is active", async () => {
    const { ProjectOverviewCard } = await import("@/features/documents/components/project-overview-card");
    render(
      <ProjectOverviewCard
        projectId="proj-001"
        projectName="Nila Residence"
        projectStatus="active"
        isUpcoming={false}
        statValues={{
          projectType: "Residential Design",
          duration: "Within 6 Months",
          builtUpArea: "2,800 – 3,200 sq ft",
          budget: "₹40L – ₹60L",
          client: "Ananya Builders",
        }}
      />
    );

    expect(screen.getByText("ODIN PROJECT BRIEF")).toBeDefined();
    expect(screen.getByText("PROJECT SNAPSHOT")).toBeDefined();

    expect(screen.getAllByText("PROJECT PROGRESS").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Overall Progress").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/TODAY'S ACTIVITY/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/PENDING REVIEW & REQUESTS/i).length).toBeGreaterThanOrEqual(1);
  });

  it("renders tabs correctly for both enquiry mode (4 tabs) and project mode (9 tabs)", async () => {
    const { EnquiryDetailTabs, resolveValidTabKey } = await import(
      "@/features/enquiries/detail/components/enquiry-detail-tabs"
    );

    // Default Enquiry mode (omits team, materials, hands, basics, activity)
    const { unmount } = render(<EnquiryDetailTabs activeTab="overview" mode="enquiry" />);
    expect(screen.getByRole("tab", { name: /overview/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /client context/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /requirements/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /site & evidence/i })).toBeDefined();
    expect(screen.queryByRole("tab", { name: /basics/i })).toBeNull();
    expect(screen.queryByRole("tab", { name: /team members/i })).toBeNull();
    expect(screen.queryByRole("tab", { name: /materials/i })).toBeNull();
    expect(screen.queryByRole("tab", { name: /hands/i })).toBeNull();
    expect(screen.queryByRole("tab", { name: /activity/i })).toBeNull();
    unmount();

    // Project mode (all 9 tabs)
    render(<EnquiryDetailTabs activeTab="overview" mode="project" />);
    expect(screen.getByRole("tab", { name: /overview/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /client context/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /requirements/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /site & evidence/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /team members/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /materials/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /hands/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /basics/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /activity/i })).toBeDefined();

    expect(resolveValidTabKey("team", "project")).toBe("team");
    expect(resolveValidTabKey("materials", "project")).toBe("materials");
    expect(resolveValidTabKey("hands", "project")).toBe("hands");
    expect(resolveValidTabKey("basics", "project")).toBe("basics");
    expect(resolveValidTabKey("requirements", "enquiry")).toBe("requirements");
  });
});
