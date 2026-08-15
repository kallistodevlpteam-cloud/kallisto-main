import React from "react";
import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ProjectsCardsGrid, SampleProjectCard } from "@/features/projects/components/projects-cards-grid";

vi.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, ...rest }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...rest} />
  ),
}));

function makeCard(overrides: Partial<SampleProjectCard> = {}): SampleProjectCard {
  return {
    id: "prj-6",
    name: "Skyline Heights Phase II",
    code: "",
    type: "Residential",
    location: "Thiruvananthapuram",
    clientDisplayName: "Rajan & Preethi Pillai",
    phase: "In progress",
    status: "UPCOMING",
    nextActionTitle: null,
    dueLabel: null,
    image: "/assets/nila-thumb1.jpg",
    ...overrides,
  };
}

describe("ProjectsCardsGrid — backend-driven cards", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders backend project cards under the upcoming tab with no fabricated claims", () => {
    render(
      <ProjectsCardsGrid
        projects={[makeCard()]}
        activeStatus="UPCOMING"
      />
    );

    expect(screen.getByText("Skyline Heights Phase II")).toBeInTheDocument();
    expect(screen.getByText("Thiruvananthapuram")).toBeInTheDocument();
    expect(screen.getByText("In progress")).toBeInTheDocument();
    // Percent renders a neutral dash when the backend has no progress data
    expect(screen.getByText("—")).toBeInTheDocument();
    // No fabricated health badge, due chip or next action
    expect(screen.queryByText("On track")).not.toBeInTheDocument();
    expect(screen.queryByText("Next :")).not.toBeInTheDocument();
  });

  it("renders the health badge and progress only when the backend provides them", () => {
    render(
      <ProjectsCardsGrid
        projects={[
          makeCard({ health: "ON_TRACK", phaseProgress: 62, dueLabel: "Due in 2d", dueState: "due_soon" }),
        ]}
        activeStatus="UPCOMING"
      />
    );

    expect(screen.getByText("On track")).toBeInTheDocument();
    expect(screen.getByText("62%")).toBeInTheDocument();
    expect(screen.getByText("Due in 2d")).toBeInTheDocument();
  });

  it("shows the empty state when no projects match the active tab", () => {
    render(
      <ProjectsCardsGrid
        projects={[makeCard()]}
        activeStatus="ACTIVE"
      />
    );

    expect(screen.getByText("No active projects")).toBeInTheDocument();
  });

  it("shows the loading state while the backend is being fetched", () => {
    render(
      <ProjectsCardsGrid projects={[]} activeStatus="UPCOMING" loading />
    );

    expect(screen.getByLabelText("Loading projects")).toBeInTheDocument();
  });

  it("shows the error state with a working retry button", () => {
    const onRetry = vi.fn();
    render(
      <ProjectsCardsGrid projects={[]} activeStatus="UPCOMING" error onRetry={onRetry} />
    );

    expect(screen.getByText("Could not load projects")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("filters backend cards by selected locations", () => {
    render(
      <ProjectsCardsGrid
        projects={[
          makeCard({ id: "prj-1", name: "Kochi Villa", location: "Kochi" }),
          makeCard({ id: "prj-2", name: "Calicut Villa", location: "Calicut" }),
        ]}
        activeStatus="UPCOMING"
        locationFilter="kochi"
      />
    );

    expect(screen.getByText("Kochi Villa")).toBeInTheDocument();
    expect(screen.queryByText("Calicut Villa")).not.toBeInTheDocument();
  });
});
