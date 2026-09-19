import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { ProjectBasicsWorkspace } from "@/features/projects/components/basics/project-basics-workspace";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/projects/prj-1",
  useSearchParams: () => new URLSearchParams(),
}));

afterEach(() => {
  cleanup();
});

describe("ProjectBasicsWorkspace", () => {
  it("renders connected Basics services with fees, status tags, and live updates", () => {
    render(<ProjectBasicsWorkspace projectId="prj-1" projectName="Nila Residence" />);

    // Service names
    expect(screen.getByText("RCC Structural Engineering & Peer Review")).toBeInTheDocument();
    expect(screen.getByText("Integrated MEP Engineering (Electrical & Plumbing)")).toBeInTheDocument();
    expect(screen.getByText("Soil Geotechnical Investigation & Bearing Stability")).toBeInTheDocument();
    expect(screen.getByText("Building Permit & Statutory Sanctions Advisory")).toBeInTheDocument();

    // Providers & Leads
    expect(screen.getByText("Axis Structures (Kochi)")).toBeInTheDocument();
    expect(screen.getByText("Er. Rahul Nair")).toBeInTheDocument();
    expect(screen.getByText("Enviro MEP Consultants (Kozhikode)")).toBeInTheDocument();
    expect(screen.getByText("Siddharth K")).toBeInTheDocument();

    // Live update snippets
    expect(
      screen.getByText(/Uploaded Sheet ST-204 for first-floor slab beam reinforcement detailing/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Updated solar PV inverter tie-in circuits & breaker schedule/i)
    ).toBeInTheDocument();

    // Fees & Status tags
    expect(screen.getByText("Fee: ₹85,000")).toBeInTheDocument();
    expect(screen.getByText("Active (75%)")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("Sanctioned")).toBeInTheDocument();

    // Header title and count badge
    expect(screen.getByText(/Basics Services/i)).toBeInTheDocument();
    expect(screen.getByText("4 Connected Services")).toBeInTheDocument();
  });

  it("opens deliverable modal and renders output details, specifications, and comments", async () => {
    const { fireEvent } = await import("@testing-library/react");
    render(<ProjectBasicsWorkspace projectId="prj-1" projectName="Nila Residence" />);

    // Click "Review & Approve" on Integrated MEP Engineering
    const reviewBtn = screen.getByRole("button", {
      name: /Review and approve Integrated MEP Engineering/i,
    });
    expect(reviewBtn).toBeInTheDocument();
    fireEvent.click(reviewBtn);

    // Modal is opened
    expect(
      screen.getByRole("heading", {
        name: /Solar PV Inverter Tie-in Schematics & Distribution Board Circuit Schedule/i,
      })
    ).toBeInTheDocument();

    // Verify deliverable file and specifications
    expect(screen.getByText("MEP-E-2026-SLD-SOLAR-TIEIN-REV1.2.pdf")).toBeInTheDocument();
    expect(screen.getByText("Rev 1.2")).toBeInTheDocument();
    expect(screen.getByText(/4\.1 MB/i)).toBeInTheDocument();
    expect(screen.getByText("Inverter Rating")).toBeInTheDocument();
    expect(screen.getByText("8kW Three-Phase Hybrid (IP65)")).toBeInTheDocument();
    expect(screen.getByText("Solar Breaker")).toBeInTheDocument();
    expect(screen.getByText("40A 4P C-Curve MCB")).toBeInTheDocument();

    // Verify existing comments
    expect(screen.getByText(/Please verify if the rooftop solar junction box distance exceeds 15 meters/i)).toBeInTheDocument();
    expect(screen.getByText(/Voltage drop calculated at 1.1% with 10 sq mm copper cable/i)).toBeInTheDocument();

    // Pending sign-off banner and buttons
    expect(screen.getByText(/Pending Sign-Off:/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Approve Deliverable/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Request Revision/i })).toBeInTheDocument();
  });

  it("allows user to submit comments in the deliverable modal", async () => {
    const { fireEvent } = await import("@testing-library/react");
    render(<ProjectBasicsWorkspace projectId="prj-1" projectName="Nila Residence" />);

    // Open modal via update snippet click
    const updateSnippet = screen.getByText(/Updated solar PV inverter tie-in circuits & breaker schedule/i);
    fireEvent.click(updateSnippet);

    const commentInput = screen.getByRole("textbox", { name: /Add review comment/i });
    const postBtn = screen.getByRole("button", { name: /Post Comment/i });

    expect(postBtn).toBeDisabled();

    // Type and submit comment
    fireEvent.change(commentInput, {
      target: { value: "Approved conduit routing along the south-facing parapet wall." },
    });
    expect(postBtn).not.toBeDisabled();

    fireEvent.click(postBtn);

    // Comment appears in the thread and input is cleared
    expect(screen.getByText("Approved conduit routing along the south-facing parapet wall.")).toBeInTheDocument();
    expect(screen.getByText("You (Project Lead)")).toBeInTheDocument();
    expect(commentInput).toHaveValue("");
  });

  it("executes approval on pending deliverable and updates UI", async () => {
    const { fireEvent } = await import("@testing-library/react");
    render(<ProjectBasicsWorkspace projectId="prj-1" projectName="Nila Residence" />);

    // Open modal
    const reviewBtn = screen.getByRole("button", {
      name: /Review and approve Integrated MEP Engineering/i,
    });
    fireEvent.click(reviewBtn);

    // Click Approve Deliverable
    const approveBtn = screen.getByRole("button", { name: /Approve Deliverable/i });
    fireEvent.click(approveBtn);

    // Modal footer updates to show approval confirmation
    expect(screen.getByText(/Signed off by/i)).toBeInTheDocument();
    expect(screen.getByText("You (Project Lead)")).toBeInTheDocument();
    expect(screen.getByText(/Deliverable.*signed off and approved by You/i)).toBeInTheDocument();

    // Close modal
    const closeBtn = screen.getByRole("button", { name: /Close modal/i });
    fireEvent.click(closeBtn);

    // Workspace service row should now show Approved indicator badge
    expect(screen.getByText("Approved")).toBeInTheDocument();
  });

  it("closes modal via Escape key", async () => {
    const { fireEvent } = await import("@testing-library/react");
    render(<ProjectBasicsWorkspace projectId="prj-1" projectName="Nila Residence" />);

    const reviewBtn = screen.getByRole("button", {
      name: /Review and approve Integrated MEP Engineering/i,
    });
    fireEvent.click(reviewBtn);

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Press Escape
    fireEvent.keyDown(window, { key: "Escape" });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
