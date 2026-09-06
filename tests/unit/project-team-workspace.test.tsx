import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ProjectTeamWorkspace } from "@/features/projects/components/team/project-team-workspace";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/projects/prj-1",
  useSearchParams: () => new URLSearchParams(),
}));

afterEach(() => {
  cleanup();
});

describe("ProjectTeamWorkspace", () => {
  it("renders KPI metric summary and all initial team members", () => {
    render(<ProjectTeamWorkspace projectId="prj-1" projectName="Nila Residence" />);

    // KPI Summary
    expect(screen.getByText("Assigned Team")).toBeInTheDocument();
    expect(screen.getByText("Disciplines")).toBeInTheDocument();
    expect(screen.getByText("Active Tasks")).toBeInTheDocument();
    expect(screen.getByText("Avg Allocation")).toBeInTheDocument();

    // Member names
    expect(screen.getByText("Arjun Menon")).toBeInTheDocument();
    expect(screen.getByText("Priya Sharma")).toBeInTheDocument();

    // Roles and Tasks
    expect(screen.getByText("Project Manager")).toBeInTheDocument();
    expect(screen.getByText("Lead Architect")).toBeInTheDocument();
    expect(screen.getByText("Review slab casting schedule & concrete logistics")).toBeInTheDocument();
  });

  it("filters team members via the search input", () => {
    render(<ProjectTeamWorkspace projectId="prj-1" projectName="Nila Residence" />);

    const searchInput = screen.getByPlaceholderText(/search by name, role, task/i);
    fireEvent.change(searchInput, { target: { value: "Priya" } });

    expect(screen.getByText("Priya Sharma")).toBeInTheDocument();
    expect(screen.queryByText("Arjun Menon")).not.toBeInTheDocument();
  });

  it("toggles to Matrix Table view and renders tabular layout", () => {
    render(<ProjectTeamWorkspace projectId="prj-1" projectName="Nila Residence" />);

    const matrixToggleBtn = screen.getByRole("button", { name: /matrix/i });
    fireEvent.click(matrixToggleBtn);

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("Team Member")).toBeInTheDocument();
    expect(screen.getByText("Project Role")).toBeInTheDocument();
  });

  it("opens modal and adds a new team member", () => {
    render(<ProjectTeamWorkspace projectId="prj-1" projectName="Nila Residence" />);

    const addBtn = screen.getByRole("button", { name: /add team member/i });
    fireEvent.click(addBtn);

    expect(screen.getByText(/Add Member to Nila Residence/i)).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText(/e\.g\. Maya Chandran/i);
    fireEvent.change(nameInput, { target: { value: "Maya Chandran" } });

    const submitBtn = screen.getByRole("button", { name: /Add to Project/i });
    fireEvent.click(submitBtn);

    // New member should now be in the document
    expect(screen.getByText("Maya Chandran")).toBeInTheDocument();
    expect(screen.getByText(/Added Maya Chandran/i)).toBeInTheDocument();
  });
});
