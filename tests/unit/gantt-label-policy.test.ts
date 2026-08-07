import { describe, it, expect } from "vitest";
import {
  shouldShowActivityLabel,
  shouldShowMilestoneLabel,
  getPhaseLabelPresentation,
} from "../../features/projects/components/timeline/gantt/gantt-label-policy";

describe("gantt-label-policy", () => {
  describe("shouldShowActivityLabel", () => {
    it("handles week view threshold (>= 100px)", () => {
      expect(shouldShowActivityLabel("week", 99)).toBe(false);
      expect(shouldShowActivityLabel("week", 100)).toBe(true);
      expect(shouldShowActivityLabel("week", 150)).toBe(true);
    });

    it("handles month view threshold (>= 80px)", () => {
      expect(shouldShowActivityLabel("month", 79)).toBe(false);
      expect(shouldShowActivityLabel("month", 80)).toBe(true);
      expect(shouldShowActivityLabel("month", 120)).toBe(true);
    });

    it("handles quarter view threshold (>= 110px)", () => {
      expect(shouldShowActivityLabel("quarter", 109)).toBe(false);
      expect(shouldShowActivityLabel("quarter", 110)).toBe(true);
      expect(shouldShowActivityLabel("quarter", 200)).toBe(true);
    });
  });

  describe("shouldShowMilestoneLabel", () => {
    it("returns false for month and quarter views", () => {
      expect(shouldShowMilestoneLabel("month", 1000, 100)).toBe(false);
      expect(shouldShowMilestoneLabel("quarter", 1000, 100)).toBe(false);
    });

    it("returns true in week view only when remaining canvas width >= 140px", () => {
      expect(shouldShowMilestoneLabel("week", 1000, 870)).toBe(false); // 130px remaining
      expect(shouldShowMilestoneLabel("week", 1000, 860)).toBe(true);  // 140px remaining
      expect(shouldShowMilestoneLabel("week", 1000, 500)).toBe(true);  // 500px remaining
    });
  });

  describe("getPhaseLabelPresentation", () => {
    it("handles week view phase labels", () => {
      expect(getPhaseLabelPresentation("week", 100)).toEqual({ showLabel: true, showWbs: true });
      expect(getPhaseLabelPresentation("week", 60)).toEqual({ showLabel: true, showWbs: false });
    });

    it("handles month view phase labels", () => {
      expect(getPhaseLabelPresentation("month", 40)).toEqual({ showLabel: false, showWbs: false });
      expect(getPhaseLabelPresentation("month", 60)).toEqual({ showLabel: true, showWbs: false });
      expect(getPhaseLabelPresentation("month", 130)).toEqual({ showLabel: true, showWbs: true });
    });

    it("handles quarter view phase labels", () => {
      expect(getPhaseLabelPresentation("quarter", 60)).toEqual({ showLabel: false, showWbs: false });
      expect(getPhaseLabelPresentation("quarter", 70)).toEqual({ showLabel: true, showWbs: false });
      expect(getPhaseLabelPresentation("quarter", 150)).toEqual({ showLabel: true, showWbs: false });
    });
  });
});
