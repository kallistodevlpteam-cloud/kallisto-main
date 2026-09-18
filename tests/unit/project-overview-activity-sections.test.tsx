import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
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
    expect(screen.getByText(/₹16,850 Today's Spend/i)).toBeDefined();
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

    expect(screen.getByText("BASICS STUDIO")).toBeDefined();
    expect(screen.getByText("04 Workspaces Used")).toBeDefined();
    expect(screen.getByText(/RCC Structural Detailing & Engineering/i)).toBeDefined();
    expect(screen.getByText(/Integrated MEP & Solar Engineering/i)).toBeDefined();
    expect(screen.getByText(/BIM Coordination & Clash Detection/i)).toBeDefined();
    expect(screen.getByText(/Building Permit & Statutory Sanctions/i)).toBeDefined();
    expect(screen.getByText(/Open Basics Studio/i)).toBeDefined();
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
    expect(screen.queryByText(/ACTION REQUIRED/i)).toBeNull();
    expect(screen.queryByText(/TODAY'S ACTIVITY/i)).toBeNull();
    expect(screen.queryByText(/PENDING REVIEW & REQUESTS/i)).toBeNull();
    expect(screen.queryByText("PROJECT TIMELINE")).toBeNull();
    expect(screen.queryByText("HANDS")).toBeNull();
    expect(screen.queryByText("ACTIVE PROJECT TEAM")).toBeNull();
    expect(screen.queryByText("PROJECT MATERIALS")).toBeNull();
    expect(screen.queryByText("BASICS STUDIO")).toBeNull();
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

  it("renders clean ACTION NEEDED section with 3D Design deliverable item for client view", () => {
    render(<ProjectOverviewActivitySections projectId="proj-001" isClient={true} />);

    // Section title & card
    expect(screen.getByRole("heading", { name: /ACTION NEEDED/i })).toBeDefined();
    expect(screen.getByText(/4 items require your attention/i)).toBeDefined();

    expect(screen.getByText("3D Design & Interior Concept")).toBeDefined();
    expect(screen.getByText("v2.1")).toBeDefined();
    expect(screen.queryByText("3D Design & Views")).toBeNull();
    expect(screen.getByText(/Submitted by Priya Sharma \(Lead Architect\) · 2 days ago/i)).toBeDefined();

    // View button opens modal overlay
    const viewBtn = screen.getByRole("button", { name: /View 3D Design & Interior Concept/i });
    expect(viewBtn).toBeDefined();

    // Modal dialog is initially closed
    expect(screen.queryByRole("dialog")).toBeNull();

    // Clicking View button opens overlay modal
    fireEvent.click(viewBtn);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeDefined();

    // Image displays in overlay
    const previewImg = screen.getByRole("img", { name: /3D Design Preview/i });
    expect(previewImg).toBeDefined();
    expect(previewImg.getAttribute("src")).toBe("/assets/nila-thumb2.jpg");

    // Download option is present with download attribute
    const downloadBtn = screen.getByRole("link", { name: /Download image/i });
    expect(downloadBtn).toBeDefined();
    expect(downloadBtn.getAttribute("href")).toBe("/assets/nila-thumb2.jpg");
    expect(downloadBtn.hasAttribute("download")).toBe(true);

    // Left and Right arrow navigation buttons are present
    const nextBtn = screen.getByRole("button", { name: /Next image/i });
    const prevBtn = screen.getByRole("button", { name: /Previous image/i });
    expect(nextBtn).toBeDefined();
    expect(prevBtn).toBeDefined();
    expect(screen.getByText("1 / 3")).toBeDefined();

    // 1st image: Left arrow is disabled, Right arrow is enabled
    expect(prevBtn.hasAttribute("disabled")).toBe(true);
    expect(nextBtn.hasAttribute("disabled")).toBe(false);

    // Clicking next switches to image 2: Left arrow becomes enabled
    fireEvent.click(nextBtn);
    expect(screen.getByText("2 / 3")).toBeDefined();
    expect(previewImg.getAttribute("src")).toBe("/assets/nila-thumb1.jpg");
    expect(prevBtn.hasAttribute("disabled")).toBe(false);
    expect(nextBtn.hasAttribute("disabled")).toBe(false);

    // Clicking next switches to image 3 (last image): Right arrow becomes disabled
    fireEvent.click(nextBtn);
    expect(screen.getByText("3 / 3")).toBeDefined();
    expect(previewImg.getAttribute("src")).toBe("/assets/nila-thumb3.jpg");
    expect(prevBtn.hasAttribute("disabled")).toBe(false);
    expect(nextBtn.hasAttribute("disabled")).toBe(true);

    // Clicking prev button switches back to image 2
    fireEvent.click(prevBtn);
    expect(screen.getByText("2 / 3")).toBeDefined();
    expect(prevBtn.hasAttribute("disabled")).toBe(false);
    expect(nextBtn.hasAttribute("disabled")).toBe(false);

    // Clicking prev button switches back to image 1: Left arrow becomes disabled again
    fireEvent.click(prevBtn);
    expect(screen.getByText("1 / 3")).toBeDefined();
    expect(prevBtn.hasAttribute("disabled")).toBe(true);
    expect(previewImg.getAttribute("src")).toBe("/assets/nila-thumb2.jpg");

    // Bottom "Close" text button is removed as requested
    expect(screen.queryByRole("button", { name: /^Close$/i })).toBeNull();

    // Rejection comment box is not shown initially
    expect(screen.queryByLabelText(/Rejection feedback comment in preview/i)).toBeNull();

    // Approve & Reject buttons exist inside the modal (cards have chevron arrow to open overlay)
    const approveBtns = screen.getAllByRole("button", { name: /Approve/i });
    const rejectBtns = screen.getAllByRole("button", { name: /Reject/i });
    expect(approveBtns.length).toBe(1);
    expect(rejectBtns.length).toBe(1);

    // Clicking Reject in the modal displays the rejection comment section
    const modalRejectBtn = screen.getByRole("button", { name: /Reject deliverable/i });
    fireEvent.click(modalRejectBtn);
    expect(screen.getAllByText("Rejected").length).toBeGreaterThanOrEqual(1);

    const commentInput = screen.getByLabelText(/Rejection feedback comment in preview/i);
    expect(commentInput).toBeDefined();

    // Entering feedback and clicking Submit Feedback adds the rejection comment
    fireEvent.change(commentInput, { target: { value: "Kitchen counter clearance needs to be at least 4 feet" } });
    const submitFeedbackBtns = screen.getAllByRole("button", { name: /Submit Feedback/i });
    fireEvent.click(submitFeedbackBtns[1]);

    expect(screen.getAllByText("Kitchen counter clearance needs to be at least 4 feet").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Client").length).toBeGreaterThanOrEqual(1);

    // Undo button is removed as requested
    expect(screen.queryByRole("button", { name: /Undo/i })).toBeNull();

    // Close preview button in header dismisses modal
    const closeBtn = screen.getByRole("button", { name: /Close preview/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole("dialog")).toBeNull();

    // Category review items removed in client view as requested
    expect(screen.queryByText("Task Reviews")).toBeNull();
    expect(screen.queryByText("Client Requests")).toBeNull();
    expect(screen.queryByText("BOQ / Quote Requests")).toBeNull();
    expect(screen.queryByText("Approval Requests")).toBeNull();

    // Before clicking "Review all", 2 deliverables are shown
    expect(screen.getByText("3D Design & Interior Concept")).toBeDefined();
    expect(screen.getByText("Italian Marble Flooring & Wall Cladding Specification")).toBeDefined();
    expect(screen.queryByText("MEP Electrical Point Marking & Conduit Layout")).toBeNull();
    expect(screen.queryByText("Teak Wood Joinery & Door/Window Schedule")).toBeNull();

    // Review all button expands multiple deliverables in a scroll container
    const reviewAllBtn = screen.getByRole("button", { name: /Review all/i });
    expect(reviewAllBtn).toBeDefined();

    fireEvent.click(reviewAllBtn);

    // After clicking "Review all", all items are listed
    expect(screen.getByText("3D Design & Interior Concept")).toBeDefined();
    expect(screen.getByText("Italian Marble Flooring & Wall Cladding Specification")).toBeDefined();
    expect(screen.getByText("MEP Electrical Point Marking & Conduit Layout")).toBeDefined();
    expect(screen.getByText("Teak Wood Joinery & Door/Window Schedule")).toBeDefined();
    expect(screen.getByText("4 items require your attention")).toBeDefined();

    // Button updates to "Show less"
    const showLessBtn = screen.getByRole("button", { name: /Show fewer items/i });
    expect(showLessBtn).toBeDefined();

    // Clicking "Show less" collapses back to 2 items
    fireEvent.click(showLessBtn);
    expect(screen.getByText("3D Design & Interior Concept")).toBeDefined();
    expect(screen.getByText("Italian Marble Flooring & Wall Cladding Specification")).toBeDefined();
    expect(screen.queryByText("MEP Electrical Point Marking & Conduit Layout")).toBeNull();
    expect(screen.queryByText("Teak Wood Joinery & Door/Window Schedule")).toBeNull();
    expect(screen.getByText("4 items require your attention")).toBeDefined();

    // HANDS in client view omits financial pricing
    expect(screen.getByText("18 Active Today")).toBeDefined();
    expect(screen.queryByText("₹16,850 Today's Spend")).toBeNull();

    // PROJECT MATERIALS in client view omits financial pricing
    expect(screen.getByText("Total Materials")).toBeDefined();
    expect(screen.getByText("Available on Site")).toBeDefined();
    expect(screen.getByText("Pending Procurement")).toBeDefined();
    expect(screen.queryByText("Total Spent")).toBeNull();
    expect(screen.queryByText("₹5.6L")).toBeNull();
    expect(screen.queryByText("₹2.8L")).toBeNull();
    expect(screen.queryByText("₹3.6L")).toBeNull();
    expect(screen.queryByText(/₹2.40L/i)).toBeNull();
    expect(screen.getByText(/2 of 4 materials delivered on-site/i)).toBeDefined();

    // TODAY'S ACTIVITY in client view displays key construction/finishing activities
    expect(screen.getByText("Site preparation")).toBeDefined();
    expect(screen.getByText("Floor tile installation")).toBeDefined();
    expect(screen.getByText("Internal plastering")).toBeDefined();
    expect(screen.getByText("Door frame installation")).toBeDefined();
    expect(screen.getByText("Painting")).toBeDefined();

    expect(screen.queryByText("Ramesh Kumar (Site Supervisor)")).toBeNull();
    expect(screen.queryByText("08:30 AM")).toBeNull();
    expect(screen.queryByText("Courtyard & Entrance Staging")).toBeNull();

    expect(screen.getByText("Total Planned")).toBeDefined();
  });
});

