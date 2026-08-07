"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

export interface DriveViewportGridOptions {
  cardWidth?: number;
  cardHeight?: number;
  columnGap?: number;
  rowGap?: number;
}

export interface DriveViewportListOptions {
  headerHeight?: number;
  rowHeight?: number;
}

export interface UseDriveViewportCapacityOptions {
  viewportRef: RefObject<HTMLElement | null>;
  viewMode: "grid" | "list";
  enabled?: boolean;
  grid?: DriveViewportGridOptions;
  list?: DriveViewportListOptions;
}

export interface ViewportCapacityResult {
  columns: number;
  rows: number;
  pageSize: number;
}

export const DEFAULT_GRID_CARD_WIDTH = 271.2;
export const DEFAULT_GRID_CARD_HEIGHT = 221.25;
export const DEFAULT_GRID_COLUMN_GAP = 24.8;
export const DEFAULT_GRID_ROW_GAP = 24.8;

export const DEFAULT_LIST_HEADER_HEIGHT = 40;
export const DEFAULT_LIST_ROW_HEIGHT = 55;

export function calculateDriveViewportCapacity(
  width: number,
  height: number,
  viewMode: "grid" | "list",
  gridOptions: DriveViewportGridOptions = {},
  listOptions: DriveViewportListOptions = {},
): ViewportCapacityResult {
  const cardWidth = gridOptions.cardWidth ?? DEFAULT_GRID_CARD_WIDTH;
  const cardHeight = gridOptions.cardHeight ?? DEFAULT_GRID_CARD_HEIGHT;
  const columnGap = gridOptions.columnGap ?? DEFAULT_GRID_COLUMN_GAP;
  const rowGap = gridOptions.rowGap ?? DEFAULT_GRID_ROW_GAP;

  const headerHeight = listOptions.headerHeight ?? DEFAULT_LIST_HEADER_HEIGHT;
  const rowHeight = listOptions.rowHeight ?? DEFAULT_LIST_ROW_HEIGHT;

  if (width <= 0 || height <= 0) {
    if (viewMode === "grid") {
      return { columns: 5, rows: 2, pageSize: 10 };
    }
    return { columns: 1, rows: 7, pageSize: 7 };
  }

  if (viewMode === "grid") {
    const columns = Math.max(
      1,
      Math.floor((width + columnGap) / (cardWidth + columnGap)),
    );
    const rows = Math.max(
      1,
      Math.floor((height + rowGap) / (cardHeight + rowGap)),
    );
    return {
      columns,
      rows,
      pageSize: columns * rows,
    };
  }

  const availableBodyHeight = height - headerHeight;
  const rows = Math.max(
    1,
    Math.floor(availableBodyHeight / rowHeight),
  );
  return {
    columns: 1,
    rows,
    pageSize: rows,
  };
}

export function useDriveViewportCapacity({
  viewportRef,
  viewMode,
  enabled = true,
  grid,
  list,
}: UseDriveViewportCapacityOptions): ViewportCapacityResult {
  const [capacity, setCapacity] = useState<ViewportCapacityResult>(() =>
    viewMode === "grid"
      ? { columns: 5, rows: 2, pageSize: 10 }
      : { columns: 1, rows: 7, pageSize: 7 },
  );

  const capacityRef = useRef(capacity);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    capacityRef.current = capacity;
  }, [capacity]);

  const measure = useCallback(() => {
    if (!enabled || !viewportRef.current) return;
    const element = viewportRef.current;
    const width = element.clientWidth;
    const height = element.clientHeight;

    const next = calculateDriveViewportCapacity(width, height, viewMode, grid, list);
    const current = capacityRef.current;

    if (
      current.columns !== next.columns ||
      current.rows !== next.rows ||
      current.pageSize !== next.pageSize
    ) {
      capacityRef.current = next;
      setCapacity(next);
    }
  }, [enabled, viewportRef, viewMode, grid, list]);

  useEffect(() => {
    if (!enabled) return;

    const scheduleMeasure = () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        measure();
      });
    };

    scheduleMeasure();

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(scheduleMeasure);

    if (viewportRef.current) {
      resizeObserver?.observe(viewportRef.current);
    }

    window.addEventListener("resize", scheduleMeasure);

    return () => {
      window.removeEventListener("resize", scheduleMeasure);
      resizeObserver?.disconnect();
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [enabled, viewportRef, measure]);

  return capacity;
}

export interface PreservedAnchorInput {
  currentPage: number;
  previousPageSize: number;
  nextPageSize: number;
  totalItems: number;
}

export function getPageForPreservedAnchor({
  currentPage,
  previousPageSize,
  nextPageSize,
  totalItems,
}: PreservedAnchorInput): number {
  if (totalItems <= 0 || nextPageSize <= 0) return 1;
  const firstVisibleIndex = Math.max(0, (currentPage - 1) * previousPageSize);
  const totalPages = Math.max(1, Math.ceil(totalItems / nextPageSize));
  const targetPage = Math.floor(firstVisibleIndex / nextPageSize) + 1;
  return Math.min(totalPages, Math.max(1, targetPage));
}

export function calculateResponsivePageSize(input: {
  viewportHeight: number;
  containerTop: number;
  rowHeight?: number;
  reservedBottomSpace?: number;
  minimumRows?: number;
  maximumRows?: number;
}): number {
  const rowHeight = input.rowHeight ?? 55;
  const reservedBottomSpace = input.reservedBottomSpace ?? 60;
  const minimumRows = input.minimumRows ?? 7;
  const maximumRows = input.maximumRows ?? 15;
  const availableHeight = Math.max(0, input.viewportHeight - input.containerTop - reservedBottomSpace);
  return Math.min(maximumRows, Math.max(minimumRows, Math.floor(availableHeight / rowHeight)));
}

export function useResponsivePageSize(options: {
  containerRef: RefObject<HTMLElement | null>;
  enabled?: boolean;
}): number {
  const capacity = useDriveViewportCapacity({
    viewportRef: options.containerRef,
    viewMode: "list",
    enabled: options.enabled,
  });
  return capacity.pageSize;
}
