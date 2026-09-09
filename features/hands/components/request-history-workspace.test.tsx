import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { RequestHistoryWorkspace } from "./request-history-workspace";

afterEach(cleanup);

describe("RequestHistoryWorkspace", () => {
  it("renders dedicated request history page title, telemetry cards, and filters", () => {
    render(<RequestHistoryWorkspace />);

    expect(screen.getAllByText("Workforce Request History").length).toBeGreaterThan(0);
    expect(screen.getByText("Total Fulfilled Requests")).toBeInTheDocument();
    expect(screen.getByText("Workers Deployed")).toBeInTheDocument();
    expect(screen.getByText("Export History CSV")).toBeInTheDocument();
  });

  it("filters request history by search term", () => {
    render(<RequestHistoryWorkspace />);

    const searchInput = screen.getByPlaceholderText("Search request ID, project, trade or contractor...");
    fireEvent.change(searchInput, { target: { value: "Chroma" } });

    expect(screen.getAllByText("Chroma Finishes & Paint Crew").length).toBeGreaterThan(0);
    expect(screen.queryByText("Apex Integrated Civil & Finishing Crew")).not.toBeInTheDocument();
  });

  it("opens audit log inspection modal when clicking inspect on an item", () => {
    render(<RequestHistoryWorkspace />);

    const inspectBtns = screen.getAllByRole("button", { name: /Inspect log/i });
    expect(inspectBtns.length).toBeGreaterThan(0);

    fireEvent.click(inspectBtns[0]);
    expect(screen.getByText(/Request Audit Log —/i)).toBeInTheDocument();
  });

  it("renders rejected requests and displays rejection reasons in inspector modal", () => {
    render(<RequestHistoryWorkspace />);

    // Shows rejected badges in table
    const rejectedBadges = screen.getAllByText("✕ Rejected");
    expect(rejectedBadges.length).toBeGreaterThan(0);

    // Shows rejection reason snippet in table
    expect(screen.getByText(/Reason: Contractor crew capacity exhausted/i)).toBeInTheDocument();

    // Filter by Rejected status
    const statusSelect = screen.getByDisplayValue("All Statuses");
    fireEvent.change(statusSelect, { target: { value: "Rejected" } });

    // Non-rejected items should disappear
    expect(screen.queryByText("Chroma Finishes & Paint Crew")).not.toBeInTheDocument();
    // Rejected items should be visible
    expect(screen.getByText("Precision Steel & Welders Gang")).toBeInTheDocument();

    // Click 'View reason' button to inspect rejection
    const viewReasonBtns = screen.getAllByRole("button", { name: /View reason/i });
    expect(viewReasonBtns.length).toBeGreaterThan(0);
    fireEvent.click(viewReasonBtns[0]);

    // Inspector modal opens with rejection notice and reason
    expect(screen.getByText("Workforce Request Rejected")).toBeInTheDocument();
    expect(screen.getByText("Official Reason for Rejection:")).toBeInTheDocument();
    expect(screen.getAllByText(/Contractor crew capacity exhausted — unable to mobilize certified 6G structural welders/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Rejection Category:")).toBeInTheDocument();
  });
});
