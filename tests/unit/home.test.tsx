import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import React from "react";
import { OdinProvider } from "@/contexts/odin-context";
import { HomeWorkspace } from "@/features/home";
import {
  calculatePriorityScore,
  calculateProjectHealth,
  hasCapability,
  homeWorkspaceService,
  rankNeedsAttentionItems,
} from "@/services/repositories/home-workspace-service";
import { practiceSetupService } from "@/services/repositories/practice-setup-service";
import { PriorityPreview } from "@/types/domain/home";

afterEach(cleanup);

describe("Needs Attention Scoring Algorithm & Tie-Breaker Tests", () => {
  it("clamps overdue days and remaining hours to non-negative values", () => {
    const now = new Date("2026-07-21T12:00:00Z");

    const futureItem: PriorityPreview = {
      id: "fut-1",
      tag: "Future task",
      projectName: "Test Project",
      state: "scheduled",
      priorityLevel: "medium",
      dueDate: "2026-07-22T12:00:00Z", // 24 hours in future
      actionLabel: "Open",
      destination: { availability: "available", route: "/projects" },
    };

    const overdueItem: PriorityPreview = {
      id: "over-1",
      tag: "Overdue task",
      projectName: "Test Project",
      state: "overdue",
      priorityLevel: "medium",
      dueDate: "2026-07-19T12:00:00Z", // 2 days in past
      actionLabel: "Open",
      destination: { availability: "available", route: "/projects" },
    };

    const futureScore = calculatePriorityScore(futureItem, now);
    const overdueScore = calculatePriorityScore(overdueItem, now);

    // Future item should decay by 24 * 2 = 48 points, overdueDays = 0
    expect(futureScore).toBe(200 - 48);

    // Overdue item should add 2 * 50 = 100 points, hoursUntilDeadline = 0
    expect(overdueScore).toBe(200 + 100);
  });

  it("caps financial exposure at 1,000,000 INR", () => {
    const now = new Date("2026-07-21T12:00:00Z");

    const cappedItem: PriorityPreview = {
      id: "cap-1",
      tag: "Large contract",
      projectName: "Test Project",
      state: "pending",
      priorityLevel: "medium",
      dueDate: now.toISOString(),
      financialExposure: 5_000_000, // ₹50L exceeds ₹10L cap
      actionLabel: "Review",
      destination: { availability: "available", route: "/projects" },
    };

    const maxItem: PriorityPreview = {
      id: "max-1",
      tag: "Max cap contract",
      projectName: "Test Project",
      state: "pending",
      priorityLevel: "medium",
      dueDate: now.toISOString(),
      financialExposure: 1_000_000, // ₹10L exact cap
      actionLabel: "Review",
      destination: { availability: "available", route: "/projects" },
    };

    const cappedScore = calculatePriorityScore(cappedItem, now);
    const maxScore = calculatePriorityScore(maxItem, now);

    // Both should yield maximum financial score contribution of 300
    expect(cappedScore).toBe(200 + 300);
    expect(maxScore).toBe(200 + 300);
  });

  it("applies deterministic tie-breaking order", () => {
    const now = new Date("2026-07-21T12:00:00Z");

    // Item A vs Item B with equal scores but A is project blocking
    const itemA: PriorityPreview = {
      id: "tie-a",
      tag: "Blocking Task",
      projectName: "Proj A",
      state: "pending",
      priorityLevel: "medium",
      dueDate: now.toISOString(),
      isProjectBlocking: true,
      actionLabel: "Fix",
      destination: { availability: "available", route: "/projects" },
    };

    const itemB: PriorityPreview = {
      id: "tie-b",
      tag: "Non Blocking Task",
      projectName: "Proj B",
      state: "pending",
      priorityLevel: "medium",
      dueDate: now.toISOString(),
      isProjectBlocking: false,
      actionLabel: "Fix",
      destination: { availability: "available", route: "/projects" },
    };

    const ranked = rankNeedsAttentionItems([itemB, itemA], now);
    expect(ranked[0].id).toBe("tie-a");
  });
});

