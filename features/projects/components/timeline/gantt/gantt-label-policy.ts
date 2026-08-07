import { GanttZoom } from "../query-state/timeline-query-schema";

/**
 * Determines if an activity bar should render internal text label based on zoom and bar width in pixels.
 * Rule:
 * - Week: widthPx >= 100
 * - Month: widthPx >= 80
 * - Quarter: widthPx >= 110
 */
export function shouldShowActivityLabel(zoom: GanttZoom, widthPx: number): boolean {
  if (zoom === "week") return widthPx >= 100;
  if (zoom === "month") return widthPx >= 80;
  return widthPx >= 110;
}

/**
 * Determines if a milestone should render an inline text label based on zoom, total canvas width, and milestone position.
 * Rule:
 * - Week: remainingCanvasWidth >= 140 (where remainingCanvasWidth = totalCanvasWidth - leftPx)
 * - Month: false (diamond shape only)
 * - Quarter: false (diamond shape only)
 */
export function shouldShowMilestoneLabel(
  zoom: GanttZoom,
  totalCanvasWidth: number,
  leftPx: number
): boolean {
  if (zoom !== "week") return false;
  const remainingCanvasWidth = totalCanvasWidth - leftPx;
  return remainingCanvasWidth >= 140;
}

/**
 * Determines phase bar label presentation rule based on zoom and bar width.
 * Rule:
 * - Week: full title with WBS code
 * - Month: title with controlled ellipsis
 * - Quarter: show title only when widthPx >= 70; hide WBS code; hide label when extremely narrow (< 40)
 */
export function getPhaseLabelPresentation(
  zoom: GanttZoom,
  widthPx: number
): { showLabel: boolean; showWbs: boolean } {
  if (zoom === "week") {
    return { showLabel: true, showWbs: widthPx >= 80 };
  }
  if (zoom === "month") {
    return { showLabel: widthPx >= 50, showWbs: widthPx >= 120 };
  }
  // Quarter mode
  return { showLabel: widthPx >= 70, showWbs: false };
}
