import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StudioWorkspaceShell } from "@/features/studio/workspaces/studio-workspace-shell";

// Mock next/image & next/navigation
vi.mock("next/image", () => ({
  __esModule: true,
  default: ({ fill, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || "mocked image"} />;
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("StudioWorkspaceShell", () => {
  afterEach(() => {
    cleanup();
  });

  const mockTask: any = {
    id: "stask-boq-12345",
    workspaceId: "ws-kallisto-01",
    projectId: "proj-res-001",
    projectCode: "KAL-RES-2026-01",
    projectName: "Luxury Villa Horizon",
    workspaceType: "boq",
    useCase: "create_detailed_boq",
    startMethod: "scratch",
    status: "draft",
    currentVersionId: "ver-stask-boq-12345-1",
    ownerId: "usr-architect-01",
    ownerName: "Lead Architect",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockVersion: any = {
    id: "ver-stask-boq-12345-1",
    taskId: "stask-boq-12345",
    projectId: "proj-res-001",
    versionNumber: 1,
    versionLabel: "V01",
    configurationSnapshot: {
      workspaceType: "boq",
      packageType: "Civil",
      measurementStandard: "IS 1200",
      drawingRevisionIds: [],
      costLocation: "Hyderabad, India",
      includeTaxes: true,
    },
    sourceInputSnapshots: [],
    createdAt: new Date().toISOString(),
    createdByUserId: "usr-architect-01",
  };

  it("renders workspace header with project title, version V01, and draft status pill", () => {
    render(<StudioWorkspaceShell taskId={mockTask.id} initialTask={mockTask} initialVersion={mockVersion} />);
    expect(screen.getByText("V01")).toBeDefined();
    expect(screen.getByText("DRAFT")).toBeDefined();
    expect(screen.getByText("Submit for Review")).toBeDefined();
  });

  it("renders workspace tabs: Workspace Editor, Validation Checks, Revision History, Audit Log", () => {
    render(<StudioWorkspaceShell taskId={mockTask.id} initialTask={mockTask} initialVersion={mockVersion} />);
    expect(screen.getByText("Workspace Editor")).toBeDefined();
    expect(screen.getByText(/Validation Checks/i)).toBeDefined();
    expect(screen.getByText(/Revision History/i)).toBeDefined();
    expect(screen.getByText(/Audit Log/i)).toBeDefined();
  });

  it("switches to Validation Checks tab", () => {
    render(<StudioWorkspaceShell taskId={mockTask.id} initialTask={mockTask} initialVersion={mockVersion} />);
    const valTab = screen.getByText(/Validation Checks/i);
    fireEvent.click(valTab);
    expect(screen.getByText("Workflow Validation & Quality Checks")).toBeDefined();
  });
});
