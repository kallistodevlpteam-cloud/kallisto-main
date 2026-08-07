"use client";

import { useEffect, useState } from "react";
import { DriveViewMode } from "./drive-query-state";

// ── Breakpoint definitions ──────────────────────────────────────────────────
// Only two boundary crossings matter: 1024px and 1440px.
// Using window.matchMedia avoids continuous resize calculations.

const LARGE_QUERY = "(min-width: 1440px)";
const MEDIUM_QUERY = "(min-width: 1024px)";

export type DriveWidthBreakpoint = "small" | "medium" | "large";

const PAGE_SIZE_BY_BREAKPOINT = {
  list: { small: 6, medium: 8, large: 10 },
  grid: { small: 6, medium: 8, large: 12 },
} as const;

export function getBreakpointFromMedia(
  isLarge: boolean,
  isMedium: boolean,
): DriveWidthBreakpoint {
  if (isLarge) return "large";
  if (isMedium) return "medium";
  return "small";
}

export function getPageSizeForWidth(
  width: number,
  viewMode: DriveViewMode,
): number {
  const breakpoint = getBreakpointFromMedia(width >= 1440, width >= 1024);
  return PAGE_SIZE_BY_BREAKPOINT[viewMode][breakpoint];
}

function resolveBreakpoint(): DriveWidthBreakpoint {
  if (typeof window === "undefined") return "medium";
  return getBreakpointFromMedia(
    window.matchMedia(LARGE_QUERY).matches,
    window.matchMedia(MEDIUM_QUERY).matches,
  );
}

// ── calculateAnchorPage ─────────────────────────────────────────────────────
// Preserves the first currently-visible document when page size changes.
// Requires totalItems so the target page can be clamped to the new page count.
export function calculateAnchorPage({
  currentPage,
  previousPageSize,
  nextPageSize,
  totalItems,
}: {
  currentPage: number;
  previousPageSize: number;
  nextPageSize: number;
  totalItems: number;
}): number {
  if (totalItems <= 0 || previousPageSize <= 0 || nextPageSize <= 0) {
    return 1;
  }
  const safeCurrentPage = Math.max(1, currentPage);
  const anchorIndex = (safeCurrentPage - 1) * previousPageSize;
  const nextPageCount = Math.max(1, Math.ceil(totalItems / nextPageSize));
  return Math.min(nextPageCount, Math.floor(anchorIndex / nextPageSize) + 1);
}

// ── useResponsiveDrivePageSize ──────────────────────────────────────────────
// Returns { breakpoint, pageSize } derived exclusively from viewport width.
// Height changes never affect the result.
export function useResponsiveDrivePageSize(viewMode: DriveViewMode): {
  breakpoint: DriveWidthBreakpoint;
  pageSize: number;
} {
  const [breakpoint, setBreakpoint] = useState<DriveWidthBreakpoint>(() =>
    resolveBreakpoint(),
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const largeMediaQuery = window.matchMedia(LARGE_QUERY);
    const mediumMediaQuery = window.matchMedia(MEDIUM_QUERY);

    const handleChange = () => {
      setBreakpoint(
        getBreakpointFromMedia(largeMediaQuery.matches, mediumMediaQuery.matches),
      );
    };

    largeMediaQuery.addEventListener("change", handleChange);
    mediumMediaQuery.addEventListener("change", handleChange);

    return () => {
      largeMediaQuery.removeEventListener("change", handleChange);
      mediumMediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  const pageSize = PAGE_SIZE_BY_BREAKPOINT[viewMode][breakpoint];
  return { breakpoint, pageSize };
}
