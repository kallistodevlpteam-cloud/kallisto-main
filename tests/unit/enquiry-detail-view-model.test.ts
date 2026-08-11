import { describe, expect, it } from "vitest";

import { buildEnquiryDetailViewModel } from "@/features/enquiries/detail/services/enquiry-detail-view-model";
import type { EnquiryRecord } from "@/features/enquiries/types/enquiry.types";

function baseRecord(): EnquiryRecord {
  return {
    id: "prj-4",
    title: "Harbor Heights",
    requirementSummary: "Residential fit-out for a coastal villa.",
    clientName: "Ananya Builders",
    location: "Kochi",
    thumbnailUrl: "https://example.com/cover.jpg",
    source: "website",
    status: "active",
    stage: "new",
    projectType: "residential",
    budgetMin: 0,
    budgetMax: 0,
    receivedAt: "2026-07-23T10:00:00Z",
    nextAction: { type: "review_enquiry", label: "Review Requirements" },
  };
}

describe("buildEnquiryDetailViewModel project type sourcing", () => {
  it("renders the raw backend project_type when present", () => {
    const record = baseRecord();
    record.backendProjectType = "Residential";
    const { header, snapshot } = buildEnquiryDetailViewModel({
      enquiry: record,
      providerContext: {},
    });
    expect(header.projectType).toBe("Residential");
    expect(snapshot.projectType).toBe("Residential");
  });

  it("renders the raw backend project_type even when it is not in the client enum", () => {
    const record = baseRecord();
    record.backendProjectType = "Mixed Use";
    const { header } = buildEnquiryDetailViewModel({ enquiry: record, providerContext: {} });
    expect(header.projectType).toBe("Mixed Use");
  });

  it("falls back to the enum label only when the backend value is missing", () => {
    const record = baseRecord();
    record.backendProjectType = null;
    const { header } = buildEnquiryDetailViewModel({ enquiry: record, providerContext: {} });
    expect(header.projectType).toBe("Residential Design");
  });
});

describe("buildEnquiryDetailViewModel scope sourcing", () => {
  it("renders scope_name and item_name lists straight from backend project_scope rows", () => {
    const record = baseRecord();
    record.projectScopes = [
      { id: 34, scope_name: "Concept & Schematic Design", items: ["Concept design", "Design brief validation"] },
      { id: 35, scope_name: "Working Drawings", items: ["Architectural drawings", "Structural detailing"] },
    ];
    const { scopeGroups } = buildEnquiryDetailViewModel({ enquiry: record, providerContext: {} });
    expect(scopeGroups).toEqual([
      {
        title: "Concept & Schematic Design",
        items: [
          { label: "Concept design", confirmed: true },
          { label: "Design brief validation", confirmed: true },
        ],
        scopeId: 34,
        sortOrder: 1,
      },
      {
        title: "Working Drawings",
        items: [
          { label: "Architectural drawings", confirmed: true },
          { label: "Structural detailing", confirmed: true },
        ],
        scopeId: 35,
        sortOrder: 2,
      },
    ]);
  });

  it("uses backend scope rows even when they would have been classified as commercial", () => {
    const record = baseRecord();
    record.projectType = "commercial";
    record.projectScopes = [
      { id: 30, scope_name: "Interior Fit-out", items: ["Space planning", "Material palette"] },
    ];
    const { scopeGroups } = buildEnquiryDetailViewModel({ enquiry: record, providerContext: {} });
    expect(scopeGroups[0].title).toBe("Interior Fit-out");
    expect(scopeGroups[0].items[0].label).toBe("Space planning");
    expect(scopeGroups.length).toBe(1);
  });

  it("falls back to default groups only when the backend has no scope rows", () => {
    const record = baseRecord();
    record.projectScopes = [];
    const { scopeGroups } = buildEnquiryDetailViewModel({ enquiry: record, providerContext: {} });
    expect(scopeGroups.length).toBeGreaterThan(0);
    expect(scopeGroups[0].scopeId).toBeUndefined();
  });
});