describe("Calculated Project Health Tests", () => {
  it("correctly evaluates project health statuses", () => {
    expect(calculateProjectHealth({ pendingApprovalsCount: 0, overdueTasksCount: 0 })).toBe("healthy");
    expect(calculateProjectHealth({ pendingApprovalsCount: 1, overdueTasksCount: 0 })).toBe("watch");
    expect(calculateProjectHealth({ pendingApprovalsCount: 2, overdueTasksCount: 0 })).toBe("at-risk");
    expect(calculateProjectHealth({ pendingApprovalsCount: 0, overdueTasksCount: 1 })).toBe("at-risk");
    expect(calculateProjectHealth({ pendingApprovalsCount: 1, overdueTasksCount: 2 })).toBe("blocked");
  });
});

describe("Capability Authorization & Data Masking Tests", () => {
  it("restricts financial data and private calendar events for unauthorized roles", async () => {
    // Designer role lacks financials.view and calendar.private.view
    expect(hasCapability("designer", "financials.view")).toBe(false);
    expect(hasCapability("designer", "calendar.private.view")).toBe(false);

    const projects = await homeWorkspaceService.getActiveProjects("designer");
    expect(projects[0].expectedPayment).toBeUndefined();

    const schedule = await homeWorkspaceService.getTodaySchedulePreview("designer");
    const privateEvent = schedule.find((e) => e.isPrivate);
    expect(privateEvent?.title).toBe("Busy");
    expect(privateEvent?.projectName).toBe("Private Event");
  });
});

