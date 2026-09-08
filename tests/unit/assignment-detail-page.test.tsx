import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import { AssignmentDetailPage } from "@/partner-app/hands/components/assignment-detail/assignment-detail-page";
import { getAssignmentById } from "@/partner-app/hands/mock/assignments-mock-data";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/partner/hands/assignments/ASG-101",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

describe("AssignmentDetailPage - Full Dedicated Page View", () => {
  afterEach(cleanup);

  const assignment = getAssignmentById("ASG-101")!;

  it("renders page header with client name as heading, project location subtitle, status badge, and Call Supervisor button", () => {
    render(<AssignmentDetailPage assignment={assignment} />);

    expect(screen.getByRole("heading", { level: 1, name: "Greenwood Infra Projects Ltd" })).toBeDefined();
    expect(screen.getByText(/Greenwood Residency · Kazhakkoottam, Kerala/i)).toBeDefined();
    expect(screen.getByText("● Active Deployment")).toBeDefined();
    expect(screen.getByText("Day 12 of 30")).toBeDefined();
    expect(screen.getByText(/Call Supervisor \(Suresh Nair\)/i)).toBeDefined();
    expect(screen.queryByRole("button", { name: /Export Roster/i })).toBeNull();
  });

  it("renders overview tab with briefing, 4 snapshot cards, live attendance, and crew roster", () => {
    render(<AssignmentDetailPage assignment={assignment} />);

    // Overview is the default tab
    expect(screen.getByText("ODIN PROJECT BRIEF")).toBeDefined();
    expect(screen.getByText("AI-synthesized requirement assessment")).toBeDefined();
    expect(screen.getByText(/Greenwood Infra Projects Ltd has deployed/i)).toBeDefined();
    expect(screen.getByText("Crew Deployed")).toBeDefined();
    expect(screen.getByText("12 Workers")).toBeDefined();
    expect(screen.getByText("Shift Window")).toBeDefined();
    expect(screen.getByText("Live Shift Attendance")).toBeDefined();
    expect(screen.getByText("10 Present")).toBeDefined();
    expect(screen.getByText("1 Unmarked")).toBeDefined();
    expect(screen.getByText("1 Absent")).toBeDefined();

    // Crew roster list
    expect(screen.getByText("Rajesh Kumar")).toBeDefined();
    expect(screen.getByText("Biju K")).toBeDefined();
    expect(screen.getByPlaceholderText(/Search trade or worker/i)).toBeDefined();
  });

  it("filters crew roster when searching by name or trade", () => {
    render(<AssignmentDetailPage assignment={assignment} />);

    const searchInput = screen.getByPlaceholderText(/Search trade or worker/i);
    fireEvent.change(searchInput, { target: { value: "Rajesh" } });

    expect(screen.getByText("Rajesh Kumar")).toBeDefined();
    expect(screen.queryByText("Biju K")).toBeNull();
  });

  it("switches to Site Complaints tab, displays supervisor and provider complaints, and handles status resolution and filtering", () => {
    render(<AssignmentDetailPage assignment={assignment} />);

    const complaintsTab = screen.getByRole("button", { name: /Site Complaints/i });
    fireEvent.click(complaintsTab);

    expect(screen.getByText("Site Complaints & Impediments")).toBeDefined();
    expect(screen.getByText("Cement Mortar Sand Delivery Delay")).toBeDefined();
    expect(screen.getByText("Tower Crane Power Cable Fluctuation")).toBeDefined();
    expect(screen.getAllByText(/Raised by/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Site Supervisor/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Provider/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Today, 08:30 AM/i)).toBeDefined();

    // Filter by Provider
    const providerFilterBtn = screen.getByRole("button", { name: /^Provider$/i });
    fireEvent.click(providerFilterBtn);
    expect(screen.getByText("Tower Crane Power Cable Fluctuation")).toBeDefined();
    expect(screen.queryByText("Cement Mortar Sand Delivery Delay")).toBeNull();

    // Filter by Site Supervisor
    const supervisorFilterBtn = screen.getByRole("button", { name: /^Site Supervisor$/i });
    fireEvent.click(supervisorFilterBtn);
    expect(screen.getByText("Cement Mortar Sand Delivery Delay")).toBeDefined();
    expect(screen.queryByText("Tower Crane Power Cable Fluctuation")).toBeNull();

    // Reset filter to All
    const raisedByContainer = screen.getByText("Raised By:").parentElement!;
    const allRaiserBtn = within(raisedByContainer).getByRole("button", { name: /^All$/i });
    fireEvent.click(allRaiserBtn);
    expect(screen.getByText("Cement Mortar Sand Delivery Delay")).toBeDefined();
    expect(screen.getByText("Tower Crane Power Cable Fluctuation")).toBeDefined();

    // Resolve a complaint
    const resolveBtns = screen.getAllByRole("button", { name: /✓ Mark Resolved/i });
    fireEvent.click(resolveBtns[0]);

    expect(screen.getAllByText("✓ Resolved").length).toBeGreaterThan(0);
  });

  it("does not render Raise Complaint button and allows contractor to comment on unresolved complaints only", () => {
    render(<AssignmentDetailPage assignment={assignment} />);

    const complaintsTab = screen.getByRole("button", { name: /Site Complaints/i });
    fireEvent.click(complaintsTab);

    // Verify Raise Complaint and Add Note buttons are NOT rendered
    expect(screen.queryByRole("button", { name: /Raise Complaint/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Add Note/i })).toBeNull();

    // Verify Comment buttons are present for unresolved complaints
    const commentBtns = screen.getAllByRole("button", { name: /^Comment$/i });
    expect(commentBtns.length).toBe(2); // 2 unresolved complaints (cmp-101 and cmp-102)

    // Click Comment on first complaint
    fireEvent.click(commentBtns[0]);

    // Normal textarea composer opens
    const commentInput = screen.getByPlaceholderText(/Write a comment\.\.\./i);
    expect(commentInput).toBeDefined();

    fireEvent.change(commentInput, { target: { value: "Sand batch delivered on site at 2 PM. Work resumed." } });

    // Submit comment
    const submitBtn = screen.getByRole("button", { name: /Post Comment/i });
    fireEvent.click(submitBtn);

    // Verify comment is rendered in the thread
    expect(screen.getByText("Sand batch delivered on site at 2 PM. Work resumed.")).toBeDefined();
    expect(screen.getAllByText("You").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Contractor/i).length).toBeGreaterThan(0);

    // Verify clicking header button collapses and expands comments
    const toggleCommentsBtn = screen.getByRole("button", { name: /Comments \(2\)/i });
    expect(toggleCommentsBtn).toBeDefined();

    // Click to collapse
    fireEvent.click(toggleCommentsBtn);
    expect(screen.queryByText("Sand batch delivered on site at 2 PM. Work resumed.")).toBeNull();

    // Click to expand again
    fireEvent.click(toggleCommentsBtn);
    expect(screen.getByText("Sand batch delivered on site at 2 PM. Work resumed.")).toBeDefined();

    // Mark the complaint as resolved
    const resolveBtns = screen.getAllByRole("button", { name: /✓ Mark Resolved/i });
    fireEvent.click(resolveBtns[0]);

    // Verify card is now marked resolved AND still displays the added comment
    expect(screen.getAllByText("✓ Resolved").length).toBeGreaterThan(0);
    expect(screen.getByText("Sand batch delivered on site at 2 PM. Work resumed.")).toBeDefined();
  });

  it("switches to Accounts & Billing tab and displays financial metrics and trade wage rates", () => {
    render(<AssignmentDetailPage assignment={assignment} />);

    const accountsTab = screen.getByRole("button", { name: /Accounts & Billing/i });
    fireEvent.click(accountsTab);

    expect(screen.getByText("Total Contract Value")).toBeDefined();
    expect(screen.getByText("Daily Billing Rate")).toBeDefined();
    expect(screen.getByText("Paid to Date")).toBeDefined();
    expect(screen.getByText("Pending Settlement")).toBeDefined();
    expect(screen.getByText("Settlement Status & Billing Cycle")).toBeDefined();
    expect(screen.getByText(/Payment & Bill Details|Transaction Details/i)).toBeDefined();
    expect(screen.getByText(/Total Settled to Date/i)).toBeDefined();
    expect(screen.getByText("Milestone Deployment Advance")).toBeDefined();
    expect(screen.getByText("Weekly Deployment Settlement - Cycle 1")).toBeDefined();

    // Search and Filter Toolbar
    const searchInput = screen.getByPlaceholderText(/Search ID, scope, or UTR/i);
    expect(searchInput).toBeDefined();

    // Test Search filtering
    fireEvent.change(searchInput, { target: { value: "Advance" } });
    expect(screen.getByText("Milestone Deployment Advance")).toBeDefined();
    expect(screen.queryByText("Weekly Deployment Settlement - Cycle 1")).toBeNull();
    fireEvent.change(searchInput, { target: { value: "" } });

    // Test Status Filter pills
    const settledPill = screen.getByRole("button", { name: /Settled/i });
    expect(settledPill).toBeDefined();
    fireEvent.click(settledPill);
    expect(screen.getByText("Milestone Deployment Advance")).toBeDefined();
    expect(screen.queryByText("Weekly Deployment Settlement - Cycle 2")).toBeNull();

    const allPill = screen.getByRole("button", { name: /^All/i });
    fireEvent.click(allPill);

    // Export button in header
    const exportBtn = screen.getByRole("button", { name: /Export transactions/i });
    expect(exportBtn).toBeDefined();

    // Enhanced Pagination controls and Next / Back navigation
    expect(screen.getByText(/Showing/i)).toBeDefined();
    const page1Btn = screen.getByRole("button", { name: /Go to page 1/i });
    const page2Btn = screen.getByRole("button", { name: /Go to page 2/i });
    expect(page1Btn).toBeDefined();
    expect(page2Btn).toBeDefined();

    const prevBtn = screen.getByRole("button", { name: /Previous page/i }) as HTMLButtonElement;
    const nextBtn = screen.getByRole("button", { name: /Next page/i }) as HTMLButtonElement;

    expect(prevBtn.disabled).toBe(true);
    expect(nextBtn.disabled).toBe(false);

    // Click Next to advance to page 2
    fireEvent.click(nextBtn);
    expect(screen.getByText("Specialist Stone Masonry Incentive")).toBeDefined();
    expect(screen.queryByText("Milestone Deployment Advance")).toBeNull();
    expect(nextBtn.disabled).toBe(true);
    expect(prevBtn.disabled).toBe(false);

    // Click Back to return to page 1
    fireEvent.click(prevBtn);
    expect(screen.getByText("Milestone Deployment Advance")).toBeDefined();
    expect(screen.queryByText("Specialist Stone Masonry Incentive")).toBeNull();
    expect(prevBtn.disabled).toBe(true);

    // Click direct Page 2 number button
    fireEvent.click(page2Btn);
    expect(screen.getByText("Specialist Stone Masonry Incentive")).toBeDefined();
    fireEvent.click(page1Btn);
    expect(screen.getByText("Milestone Deployment Advance")).toBeDefined();
  });

  it("renders Work Updates feed on the right with communication, acknowledgement, and composer", () => {
    render(<AssignmentDetailPage assignment={assignment} />);

    // Feed header
    expect(screen.getByText("Work Updates")).toBeDefined();

    // Existing update from supervisor
    expect(screen.getByText(/Level 2 structural block masonry 85% complete/i)).toBeDefined();

    // Acknowledge toggle: starts as "Acknowledge", clicking toggles to green "Acknowledged"
    const ackBtn = screen.getAllByRole("button", { name: /^Acknowledge$/i })[0];
    fireEvent.click(ackBtn);
    expect(screen.getAllByText("Acknowledged").length).toBeGreaterThan(0);

    // Send a new update through composer
    const composerInput = screen.getByPlaceholderText(/Share update, site progress, or message Suresh Nair/i);
    fireEvent.change(composerInput, { target: { value: "Inspection team arriving at 2:00 PM today." } });

    const sendBtn = screen.getByRole("button", { name: /Send update/i });
    fireEvent.click(sendBtn);

    // Verify roles displayed near author names
    expect(screen.getAllByText(/· Site Supervisor/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/· Provider/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/· Contractor/i).length).toBeGreaterThan(0);

    // Verify Provider update is present in feed
    expect(screen.getAllByText("Greenwood Infra Projects Ltd").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/Site inspection and lintel beam alignment check/i)).toBeDefined();

    // Verify Contractor name is rendered instead of generic 'You'
    expect(screen.getAllByText("Apex Integrated Civil").length).toBeGreaterThan(0);

    // Verify inline reply composer opens with light border, transparent background, and black reply button
    const replyBtns = screen.getAllByRole("button", { name: /Reply/i });
    fireEvent.click(replyBtns[0]);

    const inlineReplyInput = screen.getByPlaceholderText(/Reply to (You|Suresh Nair|Apex Integrated Civil)\.\.\./i);
    expect(inlineReplyInput).toBeDefined();
    expect(inlineReplyInput.style.backgroundColor).toBe("transparent");
    expect(inlineReplyInput.style.borderColor).toBe("rgb(226, 232, 240)");

    const replySubmitBtn = inlineReplyInput.parentElement?.querySelector("button");
    expect(replySubmitBtn).not.toBeNull();
    expect(replySubmitBtn?.style.backgroundColor).toBe("rgb(15, 23, 42)");
    expect(replySubmitBtn?.style.color).toBe("rgb(255, 255, 255)");
  });

  it("renders completed assignment page with indigo Completed badge and settlement details", () => {
    const completedAssignment = getAssignmentById("ASG-107")!;
    render(<AssignmentDetailPage assignment={completedAssignment} />);

    expect(screen.getByRole("heading", { level: 1, name: "Sobha Developers" })).toBeDefined();
    expect(screen.getByText(/Sobha Silver Birch Enclave · Kaloor, Ernakulam/i)).toBeDefined();
    expect(screen.getByText("✓ Completed Successfully")).toBeDefined();
    expect(screen.getByText(/Shifts Delivered/i)).toBeDefined();
  });

  it("renders ASG-105 with supervisor avatar, unacknowledged updates by default, and allows acknowledgement toggle", () => {
    const asg105 = getAssignmentById("ASG-105")!;
    expect(asg105).toBeDefined();
    expect(asg105.supervisor.avatar).toBe("/assets/petra-avatar.jpg");

    render(<AssignmentDetailPage assignment={asg105} />);

    // Supervisor is Kiran Raj (appears in snapshot card and updates feed)
    expect(screen.getAllByText("Kiran Raj").length).toBeGreaterThan(0);

    // Work updates: starts as unacknowledged ("Acknowledge")
    const ackButtons = screen.getAllByRole("button", { name: /^Acknowledge$/i });
    expect(ackButtons.length).toBeGreaterThan(0);

    // Click to acknowledge
    fireEvent.click(ackButtons[0]);
    expect(screen.getAllByText("Acknowledged").length).toBeGreaterThan(0);
  });

  it("does not render Resolution Log section and hides review action button once in review", () => {
    const asg105 = getAssignmentById("ASG-105")!;
    render(<AssignmentDetailPage assignment={asg105} />);

    const complaintsTab = screen.getByRole("button", { name: /Site Complaints/i });
    fireEvent.click(complaintsTab);

    // Complaint in review: "Temporary Power Distribution Disruption"
    expect(screen.getByText("Temporary Power Distribution Disruption")).toBeDefined();
    // Badge shows "⏳ In Review"
    expect(screen.getByText("⏳ In Review")).toBeDefined();

    // Only the open complaint has "Start Review"; the in-review complaint has no review action button
    const startReviewBtns = screen.getAllByRole("button", { name: /Start Review/i });
    expect(startReviewBtns.length).toBe(1); // Only 1 for open complaint

    // Clicking "Start Review" on the open complaint transitions it to in_review and hides the button
    fireEvent.click(startReviewBtns[0]);
    expect(screen.queryByRole("button", { name: /Start Review/i })).toBeNull();

    // Both complaints are now in review, so only Comment and Mark Resolved action buttons exist
    const commentBtns = screen.getAllByRole("button", { name: /^Comment$/i });
    expect(commentBtns.length).toBe(2);
    const resolveBtns = screen.getAllByRole("button", { name: /✓ Mark Resolved/i });
    expect(resolveBtns.length).toBe(2);

    // Resolution log should NOT be rendered
    expect(screen.queryByText(/Resolution Log:/i)).toBeNull();

    // Now resolve the first complaint
    fireEvent.click(resolveBtns[0]);

    // Resolution log remains removed even when resolved
    expect(screen.queryByText(/Resolution Log:/i)).toBeNull();
  });

  it("renders Activities tab before Accounts & Billing with activity count badge", () => {
    render(<AssignmentDetailPage assignment={assignment} />);

    const activitiesTab = screen.getByRole("button", { name: /Activities/i });
    const accountsTab = screen.getByRole("button", { name: /Accounts & Billing/i });
    expect(activitiesTab).toBeDefined();
    expect(accountsTab).toBeDefined();

    // Verify Activities button precedes Accounts & Billing button in the DOM order
    expect(activitiesTab.compareDocumentPosition(accountsTab)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);

    // Verify count badge shows the count of activities (13 for ASG-101)
    expect(screen.getByText("13")).toBeDefined();
  });

  it("switches to Activities tab and renders site activities calendar with exact deployment design", () => {
    render(<AssignmentDetailPage assignment={assignment} />);

    const activitiesTab = screen.getByRole("button", { name: /Activities/i });
    fireEvent.click(activitiesTab);

    expect(screen.getByText("Site Activities & Task Calendar")).toBeDefined();
    expect(screen.getByText(/● Live Execution Schedule/i)).toBeDefined();
    expect(screen.getByText(/Labour tasks mapped to BOQ line items and Gantt milestones for Greenwood Residency/i)).toBeDefined();
    expect(screen.getByText("September 2026")).toBeDefined();
    expect(screen.getByText("Mon")).toBeDefined();
    expect(screen.getByText("Sun")).toBeDefined();

    // Contractor filter pills and contractor badges on task cards are removed from partner view
    expect(screen.queryByText(/Filter by Contractor:/i)).toBeNull();
    expect(screen.queryByRole("button", { name: /^All Contractors$/i })).toBeNull();
    expect(screen.queryByTitle(/Assigned to Apex Integrated Civil/i)).toBeNull();

    // Event chips in calendar columns have text color mapped to task status
    const inProgressChip = screen.getByTitle("Perimeter brick masonry & plumb line verification (in-progress)");
    expect(inProgressChip).toBeDefined();
    expect(inProgressChip.style.color).toBe("rgb(194, 65, 12)"); // #c2410c for in-progress

    const scheduledChip = screen.getByTitle("Lintel shuttering fabrication & heavy prop erection (scheduled)");
    expect(scheduledChip).toBeDefined();
    expect(scheduledChip.style.color).toBe("rgb(2, 132, 199)"); // #0284c7 for scheduled

    const completedChip = screen.getByTitle("Ground floor column curing & surface finish verification (completed)");
    expect(completedChip).toBeDefined();
    expect(completedChip.style.color).toBe("rgb(21, 128, 61)"); // #15803d for completed

    // Default selected date is today (Sep 8), displaying today's tasks
    expect(screen.getByText(/Tuesday, Sep 8, 2026/i)).toBeDefined();
    expect(screen.getAllByText("Perimeter brick masonry & plumb line verification").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Scaffolding staging adjustment & masonry working platform").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Lintel rebar placement check with site engineer").length).toBeGreaterThan(0);
  });

  it("updates activities list when clicking on date column in calendar (e.g. Sep 9)", () => {
    render(<AssignmentDetailPage assignment={assignment} />);

    const activitiesTab = screen.getByRole("button", { name: /Activities/i });
    fireEvent.click(activitiesTab);

    // Click on date cell for 2026-09-09
    const sep9Cell = screen.getByText(/^9$/).closest('[role="button"]');
    expect(sep9Cell).toBeDefined();
    if (sep9Cell) fireEvent.click(sep9Cell);

    // Header updates to Wednesday, Sep 9, 2026
    expect(screen.getByText(/Wednesday, Sep 9, 2026/i)).toBeDefined();
    expect(screen.getByText(/2 tasks scheduled for this date/i)).toBeDefined();

    // Shows Sep 9 pure labour execution tasks
    expect(screen.getAllByText("Lintel shuttering fabrication & heavy prop erection").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Lintel beam concrete casting, vibrator compaction & leveling").length).toBeGreaterThan(0);
    expect(screen.getByText("BOQ-06.2:")).toBeDefined();
    expect(screen.getAllByText(/38 lin m/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Phase 2: Superstructure Masonry & Lintel Level/i).length).toBeGreaterThan(0);

    // Verify Update Task and Cancel Task buttons are present
    expect(screen.getAllByRole("button", { name: /Update Task/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: /Cancel Task/i }).length).toBeGreaterThan(0);
  });

  it("filters activities by status dropdown selector", () => {
    render(<AssignmentDetailPage assignment={assignment} />);

    const activitiesTab = screen.getByRole("button", { name: /Activities/i });
    fireEvent.click(activitiesTab);

    // Contractor filter is not rendered in partner assignment
    expect(screen.queryByText(/Filter by Contractor:/i)).toBeNull();

    // Filter by Status: in-progress
    const statusSelect = screen.getByRole("combobox", { name: /Filter by Status/i });
    fireEvent.change(statusSelect, { target: { value: "in-progress" } });

    // In-progress task is displayed
    expect(screen.getAllByText("Perimeter brick masonry & plumb line verification").length).toBeGreaterThan(0);
    // Pending task is filtered out
    expect(screen.queryByText("Lintel rebar placement check with site engineer")).toBeNull();

    // Reset back to all
    fireEvent.change(statusSelect, { target: { value: "all" } });
    expect(screen.getAllByText("Perimeter brick masonry & plumb line verification").length).toBeGreaterThan(0);
  });

  it("opens Add Task modal without contractor dropdown, pre-fills selected date, and schedules new task in that column", () => {
    render(<AssignmentDetailPage assignment={assignment} />);

    const activitiesTab = screen.getByRole("button", { name: /Activities/i });
    fireEvent.click(activitiesTab);

    // Select date column 9 (Wednesday, Sep 9, 2026)
    const sep9Cell = screen.getByText(/^9$/).closest('[role="button"]');
    expect(sep9Cell).toBeDefined();
    if (sep9Cell) fireEvent.click(sep9Cell);

    // Click "Schedule Task for this Date" button
    const addBtn = screen.getByRole("button", { name: /Schedule Task for this Date/i });
    fireEvent.click(addBtn);

    // Add Task modal opens
    const modal = screen.getByRole("dialog");
    expect(within(modal).getByText("Add Site Execution Task")).toBeDefined();

    // Verify "Assigned Labour Contractor" dropdown is completely removed for partner view
    expect(within(modal).queryByLabelText(/Assigned Labour Contractor/i)).toBeNull();

    // Verify Scheduled Date field is present and pre-filled with 2026-09-09
    const dateInput = within(modal).getByLabelText(/Scheduled Date/i) as HTMLInputElement;
    expect(dateInput).toBeDefined();
    expect(dateInput.value).toBe("2026-09-09");

    // Fill out task title
    const titleInput = within(modal).getByLabelText(/Task Title/i);
    fireEvent.change(titleInput, { target: { value: "Lintel Band Rebar Inspection & Compaction" } });

    // Submit form
    const submitBtn = within(modal).getByRole("button", { name: /^Add Task$/ });
    fireEvent.click(submitBtn);

    // Modal closes
    expect(screen.queryByText("Add Site Execution Task")).toBeNull();

    // Verify task is immediately displayed in that column schedule
    expect(screen.getAllByText("Lintel Band Rebar Inspection & Compaction").length).toBeGreaterThan(0);
    expect(screen.getByText(/3 tasks scheduled for this date/i)).toBeDefined();
  });

  it("directly opens add task overlay when clicking empty calendar column and does not display as selected", () => {
    render(<AssignmentDetailPage assignment={assignment} />);

    const activitiesTab = screen.getByRole("button", { name: /Activities/i });
    fireEvent.click(activitiesTab);

    // Find the cell for Sep 12 (an empty column with 0 tasks)
    const sep12Cell = screen.getByText(/^12$/).closest('[role="button"]') as HTMLElement;
    expect(sep12Cell).toBeDefined();
    expect(sep12Cell.getAttribute("data-selected")).toBe("false");

    // Clicking directly on the empty column opens the overlay directly
    fireEvent.click(sep12Cell);

    // Overlay is open
    const modal = screen.getByRole("dialog");
    expect(within(modal).getByText("Add Site Execution Task")).toBeDefined();

    // Verify empty cell does NOT display as selected
    expect(sep12Cell.getAttribute("data-selected")).toBe("false");

    // The modal pre-fills with Sep 12
    const dateInput = within(modal).getByLabelText(/Scheduled Date/i) as HTMLInputElement;
    expect(dateInput.value).toBe("2026-09-12");

    // Close modal
    const closeBtn = within(modal).getByRole("button", { name: /Close add task modal/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByText("Add Site Execution Task")).toBeNull();

    // Verify empty cell renders centered + icon button with outline styling and without black fill
    const plusBtn = within(sep12Cell).getByRole("button", { name: /Add task for 2026-09-12/i });
    expect(plusBtn).toBeDefined();
    expect(plusBtn.className).toContain("partner-cell-add-btn");
    expect(plusBtn.style.backgroundColor).toBe("rgb(255, 255, 255)");
    expect(plusBtn.style.color).toBe("rgb(71, 85, 105)");
  });
});

