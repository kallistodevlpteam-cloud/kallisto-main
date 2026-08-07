import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useCalendarQueryState } from "@/features/calendar/hooks/use-calendar-query-state";

vi.mock("next/navigation", () => ({
  usePathname: () => "/calendar",
  useSearchParams: () => new URLSearchParams(window.location.search),
}));

describe("Calendar query state", () => {
  beforeEach(() => {
    window.history.replaceState(
      {},
      "",
      "/calendar?tab=today&date=2026-07-24"
    );
  });

  it("updates local state and preserves Today selections in the URL", () => {
    const { result } = renderHook(() => useCalendarQueryState());

    act(() => {
      result.current.setQueryState({
        tab: "today",
        date: "2026-07-25",
        scope: "team",
        category: "site",
        selected: "activity:act-11",
      });
    });

    expect(result.current.state).toMatchObject({
      tab: "today",
      date: "2026-07-25",
      scope: "team",
      category: "site",
      selected: "activity:act-11",
    });
    expect(window.location.search).toContain("tab=today");
    expect(window.location.search).toContain("date=2026-07-25");
    expect(window.location.search).toContain("scope=team");
    expect(window.location.search).toContain("category=site");
    expect(window.location.search).toContain("selected=activity%3Aact-11");
  });
});
