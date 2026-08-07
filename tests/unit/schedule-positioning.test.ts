import { describe, expect, it } from "vitest";
import {
  getTimedActivityPosition,
  pointerOffsetToTimeRange,
} from "@/features/projects/components/schedule/schedule-positioning";

describe("schedule positioning", () => {
  it("calculates top and height from time and duration", () => {
    expect(
      getTimedActivityPosition(
        { startTime: "09:30", endTime: "11:00" },
        8 * 60,
        18 * 60,
        1
      )
    ).toEqual({
      top: 90,
      height: 90,
      clippedAtStart: false,
      clippedAtEnd: false,
      edge: null,
    });
  });

  it("enforces a 28px minimum visible event height", () => {
    expect(
      getTimedActivityPosition(
        { startTime: "10:00", endTime: "10:10" },
        8 * 60,
        18 * 60,
        1
      )?.height
    ).toBe(28);
  });

  it("represents events outside the visible time range at the nearest edge", () => {
    expect(
      getTimedActivityPosition(
        { startTime: "07:00", endTime: "07:30" },
        8 * 60,
        18 * 60,
        1
      )?.edge
    ).toBe("before");
    expect(
      getTimedActivityPosition(
        { startTime: "19:00", endTime: "20:00" },
        8 * 60,
        18 * 60,
        1
      )?.edge
    ).toBe("after");
  });

  it("rounds pointer selections to half-hour slots", () => {
    expect(pointerOffsetToTimeRange(67, 122, 480, 1080, 1)).toEqual({
      startTime: "09:00",
      endTime: "10:00",
    });
  });
});
