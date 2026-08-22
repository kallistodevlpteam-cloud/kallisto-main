import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, it, expect } from "vitest";
import { ClientPrioritiesBar } from "@/features/enquiries/detail/components/client-priorities-bar";
import type { ClientPriority } from "@/features/enquiries/types/enquiry.types";

afterEach(cleanup);

const BACKEND_PRIORITIES: ClientPriority[] = [
  {
    id: "prio-1",
    label: "Natural light & cross ventilation",
    type: "confirmed",
    details: ["High priority placed on natural light, cross ventilation, and direct garden view access."],
    tags: ["Ergonomics", "Daylight"],
  },
  {
    id: "prio-2",
    label: "Budget sensitivity & control",
    type: "confirmed",
    details: [],
    tags: [],
  },
];

const LEGACY_PRIORITIES: ClientPriority[] = [
  { id: "prio-3", label: "Budget sensitivity & control", type: "confirmed" },
];

const PENDING_PRIORITY: ClientPriority[] = [
  {
    id: "prio-4",
    label: "Energy efficiency & sustainability",
    type: "inferred",
    details: ["Client prefers reduced long-term operating costs."],
  },
];

describe("ClientPrioritiesBar", () => {
  it("renders nothing when there are no priorities", () => {
    const { container } = render(<ClientPrioritiesBar priorities={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders backend-sourced detail text as the card snippet", () => {
    render(<ClientPrioritiesBar priorities={BACKEND_PRIORITIES} />);
    expect(
      screen.getByText(
        "High priority placed on natural light, cross ventilation, and direct garden view access."
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Natural light & cross ventilation")).toBeInTheDocument();
    expect(screen.getByText("2 key drivers")).toBeInTheDocument();
  });

  it("shows an em-dash snippet when backend details are an empty list", () => {
    render(
      <ClientPrioritiesBar
        priorities={[{ id: "prio-2", label: "Budget sensitivity & control", type: "confirmed", details: [] }]}
      />
    );
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("shows Confirmed for backend status true and Pending for status false", () => {
    render(
      <ClientPrioritiesBar
        priorities={[...BACKEND_PRIORITIES, ...PENDING_PRIORITY]}
      />
    );
    expect(screen.getAllByText("Confirmed").length).toBe(2);
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("falls back to the heuristic description for priorities without backend details", () => {
    render(<ClientPrioritiesBar priorities={LEGACY_PRIORITIES} />);
    expect(
      screen.getByText(/Client prioritizes staying within the target/)
    ).toBeInTheDocument();
  });

  it("renders tag strings strictly from backend priority_details.tags", () => {
    render(<ClientPrioritiesBar priorities={BACKEND_PRIORITIES} />);
    expect(screen.getByText("Ergonomics")).toBeInTheDocument();
    expect(screen.getByText("Daylight")).toBeInTheDocument();
  });

  it("renders no backend tags when the backend tag list is empty", () => {
    const { container } = render(<ClientPrioritiesBar priorities={BACKEND_PRIORITIES} />);
    const cardForBudget = Array.from(container.querySelectorAll("h4")).find(
      (node) => node.textContent === "Budget sensitivity & control"
    )?.parentElement?.parentElement?.parentElement;
    expect(cardForBudget).toBeDefined();
    const softTags = cardForBudget?.querySelectorAll("[class*='softTag']") ?? [];
    expect(softTags.length).toBe(0);
  });

  it("falls back to heuristic tags only for priorities without a backend tags field", () => {
    render(<ClientPrioritiesBar priorities={LEGACY_PRIORITIES} />);
    expect(screen.getByText("Budget")).toBeInTheDocument();
    expect(screen.getByText("Cost Control")).toBeInTheDocument();
  });
});