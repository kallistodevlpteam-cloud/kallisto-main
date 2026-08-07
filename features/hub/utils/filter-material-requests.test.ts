import { describe, expect, it } from "vitest";

import { HUB_MOCK_WORKSPACE_DATA } from "../services/hub.mock";
import { filterMaterialRequests } from "./filter-material-requests";
import { DEFAULT_HUB_QUERY_STATE } from "./hub-query-state";

describe("material request filtering", () => {
  it("keeps the default workspace bound to Nila Residence", () => {
    const result = filterMaterialRequests(
      HUB_MOCK_WORKSPACE_DATA.requests,
      DEFAULT_HUB_QUERY_STATE,
    );

    expect(result.map((request) => request.name)).toEqual([
      "Ground floor concrete",
      "Electrical first fix",
      "Structural steel",
    ]);
  });

  it("filters by pipeline stage, status, attention, and category", () => {
    const quotations = filterMaterialRequests(
      HUB_MOCK_WORKSPACE_DATA.requests,
      {
        ...DEFAULT_HUB_QUERY_STATE,
        project: "all",
        stage: "quotations",
        status: "awaiting_quotes",
        category: "electrical",
        attention: true,
      },
    );

    expect(quotations).toHaveLength(1);
    expect(quotations[0].name).toBe("Electrical first fix");
  });

  it("searches request, project, category, and status text", () => {
    const result = filterMaterialRequests(
      HUB_MOCK_WORKSPACE_DATA.requests,
      {
        ...DEFAULT_HUB_QUERY_STATE,
        project: "all",
        search: "lake sanitaryware",
      },
    );

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Bathroom fixtures");
  });

  it("applies deterministic required-date windows", () => {
    const sevenDays = filterMaterialRequests(
      HUB_MOCK_WORKSPACE_DATA.requests,
      {
        ...DEFAULT_HUB_QUERY_STATE,
        project: "all",
        requiredDate: "7_days",
      },
    );

    expect(sevenDays.map((request) => request.name)).toEqual([
      "Ground floor concrete",
      "Structural steel",
    ]);
  });
});
