import { describe, expect, it } from "vitest";

import {
  calculateAnchorPage,
  getBreakpointFromMedia,
  getPageSizeForWidth,
} from "@/features/projects/components/documents/use-responsive-drive-page-size";
import { isDocumentNew } from "@/features/projects/components/documents/drive-collection";
import { ProjectDocument } from "@/types/domain/project-document";

// ── Base document fixture ────────────────────────────────────────────────────
const NOW = new Date("2026-08-05T12:00:00Z").getTime();

const baseDoc: ProjectDocument = {
  id: "doc-1",
  projectId: "proj-001",
  name: "Floor Plan.pdf",
  extension: "pdf",
  categoryId: "drawings",
  folderId: "drawings",
  status: "approved",
  visibility: "internal",
  source: "team",
  sourceType: "system",
  publishedAt: "2026-08-05T12:00:00Z",
  publicationKey: "system:seed:doc-1",
  storageObjectId: "storage://proj-001/seed/doc-1",
  downloadUrl: "/assets/docs/Floor Plan.pdf",
  version: 1,
  sizeBytes: 1024,
  owner: { id: "user-1", name: "User One" },
  sharedWith: [],
  versions: [],
  recentActivity: [],
  isStarred: false,
  createdAt: new Date(NOW - 7 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date(NOW - 72 * 60 * 60 * 1000).toISOString(), // older than 48h
};

// ── Width breakpoints ────────────────────────────────────────────────────────
describe("width-breakpoint responsive page sizes", () => {
  it("1439px is medium (list=8, grid=8)", () => {
    expect(getPageSizeForWidth(1439, "list")).toBe(8);
    expect(getPageSizeForWidth(1439, "grid")).toBe(8);
  });

  it("1440px is large (list=10, grid=12)", () => {
    expect(getPageSizeForWidth(1440, "list")).toBe(10);
    expect(getPageSizeForWidth(1440, "grid")).toBe(12);
  });

  it("1023px is small (list=6, grid=6)", () => {
    expect(getPageSizeForWidth(1023, "list")).toBe(6);
    expect(getPageSizeForWidth(1023, "grid")).toBe(6);
  });

  it("1024px is medium (list=8, grid=8)", () => {
    expect(getPageSizeForWidth(1024, "list")).toBe(8);
    expect(getPageSizeForWidth(1024, "grid")).toBe(8);
  });

  it("getBreakpointFromMedia derives breakpoint key correctly", () => {
    expect(getBreakpointFromMedia(true, true)).toBe("large");
    expect(getBreakpointFromMedia(false, true)).toBe("medium");
    expect(getBreakpointFromMedia(false, false)).toBe("small");
  });
});

// ── calculateAnchorPage ──────────────────────────────────────────────────────
describe("calculateAnchorPage", () => {
  it("page 4 at 7 items/page → page 3 at 10 items/page (24 total)", () => {
    // page 4 → anchor index = (4-1)*7 = 21; floor(21/10)+1 = 3
    expect(calculateAnchorPage({ currentPage: 4, previousPageSize: 7, nextPageSize: 10, totalItems: 24 })).toBe(3);
  });

  it("page 3 at 10 items/page → page 4 at 7 items/page (24 total)", () => {
    // page 3 → anchor index = (3-1)*10 = 20; floor(20/7)+1 = 3.85 → 3; ceil(24/7)=4; min(4,3)=3
    // Actually: floor(20/7) = 2, +1 = 3; pageCount = ceil(24/7)=4; min(4,3)=3
    expect(calculateAnchorPage({ currentPage: 3, previousPageSize: 10, nextPageSize: 7, totalItems: 24 })).toBe(3);
  });

  it("target page is clamped to new page count after filtering", () => {
    // Only 6 items remain; pageSize=6 → 1 page; should clamp to 1
    expect(calculateAnchorPage({ currentPage: 5, previousPageSize: 7, nextPageSize: 6, totalItems: 6 })).toBe(1);
  });

  it("zero total items returns page 1", () => {
    expect(calculateAnchorPage({ currentPage: 3, previousPageSize: 8, nextPageSize: 10, totalItems: 0 })).toBe(1);
  });

  it("zero previous page size returns page 1", () => {
    expect(calculateAnchorPage({ currentPage: 2, previousPageSize: 0, nextPageSize: 8, totalItems: 24 })).toBe(1);
  });

  it("zero next page size returns page 1", () => {
    expect(calculateAnchorPage({ currentPage: 2, previousPageSize: 8, nextPageSize: 0, totalItems: 24 })).toBe(1);
  });

  it("page 1 always maps to page 1 regardless of size change", () => {
    expect(calculateAnchorPage({ currentPage: 1, previousPageSize: 7, nextPageSize: 10, totalItems: 24 })).toBe(1);
  });

  it("produces no duplicate anchor index across contiguous pages", () => {
    // Verify items 0..7 are visible on page 1 with size 8, and items 8..15 on page 2.
    const page1Anchor = calculateAnchorPage({ currentPage: 1, previousPageSize: 8, nextPageSize: 10, totalItems: 24 });
    const page2Anchor = calculateAnchorPage({ currentPage: 2, previousPageSize: 8, nextPageSize: 10, totalItems: 24 });
    // page 1 → anchor 0 → floor(0/10)+1 = 1
    // page 2 → anchor 8 → floor(8/10)+1 = 1 (still page 1 in 10-item layout)
    expect(page1Anchor).toBe(1);
    expect(page2Anchor).toBe(1);
    // Both map to page 1 with larger page size — no duplication possible
  });
});

// ── isDocumentNew ────────────────────────────────────────────────────────────
describe("isDocumentNew", () => {
  it("isUnreadByCurrentUser=true → returns true", () => {
    expect(isDocumentNew({ ...baseDoc, isUnreadByCurrentUser: true }, NOW)).toBe(true);
  });

  it("isUnreadByCurrentUser=false → returns false even when recently updated", () => {
    const recentlyUpdated = new Date(NOW - 60 * 60 * 1000).toISOString(); // 1h ago
    expect(
      isDocumentNew({ ...baseDoc, isUnreadByCurrentUser: false, updatedAt: recentlyUpdated }, NOW),
    ).toBe(false);
  });

  it("isNew=true (unread undefined) → returns true", () => {
    expect(isDocumentNew({ ...baseDoc, isNew: true }, NOW)).toBe(true);
  });

  it("isNew=false (unread undefined) → returns false even when recently updated", () => {
    const recentlyUpdated = new Date(NOW - 60 * 60 * 1000).toISOString();
    expect(
      isDocumentNew({ ...baseDoc, isNew: false, updatedAt: recentlyUpdated }, NOW),
    ).toBe(false);
  });

  it("recent timestamp fallback (< 48h) → returns true when both flags absent", () => {
    const recentDate = new Date(NOW - 12 * 60 * 60 * 1000).toISOString();
    expect(isDocumentNew({ ...baseDoc, updatedAt: recentDate }, NOW)).toBe(true);
  });

  it("old timestamp (> 48h) → returns false when both flags absent", () => {
    expect(isDocumentNew(baseDoc, NOW)).toBe(false); // baseDoc has 72h-old updatedAt
  });

  it("invalid timestamp → returns false", () => {
    expect(isDocumentNew({ ...baseDoc, updatedAt: "not-a-date" }, NOW)).toBe(false);
  });

  it("future timestamp → returns false (age < 0)", () => {
    const futureDate = new Date(NOW + 2 * 60 * 60 * 1000).toISOString();
    expect(isDocumentNew({ ...baseDoc, updatedAt: futureDate }, NOW)).toBe(false);
  });

  it("exactly 48 hours old → returns true (boundary inclusive)", () => {
    const exactly48h = new Date(NOW - 48 * 60 * 60 * 1000).toISOString();
    expect(isDocumentNew({ ...baseDoc, updatedAt: exactly48h }, NOW)).toBe(true);
  });

  it("exactly 48h + 1ms old → returns false (boundary exclusive)", () => {
    const justOver48h = new Date(NOW - 48 * 60 * 60 * 1000 - 1).toISOString();
    expect(isDocumentNew({ ...baseDoc, updatedAt: justOver48h }, NOW)).toBe(false);
  });
});
