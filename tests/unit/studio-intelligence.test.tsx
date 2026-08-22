import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StudioProjectContextCard } from "@/features/studio/components/studio-project-context-card";
import { StudioIntentGrid } from "@/features/studio/components/studio-intent-grid";
import { StudioIntelligenceHub } from "@/features/studio/components/studio-intelligence-hub";
import { StudioIdleContent } from "@/features/studio/components/studio-idle-view";
import { StudioProjectOption } from "@/types/domain/studio";

const MOCK_PROJECTS: StudioProjectOption[] = [
  {
    id: "proj-001",
    workspaceId: "ws-01",
    name: "Luxury Villa Horizon - Living Space & Terrace",
    code: "KL-COK-2026",
    projectType: "Residential Villa",
    phase: "Design Development",
    status: "active",
  },
  {
    id: "proj-002",
    workspaceId: "ws-01",
    name: "Nila Residence Fit-out",
    code: "KL-TVM-2026",
    projectType: "Interior",
    phase: "Procurement",
    status: "active",
  },
];

describe("Hive Studio: 3-Layer Project Intelligence Workspace", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  describe("Layer 1: Project Context & Knowledge Foundation", () => {
    it("renders project scope, metadata and Odin access indicators", () => {
      render(
        <StudioProjectContextCard
          selectedProjectId="proj-001"
          projects={MOCK_PROJECTS}
          onSelectProject={vi.fn()}
        />
      );

      expect(screen.getByText("KL-COK-2026")).toBeInTheDocument();
      expect(screen.getByText("Design Development")).toBeInTheDocument();
      expect(screen.getByText("12 files · 4 active tasks")).toBeInTheDocument();
      expect(screen.getByText("Living Space & Terrace")).toBeInTheDocument();

      // Connected project resource indicators
      expect(screen.getByText("Drawings (Rev 04)")).toBeInTheDocument();
      expect(screen.getByText("Documents (12)")).toBeInTheDocument();
      expect(screen.getByText("BOQ (Preliminary)")).toBeInTheDocument();
      expect(screen.getByText("Tasks (4)")).toBeInTheDocument();
      expect(screen.getByText("Project history")).toBeInTheDocument();
      expect(screen.getByText("Site Feasibility")).toBeInTheDocument();
    });

    it("triggers prompt action when clicking a resource pill", () => {
      const handleSelectPrompt = vi.fn();
      render(
        <StudioProjectContextCard
          selectedProjectId="proj-001"
          projects={MOCK_PROJECTS}
          onSelectProject={vi.fn()}
          onSelectPrompt={handleSelectPrompt}
        />
      );

      fireEvent.click(screen.getByText("Drawings (Rev 04)"));
      expect(handleSelectPrompt).toHaveBeenCalledWith(
        expect.stringContaining("Review and inspect architectural drawings (Rev 04)"),
      );

      fireEvent.click(screen.getByText("BOQ (Preliminary)"));
      expect(handleSelectPrompt).toHaveBeenCalledWith(
        expect.stringContaining("Open and audit the preliminary BOQ breakdown"),
      );
    });
  });

  describe("Layer 2: Action-Oriented Pathways", () => {
    it("renders Explore, Create, Review, Solve with action subtitles", () => {
      const handleSelectIntent = vi.fn();
      render(
        <StudioIntentGrid
          selectedIntent="create"
          onSelectIntent={handleSelectIntent}
        />
      );

      expect(screen.getByText("What do you want to accomplish?")).toBeInTheDocument();
      expect(screen.getByText("Explore")).toBeInTheDocument();
      expect(screen.getByText("Understand this project")).toBeInTheDocument();
      expect(screen.getByText("Create")).toBeInTheDocument();
      expect(screen.getByText("Generate project outputs")).toBeInTheDocument();
      expect(screen.getByText("Review")).toBeInTheDocument();
      expect(screen.getByText("Check and improve work")).toBeInTheDocument();
      expect(screen.getByText("Solve")).toBeInTheDocument();
      expect(screen.getByText("Resolve project problems")).toBeInTheDocument();

      fireEvent.click(screen.getByText("Review"));
      expect(handleSelectIntent).toHaveBeenCalledWith("review");
    });
  });

  describe("Layer 3: Active Work & Project Intelligence", () => {
    it("renders recent work, Odin noticed observations and recommended next action", () => {
      const handleSelectPrompt = vi.fn();
      render(
        <StudioIntelligenceHub
          projectName="Luxury Villa Horizon"
          onSelectPrompt={handleSelectPrompt}
        />
      );

      // Next action banner
      expect(
        screen.getByText("Complete the preliminary estimate for Luxury Villa Horizon"),
      ).toBeInTheDocument();

      // Recent work items
      expect(screen.getByText("Preliminary BOQ — Ground Floor")).toBeInTheDocument();
      expect(screen.getByText("Material specification — Living Room")).toBeInTheDocument();
      expect(screen.getByText("Drawing review — Rev 04")).toBeInTheDocument();

      // Odin noticed observations
      expect(
        screen.getByText("3 missing dimensions in the terrace drawing"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("BOQ has no electrical allowance"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Client approval pending for flooring"),
      ).toBeInTheDocument();

      // Clicking an observation dispatches contextual prompt
      fireEvent.click(screen.getByText("3 missing dimensions in the terrace drawing"));
      expect(handleSelectPrompt).toHaveBeenCalledWith(
        expect.stringContaining("missing dimensions in the terrace drawing"),
      );

      // Clicking next action button dispatches estimate prompt
      fireEvent.click(screen.getByRole("button", { name: /Complete the preliminary estimate/i }));
      expect(handleSelectPrompt).toHaveBeenCalledWith(
        expect.stringContaining("Complete the preliminary estimate for Luxury Villa Horizon"),
      );
    });
  });

  describe("Full StudioIdleContent Integration", () => {
    it("composes Layer 1 and Layer 2 on main canvas without void space", () => {
      render(
        <StudioIdleContent
          selectedProjectId="proj-001"
          projects={MOCK_PROJECTS}
          onSelectProject={vi.fn()}
          selectedIntent="create"
          onSelectIntent={vi.fn()}
        />
      );

      // Layer 1
      expect(screen.getByText("KL-COK-2026")).toBeInTheDocument();
      expect(screen.getByText("Drawings (Rev 04)")).toBeInTheDocument();

      // Layer 2
      expect(screen.getByText("What do you want to accomplish?")).toBeInTheDocument();
      expect(screen.getByText("Explore")).toBeInTheDocument();
    });
  });
});
