import { describe, expect, it } from "vitest";
import { formatRelativeTime } from "@/lib/utils/format-relative-time";

describe("formatRelativeTime", () => {
  it("returns Just now for missing or very recent date", () => {
    expect(formatRelativeTime()).toBe("Just now");
    expect(formatRelativeTime(new Date().toISOString())).toBe("Just now");
  });

  it("formats 1 minute ago correctly", () => {
    const oneMinAgo = new Date(Date.now() - 65 * 1000).toISOString();
    expect(formatRelativeTime(oneMinAgo)).toBe("1 min ago");
  });

  it("formats minutes ago correctly", () => {
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    expect(formatRelativeTime(thirtyMinAgo)).toBe("30 min ago");
  });

  it("formats 1 hour ago correctly", () => {
    const oneHourAgo = new Date(Date.now() - 65 * 60 * 1000).toISOString();
    expect(formatRelativeTime(oneHourAgo)).toBe("1 hr ago");
  });

  it("formats hours ago correctly", () => {
    const twoHoursAgo = new Date(Date.now() - 2.5 * 3600 * 1000).toISOString();
    expect(formatRelativeTime(twoHoursAgo)).toBe("2 hrs ago");
  });

  it("formats yesterday correctly", () => {
    const yesterday = new Date(Date.now() - 28 * 3600 * 1000).toISOString();
    expect(formatRelativeTime(yesterday)).toBe("Yesterday");
  });
});
