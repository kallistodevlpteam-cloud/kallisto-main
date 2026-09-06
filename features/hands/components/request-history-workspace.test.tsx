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

    const inspectBtns = screen.getAllByRole("button", { name: /Inspect/i });
    expect(inspectBtns.length).toBeGreaterThan(0);

    fireEvent.click(inspectBtns[0]);
    expect(screen.getByText(/Request Audit Log —/i)).toBeInTheDocument();
  });
});
