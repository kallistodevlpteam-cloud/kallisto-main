import { describe, it, expect } from "vitest";
import { filterEnquiries, sortEnquiries, paginateEnquiries } from "./filter-enquiries";
import { formatEnquiryBudgetRange } from "./format-enquiry-budget";
import { formatEnquiryDate, formatNextActionMeta } from "./format-enquiry-date";
import { EnquiryRecord } from "../types/enquiry.types";

const MOCK_ITEMS: EnquiryRecord[] = [
  {
    id: "1",
    title: "Luxury Mansion",
    requirementSummary: "Needs high-end luxury villa design with modern amenities.",
    clientName: "Ananya Builders",
    location: "Kochi",
    thumbnailUrl: "/thumb.png",
    source: "website",
    status: "needs_attention",
    stage: "new",
    projectType: "residential",
    budgetMin: 1800000,
    budgetMax: 2500000,
    receivedAt: "2026-07-23T10:45:00.000Z",
    nextAction: {
      type: "review_enquiry",
      label: "Review enquiry",
      dueAt: "2026-07-23T18:00:00.000Z",
      state: "urgent",
    },
  },
  {
    id: "2",
    title: "Co-working Space",
    requirementSummary: "A modern commercial workspace design with collaborative spaces.",
    clientName: "Greenleaf Spaces",
    location: "Bengaluru",
    thumbnailUrl: "/thumb.png",
    source: "referral",
    status: "active",
    stage: "clarification",
    projectType: "commercial",
    budgetMin: 4000000,
    budgetMax: 6000000,
    receivedAt: "2026-07-23T09:12:00.000Z",
    nextAction: {
      type: "request_clarification",
      label: "Request clarification",
      dueAt: "2026-07-23T17:00:00.000Z",
      state: "urgent",
    },
  },
  {
    id: "3",
    title: "Eco Villa",
    requirementSummary: "Adding sustainable energy features to an eco-friendly villa.",
    clientName: "Ananya Builders",
    location: "Kochi",
    thumbnailUrl: "/thumb.png",
    source: "website",
    status: "needs_attention",
    stage: "new",
    projectType: "residential",
    budgetMin: 1000000,
    budgetMax: 1500000,
    receivedAt: "2026-07-23T09:12:00.000Z", // Same timestamp as Co-working Space for testing stable sort
    nextAction: {
      type: "convert_to_project",
      label: "Convert to project",
      state: "ready",
    },
  },
];

const FIXED_NOW = new Date("2026-07-23T12:00:00.000Z");

describe("Enquiry Filtering & Searching", () => {
  it("should match query on title case-insensitively", () => {
    const results = filterEnquiries(MOCK_ITEMS, { q: "mansion", status: null, source: null, type: null, stage: null });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("1");
  });

  it("should match query on client name and location", () => {
    const results = filterEnquiries(MOCK_ITEMS, { q: "greenleaf", status: null, source: null, type: null, stage: null });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("2");
  });

  it("should match query on requirementSummary", () => {
    const results = filterEnquiries(MOCK_ITEMS, { q: "collaborative", status: null, source: null, type: null, stage: null });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("2");
  });

  it("should normalize multiple whitespace spaces in search query", () => {
    const results = filterEnquiries(MOCK_ITEMS, { q: "ananya   kochi", status: null, source: null, type: null, stage: null });
    expect(results).toHaveLength(2);
  });

  it("should match multiple combined filters (status, source, type, stage)", () => {
    const results = filterEnquiries(MOCK_ITEMS, {
      q: "",
      status: "needs_attention",
      source: "website",
      type: "residential",
      stage: "new",
    });
    expect(results).toHaveLength(2);
  });
});

describe("Enquiry Sorting (Stable Sort)", () => {
  it("should sort received_desc and keep original order for equal timestamps", () => {
    const sorted = sortEnquiries(MOCK_ITEMS, "received_desc");
    expect(sorted[0].id).toBe("1"); // 10:45 AM
    expect(sorted[1].id).toBe("2"); // 09:12 AM (original index 1)
    expect(sorted[2].id).toBe("3"); // 09:12 AM (original index 2)
  });

  it("should sort received_asc and keep original order for equal timestamps", () => {
    const sorted = sortEnquiries(MOCK_ITEMS, "received_asc");
    expect(sorted[0].id).toBe("2"); // 09:12 AM (original index 1)
    expect(sorted[1].id).toBe("3"); // 09:12 AM (original index 2)
    expect(sorted[2].id).toBe("1"); // 10:45 AM
  });
});

describe("Enquiry Pagination", () => {
  it("should slice items correctly", () => {
    const paginated = paginateEnquiries(MOCK_ITEMS, 1, 2);
    expect(paginated).toHaveLength(2);
    expect(paginated[0].id).toBe("1");
    expect(paginated[1].id).toBe("2");
  });
});

describe("Enquiry Budget Formatting", () => {
  it("should format whole rupees to Indian compact notation correctly", () => {
    expect(formatEnquiryBudgetRange(1800000, 2500000)).toBe("₹18L–25L");
    expect(formatEnquiryBudgetRange(4000000, 6000000)).toBe("₹40L–60L");
    expect(formatEnquiryBudgetRange(6000000, 10000000)).toBe("₹60L–1Cr");
  });
});

describe("Enquiry Date & Next Action Formatting", () => {
  it("should format relative dates correctly", () => {
    expect(formatEnquiryDate("2026-07-23T10:45:00.000Z", FIXED_NOW)).toBe("Today, 10:45 AM");
    expect(formatEnquiryDate("2026-07-22T16:30:00.000Z", FIXED_NOW)).toBe("Yesterday, 04:30 PM");
    expect(formatEnquiryDate("2026-05-18T10:00:00.000Z", FIXED_NOW)).toBe("May 18, 2026");
  });

  it("should format next action states correctly", () => {
    const actionUrgent = { type: "review_enquiry" as const, label: "Review", dueAt: "2026-07-23T18:00:00.000Z", state: "urgent" as const };
    const actionReady = { type: "convert_to_project" as const, label: "Convert", state: "ready" as const };
    const actionCompleted = { type: "mark_as_lost" as const, label: "Lost", state: "completed" as const };

    expect(formatNextActionMeta(actionUrgent, FIXED_NOW)).toBe("Due today");
    expect(formatNextActionMeta(actionReady, FIXED_NOW)).toBe("When ready");
    expect(formatNextActionMeta(actionCompleted, FIXED_NOW)).toBe("Completed");
  });
});
