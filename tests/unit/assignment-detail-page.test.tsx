import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
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

  it("switches to Site Complaints tab, displays supervisor complaints, and handles status resolution", () => {
    render(<AssignmentDetailPage assignment={assignment} />);

    const complaintsTab = screen.getByRole("button", { name: /Site Complaints/i });
    fireEvent.click(complaintsTab);

    expect(screen.getByText("Site Complaints & Impediments")).toBeDefined();
    expect(screen.getByText("Cement Mortar Sand Delivery Delay")).toBeDefined();
    expect(screen.getByText("Tower Crane Power Cable Fluctuation")).toBeDefined();
    expect(screen.queryByText(/Raised by/i)).toBeNull();
    expect(screen.getByText(/Today, 08:30 AM/i)).toBeDefined();

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
    expect(screen.getByText("Transaction Details")).toBeDefined();
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

    // Verify new message appears in the updates feed
    expect(screen.getByText("Inspection team arriving at 2:00 PM today.")).toBeDefined();

    // Verify inline reply composer opens with light border, transparent background, and black reply button
    const replyBtns = screen.getAllByRole("button", { name: /Reply/i });
    fireEvent.click(replyBtns[0]);

    const inlineReplyInput = screen.getByPlaceholderText(/Reply to (You|Suresh Nair)\.\.\./i);
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
});

