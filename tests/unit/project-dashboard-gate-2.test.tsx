import { createRef } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { ProjectStatCardsBar } from "@/features/documents/components/project-stat-cards-bar";
import { ProjectUpdatesPanel } from "@/features/documents/components/project-updates-panel";
import {
  INITIAL_PROJECT_UPDATES,
  type UpdatePost,
} from "@/features/documents/hooks/use-project-updates-panel-state";

const makeUpdates = (count: number): UpdatePost[] =>
  Array.from({ length: count }, (_, index) => ({
    ...INITIAL_PROJECT_UPDATES[index % INITIAL_PROJECT_UPDATES.length],
    id: `fixture-${index}`,
    text: `Responsive update fixture ${index + 1}`,
  }));

afterEach(cleanup);

describe("project dashboard Gate 2 component contracts", () => {
  it.each([
    [0, "No updates yet"],
    [3, null],
    [12, null],
  ] as const)("renders one persistent panel and composer for %i updates", (count, emptyText) => {
    render(
      <ProjectUpdatesPanel
        layoutMode="rail"
        open={false}
        panelRef={createRef<HTMLDivElement>()}
        onClose={() => undefined}
        initialUpdates={makeUpdates(count)}
      />,
    );

    expect(screen.getByRole("complementary", { name: "Project updates" })).toBeInTheDocument();
    expect(document.querySelectorAll("[data-updates-presentation]")).toHaveLength(1);
    expect(document.querySelectorAll("[data-updates-composer]")).toHaveLength(1);
    expect(document.querySelectorAll(".post-item-card")).toHaveLength(count);
    if (emptyText) expect(screen.getByText(emptyText)).toBeInTheDocument();
  });

  it("preserves the draft while one panel changes between rail, closed drawer, open drawer, and rail", () => {
    const panelRef = createRef<HTMLDivElement>();
    const { rerender } = render(
      <ProjectUpdatesPanel layoutMode="rail" open={false} panelRef={panelRef} onClose={() => undefined} />,
    );
    const draft = "Coordination note retained across responsive mode changes";
    fireEvent.change(screen.getByLabelText("Share a project update"), { target: { value: draft } });

    rerender(<ProjectUpdatesPanel layoutMode="drawer" open={false} panelRef={panelRef} onClose={() => undefined} />);
    expect(screen.getByLabelText("Share a project update")).toHaveValue(draft);

    rerender(<ProjectUpdatesPanel layoutMode="drawer" open panelRef={panelRef} onClose={() => undefined} />);
    expect(screen.getByRole("dialog", { name: "Updates" })).toBeVisible();
    expect(screen.getByLabelText("Share a project update")).toHaveValue(draft);

    rerender(<ProjectUpdatesPanel layoutMode="rail" open={false} panelRef={panelRef} onClose={() => undefined} />);
    expect(screen.getByLabelText("Share a project update")).toHaveValue(draft);
    expect(document.querySelectorAll("[data-updates-composer]")).toHaveLength(1);
  });

  it("keeps statistic order and exposes long values without truncating the DOM text", () => {
    render(
      <ProjectStatCardsBar values={{
        builtUpArea: "125,750 sq ft",
        budget: "₹12,345,678,900 approved budget",
        client: "Arjun Nair and the Nila Residence Family Development Trust",
      }} />,
    );

    expect(Array.from(document.querySelectorAll(".horiz-stat-label"), (node) => node.textContent)).toEqual([
      "Start Date",
      "Duration",
      "Built-up Area",
      "Budget",
      "Client",
    ]);
    expect(screen.getByText("125,750 sq ft")).toBeInTheDocument();
    expect(screen.getByText("₹12,345,678,900 approved budget")).toBeInTheDocument();
    expect(screen.getByText("Arjun Nair and the Nila Residence Family Development Trust")).toBeInTheDocument();
  });

  it("codifies container-driven statistics, bounded gallery sizing, and natural heading flow", () => {
    const css = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");
    expect(css).toContain("container-name: project-stats");
    expect(css).toContain("@container project-stats (min-width: 320px)");
    expect(css).toContain("@container project-stats (min-width: 480px)");
    expect(css).toContain("@container project-stats (min-width: 680px)");
    expect(css).toContain("height: clamp(280px, min(calc(50cqi - 4px), 44svh), 460px)");
    expect(css.match(/\.post-media-banner\s*\{/g)).toHaveLength(1);

    const headingRule = css.slice(css.indexOf(".page-heading {"), css.indexOf("@media (max-width: 1080px)"));
    expect(headingRule).not.toMatch(/\n\s*height:\s*36px/);
    expect(headingRule).toContain("min-height: 36px");
  });
});
