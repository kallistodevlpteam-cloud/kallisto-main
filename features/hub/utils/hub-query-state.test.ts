import { describe, expect, it } from "vitest";

import {
  DEFAULT_HUB_QUERY_STATE,
  parseHubQuery,
  serializeHubQuery,
} from "./hub-query-state";

describe("Hub query state", () => {
  it("uses the project-bound defaults when parameters are absent", () => {
    expect(parseHubQuery(new URLSearchParams())).toEqual(
      DEFAULT_HUB_QUERY_STATE,
    );
  });

  it("parses supported procurement filters and rejects invalid values", () => {
    const parsed = parseHubQuery(
      new URLSearchParams({
        project: "all",
        stage: "approval",
        status: "approval_pending",
        category: "sanitaryware",
        search: "bathroom",
        attention: "1",
        requiredDate: "30_days",
      }),
    );

    expect(parsed).toEqual({
      project: "all",
      stage: "approval",
      status: "approval_pending",
      category: "sanitaryware",
      search: "bathroom",
      attention: true,
      requiredDate: "30_days",
    });

    const invalid = parseHubQuery(
      new URLSearchParams({
        project: "unknown",
        stage: "checkout",
        status: "paid",
      }),
    );

    expect(invalid.project).toBe("nila-residence");
    expect(invalid.stage).toBe("requirements");
    expect(invalid.status).toBeNull();
  });

  it("serializes non-default filters without discarding unrelated parameters", () => {
    const params = serializeHubQuery(
      {
        ...DEFAULT_HUB_QUERY_STATE,
        project: "all",
        stage: "ordered",
        attention: true,
        search: "steel",
      },
      new URLSearchParams("source=sidebar"),
    );

    expect(params.get("project")).toBe("all");
    expect(params.get("stage")).toBe("ordered");
    expect(params.get("attention")).toBe("1");
    expect(params.get("search")).toBe("steel");
    expect(params.get("source")).toBe("sidebar");
    expect(params.has("category")).toBe(false);
  });
});
