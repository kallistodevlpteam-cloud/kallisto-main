import { describe, expect, it } from "vitest";
import {
  isHandsTab,
  parseHandsTab,
  serializeHandsTab,
} from "./hands-query-state";

describe("Hands query state", () => {
  it("defaults to the overview tab", () => {
    expect(parseHandsTab(new URLSearchParams())).toBe("overview");
    expect(parseHandsTab(new URLSearchParams("tab=unknown"))).toBe("overview");
  });

  it("accepts every supported Hands tab", () => {
    for (const tab of [
      "overview",
      "requests",
      "deployments",
      "attendance",
      "payments",
    ]) {
      expect(parseHandsTab(new URLSearchParams(`tab=${tab}`))).toBe(tab);
      expect(isHandsTab(tab)).toBe(true);
    }
  });

  it("serializes the selected tab and preserves unrelated parameters", () => {
    const serialized = serializeHandsTab(
      "attendance",
      new URLSearchParams("project=proj-001"),
    );

    expect(serialized.get("tab")).toBe("attendance");
    expect(serialized.get("project")).toBe("proj-001");
  });
});
