import { describe, expect, it } from "vitest";
import type { HandsMetric, WorkforceRequest } from "../types/hands.types";
import {
  computeHandsOverviewMetrics,
  formatAttendance,
  formatInr,
  getFulfilmentPercentage,
  getOpenPositionsSummary,
} from "./hands-formatters";

describe("Hands formatters & dynamic metrics calculation", () => {
  it("formats INR currency correctly", () => {
    expect(formatInr(182400)).toContain("1,82,400");
  });

  it("formats attendance summary correctly", () => {
    expect(formatAttendance({ state: "pending" })).toBe("Pending");
    expect(formatAttendance({ state: "recorded", present: 16, total: 18 })).toBe("16 / 18");
  });

  it("calculates fulfilment percentage safely", () => {
    expect(getFulfilmentPercentage(7, 10)).toBe(70);
    expect(getFulfilmentPercentage(0, 0)).toBe(0);
    expect(getFulfilmentPercentage(12, 10)).toBe(100);
  });

  describe("getOpenPositionsSummary", () => {
    it("returns zero positions for empty requests array", () => {
      const result = getOpenPositionsSummary([]);
      expect(result.totalPositions).toBe(0);
      expect(result.requestCount).toBe(0);
      expect(result.supportingText).toBe("Across 0 requests");
    });

    it("correctly computes open position deficits across active unfulfilled requests", () => {
      const requests: WorkforceRequest[] = [
        {
          id: "req-1",
          projectId: "p-1",
          projectName: "Project Alpha",
          trade: "Masons",
          requiredDate: "Tomorrow",
          quantity: 10,
          fulfilled: 7,
          status: "Partially assigned",
        },
        {
          id: "req-2",
          projectId: "p-2",
          projectName: "Project Beta",
          trade: "Carpenters",
          requiredDate: "30 Jul",
          quantity: 7,
          fulfilled: 3,
          status: "Partially assigned",
        },
        {
          id: "req-3",
          projectId: "p-3",
          projectName: "Project Gamma",
          trade: "Helpers",
          requiredDate: "02 Aug",
          quantity: 8,
          fulfilled: 6,
          status: "Partially assigned",
        },
        {
          id: "req-4",
          projectId: "p-4",
          projectName: "Project Delta",
          trade: "Electricians",
          requiredDate: "05 Aug",
          quantity: 4,
          fulfilled: 0,
          status: "Open",
        },
      ];

      // Deficits: (10-7)=3, (7-3)=4, (8-6)=2, (4-0)=4 => Total = 13 across 4 requests
      const result = getOpenPositionsSummary(requests);
      expect(result.totalPositions).toBe(13);
      expect(result.requestCount).toBe(4);
      expect(result.supportingText).toBe("Across 4 requests");
    });

    it("excludes fully fulfilled and draft requests", () => {
      const requests: WorkforceRequest[] = [
        {
          id: "req-active",
          projectId: "p-1",
          projectName: "Project Active",
          trade: "Masons",
          requiredDate: "Tomorrow",
          quantity: 5,
          fulfilled: 2,
          status: "Partially assigned",
        },
        {
          id: "req-fulfilled",
          projectId: "p-2",
          projectName: "Project Done",
          trade: "Painters",
          requiredDate: "Yesterday",
          quantity: 6,
          fulfilled: 6,
          status: "Fulfilled",
        },
        {
          id: "req-draft",
          projectId: "p-3",
          projectName: "Project Draft",
          trade: "Welders",
          requiredDate: "Next week",
          quantity: 6,
          fulfilled: 0,
          status: "Draft",
        },
      ];

      const result = getOpenPositionsSummary(requests);
      expect(result.totalPositions).toBe(3);
      expect(result.requestCount).toBe(1);
      expect(result.supportingText).toBe("Across 1 request");
    });
  });

  describe("computeHandsOverviewMetrics", () => {
    it("dynamically updates open-positions metric value and supportingText", () => {
      const baseMetrics: HandsMetric[] = [
        {
          id: "workers-today",
          label: "Workers on site today",
          value: 34,
          valueFormat: "number",
          supportingText: "Across 4 active sites",
          tone: "neutral",
          icon: "workers",
        },
        {
          id: "open-positions",
          label: "Open positions",
          value: 0,
          valueFormat: "number",
          supportingText: "Initial",
          tone: "neutral",
          icon: "positions",
        },
      ];

      const requests: WorkforceRequest[] = [
        {
          id: "req-1",
          projectId: "p-1",
          projectName: "Project Alpha",
          trade: "Masons",
          requiredDate: "Tomorrow",
          quantity: 10,
          fulfilled: 7,
          status: "Partially assigned",
        },
        {
          id: "req-2",
          projectId: "p-2",
          projectName: "Project Beta",
          trade: "Carpenters",
          requiredDate: "30 Jul",
          quantity: 7,
          fulfilled: 3,
          status: "Partially assigned",
        },
      ];

      const updated = computeHandsOverviewMetrics([], requests, baseMetrics);
      const openPositionsMetric = updated.find((m) => m.id === "open-positions");

      expect(openPositionsMetric).toBeDefined();
      expect(openPositionsMetric?.value).toBe(7); // (10-7) + (7-3) = 7
      expect(openPositionsMetric?.supportingText).toBe("Across 2 requests");
    });
  });
});
