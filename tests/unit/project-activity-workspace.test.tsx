import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import React from "react";
import { ProjectActivityWorkspace } from "@/features/projects/components/activity/project-activity-workspace";

describe("ProjectActivityWorkspace", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders KPI summary strip with key operational metrics", () => {
    render(<ProjectActivityWorkspace projectId="proj-001" projectName="Nila Residence" />);

    expect(screen.getAllByText("Upcoming Activities").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Supervisor (FTP) Logs")).toBeDefined();
    expect(screen.getByText("Site Labor on Site")).toBeDefined();
    expect(screen.getByText("QA/QC Verification")).toBeDefined();
    expect(screen.getByText("100%")).toBeDefined();
    expect(screen.getByText(/0 Critical Non-conformances/i)).toBeDefined();
  });

  it("renders upcoming activities with scheduled dates, locations, and assigned supervisors", () => {
    render(<ProjectActivityWorkspace projectId="proj-001" projectName="Nila Residence" />);

    expect(screen.getByText("Structural Slab Rebar & Shuttering Inspection")).toBeDefined();
    expect(screen.getByText(/Critical Path · Pre-Pour Clearance/i)).toBeDefined();
    expect(screen.getByText("First Floor Slab & Cantilever Deck")).toBeDefined();
    expect(screen.getByText(/Vikram Das \(Kallisto FTP Supervisor\)/i)).toBeDefined();
    expect(screen.getByText(/25mm cover blocks verified/i)).toBeDefined();

    expect(screen.getByText("Plumbing Rough-in & Pressure Testing")).toBeDefined();
    expect(screen.getByText(/Suresh Nair \(FTP MEP Field Lead\)/i)).toBeDefined();

    expect(screen.getByText("Electrical Conduit Routing & DB Box Placement Check")).toBeDefined();
    expect(screen.getByText("Client & Architect On-Site Sample Review")).toBeDefined();
    expect(screen.getByText("Ready-Mix Concrete (RMC) M25 Batch Pour")).toBeDefined();
  });

  it("renders active supervisor (FTP Team updates) log entries with verified badges and site conditions", () => {
    render(<ProjectActivityWorkspace projectId="proj-001" projectName="Nila Residence" />);

    // Section title
    expect(screen.getByText("Active Log of Supervisor (FTP Team Updates)")).toBeDefined();

    // Supervisor 1
    expect(screen.getAllByText("Vikram Das").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("FTP Site Supervisor · Kallisto Field Team").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("FTP Verified").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Daily Site Supervision & Rebar Verification Log")).toBeDefined();
    expect(screen.getByText("Passed QA/QC Check")).toBeDefined();
    expect(screen.getByText(/Bottom reinforcement steel \(12mm Fe550D\) tied at 150mm c\/c/i)).toBeDefined();
    expect(screen.getByText(/22 Hands active/i)).toBeDefined();

    // Supervisor 2 (QA/QC Engineer)
    expect(screen.getByText("Rohan Verma")).toBeDefined();
    expect(screen.getByText("Senior QA/QC Field Engineer · FTP Team")).toBeDefined();
    expect(screen.getByText("Inward Material Batch & Quality Inspection")).toBeDefined();
    expect(screen.getByText("Batch Approved")).toBeDefined();
    expect(screen.getByText(/UltraTech 53-Grade OPC Cement/i)).toBeDefined();

    // Supervisor 3 (EHS & Safety Auditor)
    expect(screen.getByText("Anand Kumar")).toBeDefined();
    expect(screen.getByText("FTP EHS & Safety Auditor · Kallisto Field Team")).toBeDefined();
    expect(screen.getByText("Site Safety & Hazard Assessment Audit")).toBeDefined();
    expect(screen.getByText("Passed with 1 Advisory")).toBeDefined();
  });

  it("renders milestone history timeline with the authoritative lifecycle events", () => {
    render(<ProjectActivityWorkspace projectId="proj-001" projectName="Nila Residence" />);

    expect(screen.getByText("Activity Timeline")).toBeDefined();
    expect(screen.getByText("Project Created & Active")).toBeDefined();
    expect(screen.getByText("Proposal Accepted")).toBeDefined();
    expect(screen.getByText("Site Feasibility Verified")).toBeDefined();
    expect(screen.getByText("Enquiry Received")).toBeDefined();
  });

  it("filters between tabs correctly (Upcoming, Supervisor Logs, Milestones)", () => {
    render(<ProjectActivityWorkspace projectId="proj-001" projectName="Nila Residence" />);

    // Switch to Upcoming Activities tab
    const upcomingTab = screen.getByRole("tab", { name: /upcoming activities/i });
    fireEvent.click(upcomingTab);

    expect(screen.getByText("Structural Slab Rebar & Shuttering Inspection")).toBeDefined();
    expect(screen.queryByText("Active Log of Supervisor (FTP Team Updates)")).toBeNull();
    expect(screen.queryByText("Project Created & Active")).toBeNull();

    // Switch to Supervisor Log tab
    const supervisorTab = screen.getByRole("tab", { name: /supervisor log/i });
    fireEvent.click(supervisorTab);

    expect(screen.getByText("Active Log of Supervisor (FTP Team Updates)")).toBeDefined();
    expect(screen.queryByText("Structural Slab Rebar & Shuttering Inspection")).toBeNull();
    expect(screen.queryByText("Project Created & Active")).toBeNull();

    // Switch to Milestone History tab
    const milestoneTab = screen.getByRole("tab", { name: /milestone history/i });
    fireEvent.click(milestoneTab);

    expect(screen.getByText("Project Created & Active")).toBeDefined();
    expect(screen.queryByText("Structural Slab Rebar & Shuttering Inspection")).toBeNull();
    expect(screen.queryByText("Active Log of Supervisor (FTP Team Updates)")).toBeNull();
  });

  it("filters activities and supervisor logs by search query", () => {
    render(<ProjectActivityWorkspace projectId="proj-001" projectName="Nila Residence" />);

    const searchInput = screen.getByPlaceholderText(/search activities, supervisor notes/i);
    fireEvent.change(searchInput, { target: { value: "Plumbing" } });

    expect(screen.getByText("Plumbing Rough-in & Pressure Testing")).toBeDefined();
    expect(screen.queryByText("Electrical Conduit Routing & DB Box Placement Check")).toBeNull();
  });

  it("opens modal and requests a site inspection successfully", () => {
    render(<ProjectActivityWorkspace projectId="proj-001" projectName="Nila Residence" />);

    // Click 'Request for Site Inspection'
    const requestBtn = screen.getByRole("button", { name: /request for site inspection/i });
    fireEvent.click(requestBtn);

    expect(screen.getByText("Request for Site Inspection (FTP Team)")).toBeDefined();

    // Fill in title and notes
    const titleInput = screen.getByPlaceholderText(/e\.g\. Electrical Conduit Sleeve Verification/i);
    const notesInput = screen.getByPlaceholderText(/enter detailed site observation/i);

    fireEvent.change(titleInput, { target: { value: "Drainage Slope Gradient Verification" } });
    fireEvent.change(notesInput, {
      target: { value: "Tested ground floor drainage gradient at 1:40 slope with spirit level." },
    });

    // Submit form
    const submitBtn = screen.getByRole("button", { name: /submit inspection request/i });
    fireEvent.click(submitBtn);

    // Should switch to supervisor view and display new log
    expect(screen.getByText("Drainage Slope Gradient Verification")).toBeDefined();
    expect(
      screen.getByText("Tested ground floor drainage gradient at 1:40 slope with spirit level.")
    ).toBeDefined();
  });

  it("allows acknowledging a supervisor log entry", () => {
    render(<ProjectActivityWorkspace projectId="proj-001" projectName="Nila Residence" />);

    const acknowledgeButtons = screen.getAllByRole("button", { name: /^acknowledge$/i });
    expect(acknowledgeButtons.length).toBeGreaterThan(0);

    fireEvent.click(acknowledgeButtons[0]);
    expect(screen.getAllByRole("button", { name: /acknowledged/i }).length).toBeGreaterThan(0);
  });
});
