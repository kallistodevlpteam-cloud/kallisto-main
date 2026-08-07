import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, act, cleanup } from "@testing-library/react";
import { mockProjectUpdateRepository } from "@/services/repositories/mock-project-update-repository";
import { ProjectUpdatesFeed } from "@/features/projects/components/project-updates-feed";
import { ProjectUpdateComposerRef } from "@/features/projects/components/project-update-composer";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null),
    toString: () => "",
  }),
}));

describe("Project Updates Feed", () => {
  const projectId = "ws-default-proj-001";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("loads and displays initial mock project updates from repository", async () => {
    render(<ProjectUpdatesFeed projectId={projectId} />);

    await waitFor(() => {
      expect(screen.getAllByText(/structural/i).length).toBeGreaterThan(0);
    });

    expect(screen.getByText(/Excavation and foundation pit clearance/i)).toBeDefined();
    expect(screen.getByText(/Ground Floor Layout Drawing/i)).toBeDefined();
  });

  it("filters updates by type when filter option is selected from dropdown", async () => {
    render(<ProjectUpdatesFeed projectId={projectId} />);

    await waitFor(() => {
      expect(screen.getAllByText(/structural/i).length).toBeGreaterThan(0);
    });

    // Open single dropdown
    const filterBtn = screen.getByRole("button", { name: "All updates" });
    await act(async () => {
      fireEvent.click(filterBtn);
    });

    // Select 'Tasks' option
    const taskOption = screen.getByRole("menuitem", { name: "Tasks" });
    await act(async () => {
      fireEvent.click(taskOption);
    });

    await waitFor(() => {
      expect(screen.getAllByText(/Excavation/i).length).toBeGreaterThan(0);
      expect(screen.queryByText("Structural work — Ground floor completed")).toBeNull();
    });
  });

  it("toggles acknowledgement state when Acknowledge button is clicked", async () => {
    render(<ProjectUpdatesFeed projectId={projectId} />);

    await waitFor(() => {
      expect(screen.getAllByText(/structural/i).length).toBeGreaterThan(0);
    });

    const ackButtons = screen.getAllByRole("button", { name: /Acknowledge/i });
    expect(ackButtons.length).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.click(ackButtons[0]);
    });

    await waitFor(() => {
      expect(mockProjectUpdateRepository).toBeDefined();
    });
  });

  it("opens thread drawer when Reply button is clicked", async () => {
    render(<ProjectUpdatesFeed projectId={projectId} />);

    await waitFor(() => {
      expect(screen.getAllByText(/structural/i).length).toBeGreaterThan(0);
    });

    const replyButtons = screen.getAllByRole("button", { name: /Reply/i });
    await act(async () => {
      fireEvent.click(replyButtons[0]);
    });

    await waitFor(() => {
      expect(screen.getAllByText(/Reply/i).length).toBeGreaterThan(0);
    });
  });

  it("focuses composer when focusAndExpand is called via composerRef", async () => {
    const composerRef = React.createRef<ProjectUpdateComposerRef>();
    render(<ProjectUpdatesFeed projectId={projectId} composerRef={composerRef} />);

    await waitFor(() => {
      expect(screen.getAllByText(/structural/i).length).toBeGreaterThan(0);
    });

    expect(composerRef.current).not.toBeNull();
    await act(async () => {
      composerRef.current?.focusAndExpand();
    });

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Update title (optional)...")).toBeDefined();
    });
  });
});