describe("Idempotent Approval & Rejection Workflow Tests", () => {
  it("prevent execution without required capability", async () => {
    const result = await homeWorkspaceService.executeApprovalAction({
      requestId: "req-101",
      action: "approve",
      idempotencyKey: "test-idem-1",
      expectedVersion: 1,
      userRole: "read_only",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Insufficient permissions");
  });

  it("detects stale records when version mismatches", async () => {
    const result = await homeWorkspaceService.executeApprovalAction({
      requestId: "req-101",
      action: "approve",
      idempotencyKey: "test-idem-stale",
      expectedVersion: 99, // Mismatched version
      userRole: "owner",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Stale record");
  });

  it("requires rejection reason when rejecting", async () => {
    const result = await homeWorkspaceService.executeApprovalAction({
      requestId: "req-101",
      action: "reject",
      rejectionReason: "", // Empty reason
      idempotencyKey: "test-idem-reject-empty",
      expectedVersion: 1,
      userRole: "owner",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Rejection reason is required");
  });

  it("executes approval idempotently", async () => {
    const key = "test-idem-success";
    const firstRes = await homeWorkspaceService.executeApprovalAction({
      requestId: "req-101",
      action: "approve",
      idempotencyKey: key,
      expectedVersion: 1,
      userRole: "owner",
    });

    expect(firstRes.success).toBe(true);
    expect(firstRes.newStatus).toBe("Approved");
    expect(firstRes.serverTimestamp).toBeDefined();

    // Repeated call with same idempotency key returns same result idempotently
    const secondRes = await homeWorkspaceService.executeApprovalAction({
      requestId: "req-101",
      action: "approve",
      idempotencyKey: key,
      expectedVersion: 1,
      userRole: "owner",
    });

    expect(secondRes.success).toBe(true);
    expect(secondRes.newStatus).toBe("Approved");
  });
});

describe("HomeWorkspace Page Component Tests", () => {
  it("renders welcome greeting, assigned projects, and dashboard widgets", async () => {
    render(
      <OdinProvider>
        <HomeWorkspace userRole="owner" userName="Arjun" />
      </OdinProvider>
    );

    // Section 1: Header Welcome Greeting Title
    expect(await screen.findByRole("heading", { name: /good (morning|afternoon|evening), arjun/i })).toBeInTheDocument();

    // Verify Your Work Today section is removed
    expect(screen.queryByRole("heading", { name: /^your work today$/i })).not.toBeInTheDocument();

    // Section 1.5: Practice Setup Card
    expect(screen.getByRole("heading", { name: /^complete your practice setup$/i })).toBeInTheDocument();
    expect(screen.getByText("Account Setup")).toBeInTheDocument();
    expect(screen.getAllByText("Business Profile")[0]).toBeInTheDocument();
    expect(screen.getByText("Portfolio")).toBeInTheDocument();
    expect(screen.getByText("Verification")).toBeInTheDocument();

    // Section 2: Assigned Projects Heading
    expect(screen.getByRole("heading", { name: /^assigned projects$/i })).toBeInTheDocument();

    // Section 4: Dashboard Widgets
    expect(screen.getByRole("heading", { name: /^schedule$/i })).toBeInTheDocument();

    // Section 5: Studio Section
    expect(screen.getByRole("heading", { name: /^studio$/i })).toBeInTheDocument();

    // Verify other sections are not rendered
    expect(screen.queryByRole("heading", { name: /^recent activity$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /^action required$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /^active projects$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /^main calendar workspace$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /^requests and approvals$/i })).not.toBeInTheDocument();
  }, 15000);

  it("renders welcome header metadata (date, attention items, service area) and allows area changes", async () => {
    render(
      <OdinProvider>
        <HomeWorkspace userRole="owner" userName="Arjun" />
      </OdinProvider>
    );

    // 1. Verify Service Area label is rendered
    expect(screen.getByText(/Service area:/i)).toBeInTheDocument();
    expect(screen.getByText(/Kochi, Kerala/i)).toBeInTheDocument();

    // 4. Verify clicking "Change" button opens dialog and changing region updates text
    const changeBtn = screen.getByRole("button", { name: /change/i });
    expect(changeBtn).toBeInTheDocument();

    fireEvent.click(changeBtn);

    // Dialog should be open, verify dialog title is displayed
    expect(screen.getByRole("heading", { name: /change primary service area/i })).toBeInTheDocument();

    // Select different service area e.g. "Bengaluru, Karnataka"
    const radioOption = screen.getByLabelText("Bengaluru, Karnataka");
    fireEvent.click(radioOption);

    // Click "Save Service Area"
    const saveBtn = screen.getByRole("button", { name: /save service area/i });
    fireEvent.click(saveBtn);

    // Verify dialog is closed and header service area is updated to Bengaluru
    expect(screen.queryByRole("heading", { name: /change primary service area/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Bengaluru, Karnataka/i)).toBeInTheDocument();

    // 5. Verify Service Availability Toggle on the right
    const availabilitySwitch = screen.getByRole("switch", { name: /toggle service availability/i });
    expect(availabilitySwitch).toBeInTheDocument();
    expect(availabilitySwitch).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText(/available for service/i)).toBeInTheDocument();

    // Toggle switch OFF
    fireEvent.click(availabilitySwitch);
    expect(availabilitySwitch).toHaveAttribute("aria-checked", "false");
    expect(screen.getByText(/service paused/i)).toBeInTheDocument();

    // Toggle switch ON again
    fireEvent.click(availabilitySwitch);
    expect(availabilitySwitch).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText(/available for service/i)).toBeInTheDocument();
  }, 15000);

  it("renders the 2-section workspace with right-side intelligence panel", async () => {
    render(
      <OdinProvider>
        <HomeWorkspace userRole="owner" userName="Arjun" />
      </OdinProvider>
    );

    // 1. Right Sidebar: ODIN Studio Insights
    expect(screen.getByText(/ODIN STUDIO INSIGHTS/i)).toBeInTheDocument();
    expect(screen.getByText(/3 Active/i)).toBeInTheDocument();

    // 2. Right Sidebar: Action Required
    expect(screen.getByText(/ACTION REQUIRED/i)).toBeInTheDocument();
  }, 15000);
});

describe("Practice Setup Operational Weighting & Visibility Rules", () => {
  it("calculates initial weighted completion percentage and next action target", () => {
    const progress = practiceSetupService.getProgress();

    expect(progress.stages.map((s: any) => s.title)).toEqual([
      "Account Setup",
      "Business Profile",
      "Portfolio",
      "Verification",
    ]);

    expect(progress.totalPercentage).toBe(42);
    expect(progress.displayMode).toBe("full_card");
    expect(progress.nextStepTitle).toBe("Business Profile");
    expect(progress.nextStepRoute).toBe("/settings/business-profile");
  });

  it("handles in_review and requires_attention visibility modes", () => {
    // In Review state
    practiceSetupService.updateState({
      verification: {
        hasIdentityDoc: true,
        hasBusinessProof: true,
        hasBankInfo: true,
        isSubmitted: true,
        status: "in_review",
      },
    });

    let progress = practiceSetupService.getProgress();
    expect(progress.displayMode).toBe("in_review_banner");

    // Attention state
    practiceSetupService.updateState({
      verification: {
        hasIdentityDoc: true,
        hasBusinessProof: false,
        hasBankInfo: true,
        isSubmitted: false,
        status: "requires_attention",
        attentionReason: "Business proof document illegible",
      },
    });

    progress = practiceSetupService.getProgress();
    expect(progress.displayMode).toBe("attention_card");
    expect(progress.attentionReason).toBe("Business proof document illegible");
  });
});

describe("Calendar Date Indicator Logic Tests", () => {
  it("evaluates hasActiveOrUpcomingEvents according to exact specification rules", async () => {
    const { hasActiveOrUpcomingEvents } = await import(
      "@/features/home/components/workspace-dashboard-section"
    );

    // 1. If date has 0 events -> false (show no dot)
    expect(hasActiveOrUpcomingEvents([])).toBe(false);
    expect(hasActiveOrUpcomingEvents(undefined)).toBe(false);

    // 2. If date has 1 active/upcoming event -> true (show exactly 1 dot)
    expect(
      hasActiveOrUpcomingEvents([
        {
          id: "ev-1",
          time: "09:00 AM",
          title: "Site Inspection",
          badge: "INSPECTION",
          location: "Kochi",
          dotColor: "#0ea5e9",
          status: "upcoming",
        },
      ])
    ).toBe(true);

    // 3. If date has 5 events -> true (number of events does not change dot presence)
    expect(
      hasActiveOrUpcomingEvents([
        { id: "1", time: "9am", title: "A", badge: "A", location: "K", dotColor: "#000", status: "active" },
        { id: "2", time: "10am", title: "B", badge: "B", location: "K", dotColor: "#000", status: "upcoming" },
        { id: "3", time: "11am", title: "C", badge: "C", location: "K", dotColor: "#000", status: "upcoming" },
        { id: "4", time: "1pm", title: "D", badge: "D", location: "K", dotColor: "#000", status: "upcoming" },
        { id: "5", time: "2pm", title: "E", badge: "E", location: "K", dotColor: "#000", status: "upcoming" },
      ])
    ).toBe(true);

    // 4. Completed events should NOT create the blue indicator
    expect(
      hasActiveOrUpcomingEvents([
        {
          id: "ev-comp",
          time: "09:00 AM",
          title: "Finished Pour",
          badge: "INSPECTION",
          location: "Site",
          dotColor: "#0ea5e9",
          status: "completed",
        },
      ])
    ).toBe(false);

    // 5. Cancelled events should NOT create the blue indicator
    expect(
      hasActiveOrUpcomingEvents([
        {
          id: "ev-canc",
          time: "09:00 AM",
          title: "Cancelled Meeting",
          badge: "COORDINATION",
          location: "Site",
          dotColor: "#0ea5e9",
          status: "cancelled",
        },
      ])
    ).toBe(false);

    // 6. Mixed completed and upcoming events -> show dot because active/upcoming > 0
    expect(
      hasActiveOrUpcomingEvents([
        {
          id: "ev-comp-1",
          time: "08:00 AM",
          title: "Morning Safety Drill",
          badge: "SAFETY",
          location: "Site",
          dotColor: "#ef4444",
          status: "completed",
        },
        {
          id: "ev-up-2",
          time: "02:00 PM",
          title: "Client Presentation",
          badge: "PRESENTATION",
          location: "Studio",
          dotColor: "#ec4899",
          status: "upcoming",
        },
      ])
    ).toBe(true);
  });
});

