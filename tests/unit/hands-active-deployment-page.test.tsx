import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import { describe, expect, it, vi, afterEach } from "vitest";
import { ActiveDeploymentWorkspace } from "@/features/hands/components/active-deployment-workspace";
import { getDeploymentById } from "@/features/hands/services/hands.mock";

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || "mock image"} />;
  },
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/hands/deployments/deployment-nila",
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("ActiveDeploymentWorkspace Component", () => {
  afterEach(cleanup);
  const deployment = getDeploymentById("deployment-nila")!;

  it("renders dedicated active deployment project page with title and site assignment", () => {
    render(<ActiveDeploymentWorkspace deployment={deployment} basePath="/hands" />);

    expect(screen.getAllByText("Nila Residence").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Thiruvananthapuram, Kerala/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText("8 masons · 10 helpers").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Rajeev K\./i).length).toBeGreaterThan(0);
  });

  it("displays Labour Contractor Profiles with verified badges and details", () => {
    render(<ActiveDeploymentWorkspace deployment={deployment} basePath="/hands" />);

    expect(screen.getAllByText("Apex Integrated Civil").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Malabar Site Crew").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Kallisto Civil Guild").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Verified Site Workforce").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Rajan K.").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Gireesh Kumar").length).toBeGreaterThan(0);
  });

  it("renders today's site activity and supervisor site log", () => {
    render(<ActiveDeploymentWorkspace deployment={deployment} basePath="/hands" />);

    expect(
      screen.getAllByText(/First-floor brick masonry & lintel level preparation/i).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(/Site supervisor log/i).length).toBeGreaterThan(0);
  });

  it("opens request workers drawer when clicking Request Workers button", () => {
    render(<ActiveDeploymentWorkspace deployment={deployment} basePath="/hands" />);

    const requestBtns = screen.getAllByRole("button", { name: /Request Workers/i });
    expect(requestBtns.length).toBeGreaterThan(0);
    fireEvent.click(requestBtns[0]);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("switches to Payment & Bill subtab and renders financial overview, billing cycle, and ledger table", () => {
    render(<ActiveDeploymentWorkspace deployment={deployment} basePath="/hands" />);

    const paymentTab = screen.getByRole("button", { name: /Payment & Bill/i });
    expect(paymentTab).toBeInTheDocument();
    fireEvent.click(paymentTab);

    // 4 KPI financial summary cards
    expect(screen.getByText("Total Contract Value")).toBeInTheDocument();
    expect(screen.getByText("Daily Billing Rate")).toBeInTheDocument();
    expect(screen.getByText("Paid to Date")).toBeInTheDocument();
    expect(screen.getByText("Pending Settlement")).toBeInTheDocument();

    // Billing cycle and progress
    expect(screen.getByText("Settlement Status & Billing Cycle")).toBeInTheDocument();
    expect(screen.getByText(/Shift Delivery Progress/i)).toBeInTheDocument();

    // Details header and table
    expect(screen.getByText("Payment & Bill Details")).toBeInTheDocument();
    expect(screen.getByText(/Total Settled to Date/i)).toBeInTheDocument();
    expect(screen.getByText("Labour Contractor & Activity")).toBeInTheDocument();
    expect(screen.getAllByText("Apex Integrated Civil").length).toBeGreaterThan(0);
    expect(screen.getByText("Milestone Deployment Advance")).toBeInTheDocument();
    expect(screen.getByText("Weekly Deployment Settlement - Cycle 1")).toBeInTheDocument();

    // Verify Pay Contractor button is removed as requested
    expect(screen.queryByRole("button", { name: /\+ Pay Contractor|Pay Contractor/i })).not.toBeInTheDocument();
  });

  it("filters payment ledger by contractor using contractor filter chips in Payment & Bill Details", () => {
    render(<ActiveDeploymentWorkspace deployment={deployment} basePath="/hands" />);

    const paymentTab = screen.getByRole("button", { name: /Payment & Bill/i });
    fireEvent.click(paymentTab);

    // Verify contractor filter row exists
    expect(screen.getByText("Filter by Labour Contractor:")).toBeInTheDocument();

    // Prior to filter: both Apex and Malabar transactions are present
    expect(screen.getByText("Milestone Deployment Advance")).toBeInTheDocument(); // Apex
    expect(screen.getByText("Weekly Deployment Settlement - Cycle 1")).toBeInTheDocument(); // Malabar

    // Filter by Malabar Site Crew
    const filterRow = screen.getByText("Filter by Labour Contractor:").parentElement!;
    const malabarChip = within(filterRow).getByRole("button", { name: /Malabar Site Crew/i });
    fireEvent.click(malabarChip);

    // Only Malabar transaction should be visible
    expect(screen.getByText("Weekly Deployment Settlement - Cycle 1")).toBeInTheDocument();
    expect(screen.queryByText("Milestone Deployment Advance")).not.toBeInTheDocument();

    // Reset back to All Contractors
    const allChip = within(filterRow).getByRole("button", { name: /All Contractors/i });
    fireEvent.click(allChip);

    // Both should be restored
    expect(screen.getByText("Milestone Deployment Advance")).toBeInTheDocument();
    expect(screen.getByText("Weekly Deployment Settlement - Cycle 1")).toBeInTheDocument();
  });

  it("opens Manage Project modal with project management modules", () => {
    render(<ActiveDeploymentWorkspace deployment={deployment} basePath="/hands" />);

    const manageBtn = screen.getByRole("button", { name: /Manage Project/i });
    expect(manageBtn).toBeInTheDocument();
    fireEvent.click(manageBtn);

    expect(screen.getByRole("dialog", { name: /Manage Project/i })).toBeInTheDocument();
    expect(screen.getByText("Project Tasks & Deliverables")).toBeInTheDocument();
    expect(screen.getByText("BOQ & Quantities")).toBeInTheDocument();
    expect(screen.getByText("Schedule & Gantt Timeline")).toBeInTheDocument();
    expect(screen.getByText("Site Inspections & Snags")).toBeInTheDocument();
    expect(screen.getByText("Project Finance & Variations")).toBeInTheDocument();
  });

  it("opens Add Task modal and allows adding a new site execution task", () => {
    render(<ActiveDeploymentWorkspace deployment={deployment} basePath="/hands" />);

    const addTaskBtn = screen.getByRole("button", { name: /Add Task/i });
    expect(addTaskBtn).toBeInTheDocument();
    fireEvent.click(addTaskBtn);

    const modal = screen.getByRole("dialog", { name: /Add Site Execution Task/i });
    expect(modal).toBeInTheDocument();

    // Fill in task title
    const titleInput = screen.getByLabelText(/Task Title/i);
    fireEvent.change(titleInput, { target: { value: "External plastering & scaffolding check" } });

    // Submit form via modal button
    const submitBtn = within(modal).getByRole("button", { name: "Add Task" });
    fireEvent.click(submitBtn);

    // Verify modal closed and new task is rendered
    expect(screen.queryByRole("dialog", { name: /Add Site Execution Task/i })).not.toBeInTheDocument();
    expect(screen.getAllByText("External plastering & scaffolding check").length).toBeGreaterThan(0);
  });

  it("switches to History Logs subtab, displays chronological supervisor shift logs, and filters entries", () => {
    render(<ActiveDeploymentWorkspace deployment={deployment} basePath="/hands" />);

    const historyTab = screen.getByRole("button", { name: /History Logs/i });
    expect(historyTab).toBeInTheDocument();
    fireEvent.click(historyTab);

    // Verify history logs section
    expect(screen.getByText("Site Activity & Supervisor History Logs")).toBeInTheDocument();
    expect(screen.getByText(/Perimeter masonry ongoing on North wing wall/i)).toBeInTheDocument();
    expect(screen.getByText(/Shift 11 operations wrapped up/i)).toBeInTheDocument();

    // Test searching logs
    const searchInput = screen.getByPlaceholderText(/Search logs, notes, or supervisor/i);
    fireEvent.change(searchInput, { target: { value: "wire-cut" } });

    expect(screen.getByText(/Delivered batch of 3,000 wire-cut red bricks/i)).toBeInTheDocument();
    expect(screen.queryByText(/Shift 11 operations wrapped up/i)).not.toBeInTheDocument();
  });

  it("cycles task status when clicking status pill and appends supervisor audit log", () => {
    render(<ActiveDeploymentWorkspace deployment={deployment} basePath="/hands" />);

    // In progress task pill
    const inProgressBtns = screen.getAllByRole("button", { name: "In progress" });
    expect(inProgressBtns.length).toBeGreaterThan(0);
    fireEvent.click(inProgressBtns[0]);

    // Should cycle to Completed
    expect(screen.getAllByRole("button", { name: "Completed" }).length).toBeGreaterThan(0);

    // Switch to History Logs and check audit record was added
    const historyTab = screen.getByRole("button", { name: /History Logs/i });
    fireEvent.click(historyTab);

    expect(screen.getByText(/Status updated for task/i)).toBeInTheDocument();
  });

  it("displays contractor attribution badges on each task when multiple contractors exist", () => {
    render(<ActiveDeploymentWorkspace deployment={deployment} basePath="/hands" />);

    // Check that contractor filter bar exists
    const activityFilterRow = screen.getByText("Filter by Contractor:").parentElement!;
    expect(within(activityFilterRow).getByRole("button", { name: /All Contractors/i })).toBeInTheDocument();

    // Verify badges on tasks
    const apexBadges = screen.getAllByTitle(/Assigned to Apex Integrated Civil/i);
    expect(apexBadges.length).toBeGreaterThan(0);

    const malabarBadges = screen.getAllByTitle(/Assigned to Malabar Site Crew/i);
    expect(malabarBadges.length).toBeGreaterThan(0);

    const supervisionBadges = screen.getAllByTitle(/Assigned to Site Supervision/i);
    expect(supervisionBadges.length).toBeGreaterThan(0);
  });

  it("allows filtering activities by contractor using contractor filter chips", () => {
    render(<ActiveDeploymentWorkspace deployment={deployment} basePath="/hands" />);

    // Initially all 3 tasks are present
    expect(screen.getAllByText("Perimeter brick masonry & plumb line verification").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Mortar preparation & material staging to scaffolding").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Lintel rebar placement check with site engineer").length).toBeGreaterThan(0);

    // Filter by Malabar Site Crew in activities section
    const activityFilterRow = screen.getByText("Filter by Contractor:").parentElement!;
    const malabarChip = within(activityFilterRow).getByRole("button", { name: /Malabar Site Crew/i });
    fireEvent.click(malabarChip);

    // Only Malabar task should remain
    expect(screen.getAllByText("Mortar preparation & material staging to scaffolding").length).toBeGreaterThan(0);
    expect(screen.queryByText("Perimeter brick masonry & plumb line verification")).not.toBeInTheDocument();
    expect(screen.queryByText("Lintel rebar placement check with site engineer")).not.toBeInTheDocument();

    // Reset back to All Contractors
    const allChip = within(activityFilterRow).getByRole("button", { name: /All Contractors/i });
    fireEvent.click(allChip);

    expect(screen.getAllByText("Perimeter brick masonry & plumb line verification").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Mortar preparation & material staging to scaffolding").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Lintel rebar placement check with site engineer").length).toBeGreaterThan(0);
  });

  it("allows assigning a specific contractor in Add Task modal and shows its badge", () => {
    render(<ActiveDeploymentWorkspace deployment={deployment} basePath="/hands" />);

    const addTaskBtn = screen.getByRole("button", { name: /Add Task/i });
    fireEvent.click(addTaskBtn);

    const modal = screen.getByRole("dialog", { name: /Add Site Execution Task/i });
    expect(modal).toBeInTheDocument();

    // Fill in task title
    const titleInput = screen.getByLabelText(/Task Title/i);
    fireEvent.change(titleInput, { target: { value: "Mortar batch quality testing" } });

    // Select assigned contractor
    const contractorSelect = screen.getByLabelText(/Assigned Labour Contractor/i);
    fireEvent.change(contractorSelect, { target: { value: "Malabar Site Crew" } });

    // Submit
    const submitBtn = within(modal).getByRole("button", { name: "Add Task" });
    fireEvent.click(submitBtn);

    // Verify task is added with contractor badge
    expect(screen.getAllByText("Mortar batch quality testing").length).toBeGreaterThan(0);
    expect(screen.getAllByTitle("Assigned to Malabar Site Crew").length).toBeGreaterThanOrEqual(2);
  });

  it("displays primary 'Supervisor' button instead of add supervisor log and opens profile modal on click", () => {
    render(<ActiveDeploymentWorkspace deployment={deployment} basePath="/hands" />);

    const historyTab = screen.getByRole("button", { name: /History Logs/i });
    fireEvent.click(historyTab);

    // Verify Add Supervisor Log button is NOT present
    expect(screen.queryByRole("button", { name: /Add Supervisor Log/i })).not.toBeInTheDocument();

    // Verify primary Supervisor button is present
    const supervisorBtn = screen.getByRole("button", { name: /^supervisor$/i });
    expect(supervisorBtn).toBeInTheDocument();

    // Clicking supervisor button opens the supervisor profile modal
    fireEvent.click(supervisorBtn);
    const modal = screen.getByRole("dialog", { name: /Site Supervisor Profile/i });
    expect(modal).toBeInTheDocument();
    expect(screen.getByText("Certified Site Supervisor & QA Lead")).toBeInTheDocument();
    expect(screen.getByText("On-Site Dispatch")).toBeInTheDocument();
    expect(screen.getByText("+91 98470 21980")).toBeInTheDocument();

    // Close modal
    const closeBtn = screen.getByRole("button", { name: /Close supervisor profile/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole("dialog", { name: /Site Supervisor Profile/i })).not.toBeInTheDocument();
  });

  it("opens labour details modal on clicking labour contractor card to show assigned workers (total, active, on-leave, roster)", () => {
    render(<ActiveDeploymentWorkspace deployment={deployment} basePath="/hands" />);

    // Switch to Labour Contractors tab
    const contractorsTab = screen.getByRole("button", { name: /Labour Contractors/i });
    fireEvent.click(contractorsTab);

    // Initially, modal is not open
    expect(screen.queryByRole("dialog", { name: /Labour Details/i })).not.toBeInTheDocument();

    // Find Apex Integrated Civil card and click it
    const apexCard = screen.getByRole("button", { name: /Labour contractor: Apex Integrated Civil/i });
    expect(apexCard).toBeInTheDocument();
    fireEvent.click(apexCard);

    // Now labour details modal is open
    const modal = screen.getByRole("dialog", { name: /Apex Integrated Civil — Labour Details/i });
    expect(modal).toBeInTheDocument();
    expect(within(modal).getByText("Total Labours")).toBeInTheDocument();
    expect(within(modal).getAllByText("8").length).toBeGreaterThanOrEqual(1);
    expect(within(modal).getByText("Active Labours")).toBeInTheDocument();
    expect(within(modal).getByText(/100% muster recorded/i)).toBeInTheDocument();
    expect(within(modal).getByText(/Full attendance/i)).toBeInTheDocument();
    expect(within(modal).getByText("Rajan K.")).toBeInTheDocument();
    expect(within(modal).getByText("Lead Foreman & Structural Mason")).toBeInTheDocument();
    expect(within(modal).getByText("Murugan S.")).toBeInTheDocument();
    expect(within(modal).getByText("Perimeter brick masonry & jointing")).toBeInTheDocument();

    // Filter by Active
    const activeTab = within(modal).getByRole("button", { name: /Active \(8\)/i });
    fireEvent.click(activeTab);
    expect(within(modal).getByText("Murugan S.")).toBeInTheDocument();

    // Close modal via Done button
    const doneBtn = within(modal).getByRole("button", { name: /Done/i });
    fireEvent.click(doneBtn);
    expect(screen.queryByRole("dialog", { name: /Apex Integrated Civil — Labour Details/i })).not.toBeInTheDocument();

    // Now click Malabar Site Crew card
    const malabarCard = screen.getByRole("button", { name: /Labour contractor: Malabar Site Crew/i });
    fireEvent.click(malabarCard);

    // Verify Malabar modal: 10 total, 8 active, 2 on leave
    const malabarModal = screen.getByRole("dialog", { name: /Malabar Site Crew — Labour Details/i });
    expect(malabarModal).toBeInTheDocument();
    expect(within(malabarModal).getByText(/80% muster recorded/i)).toBeInTheDocument();
    expect(within(malabarModal).getByText(/Absence noted/i)).toBeInTheDocument();
    expect(within(malabarModal).getByText("Gireesh Kumar")).toBeInTheDocument();
    expect(within(malabarModal).getByText("Ramesh Kumar")).toBeInTheDocument();

    // Filter by On Leave tab in modal
    const onLeaveTab = within(malabarModal).getByRole("button", { name: /On Leave \(2\)/i });
    fireEvent.click(onLeaveTab);
    expect(within(malabarModal).getByText("Ramesh Kumar")).toBeInTheDocument();
    expect(within(malabarModal).getByText("Reported absence / Replacement requested")).toBeInTheDocument();

    // Close modal via X button
    const closeBtn = within(malabarModal).getByRole("button", { name: /Close assigned labours modal/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole("dialog", { name: /Malabar Site Crew — Labour Details/i })).not.toBeInTheDocument();
  });

  it("opens labour details modal when clicking View Labour Details button on contractor card footer", () => {
    render(<ActiveDeploymentWorkspace deployment={deployment} basePath="/hands" />);

    // Switch to Labour Contractors tab
    const contractorsTab = screen.getByRole("button", { name: /Labour Contractors/i });
    fireEvent.click(contractorsTab);

    // Find footer button for Apex Integrated Civil
    const viewLabourBtn = screen.getByRole("button", { name: /View Labour Details \(8\/8 Active\)/i });
    expect(viewLabourBtn).toBeInTheDocument();
    fireEvent.click(viewLabourBtn);

    // Modal opens
    const modal = screen.getByRole("dialog", { name: /Apex Integrated Civil — Labour Details/i });
    expect(modal).toBeInTheDocument();
    expect(within(modal).getByText("Total Labours")).toBeInTheDocument();

    // Search for a worker
    const searchInput = within(modal).getByPlaceholderText(/Search worker, role, task/i);
    fireEvent.change(searchInput, { target: { value: "Murugan" } });
    expect(within(modal).getByText("Murugan S.")).toBeInTheDocument();

    // Verify contact/call button is not rendered
    expect(within(modal).queryByRole("link", { name: /Call/i })).not.toBeInTheDocument();

    // Close modal
    const doneBtn = within(modal).getByRole("button", { name: /Done/i });
    fireEvent.click(doneBtn);
    expect(screen.queryByRole("dialog", { name: /Apex Integrated Civil — Labour Details/i })).not.toBeInTheDocument();
  });

  it("switches to Activity subtab, displays site activity calendar with BOQ items and Gantt milestones", () => {
    render(<ActiveDeploymentWorkspace deployment={deployment} basePath="/hands" />);

    // Click Activity tab
    const activityTab = screen.getByRole("button", { name: /^Activity/i });
    expect(activityTab).toBeInTheDocument();
    fireEvent.click(activityTab);

    // Verify calendar header and month
    expect(screen.getByText("Site Activity & Labour Calendar")).toBeInTheDocument();
    expect(screen.getByText("September 2026")).toBeInTheDocument();

    // Verify BOQ item code and scope on task cards
    expect(screen.getAllByText(/BOQ-04.1/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/230mm Wire-Cut Red Clay Brickwork/i).length).toBeGreaterThan(0);

    // Verify Gantt milestone badge
    expect(screen.getAllByText(/Phase 2: Superstructure Masonry & Lintel Level/i).length).toBeGreaterThan(0);

    // Verify Service category
    expect(screen.getAllByText(/Civil & Masonry Works/i).length).toBeGreaterThan(0);
  });

  it("allows service provider to update a task via Update Task modal and reflects changes in calendar", () => {
    render(<ActiveDeploymentWorkspace deployment={deployment} basePath="/hands" />);

    const activityTab = screen.getByRole("button", { name: /Activity/i });
    fireEvent.click(activityTab);

    const updateBtns = screen.getAllByRole("button", { name: /Update Task/i });
    expect(updateBtns.length).toBeGreaterThan(0);
    fireEvent.click(updateBtns[0]);

    // Modal opens
    const modal = screen.getByRole("dialog", { name: /Update Site Task/i });
    expect(modal).toBeInTheDocument();

    // Modify task title
    const titleInput = screen.getByLabelText(/Task Title/i);
    fireEvent.change(titleInput, { target: { value: "Perimeter brick masonry — East & North facades" } });

    // Submit update
    const saveBtn = within(modal).getByRole("button", { name: /Save Changes/i });
    fireEvent.click(saveBtn);

    // Modal closes and updated title is rendered
    expect(screen.queryByRole("dialog", { name: /Update Site Task/i })).not.toBeInTheDocument();
    expect(screen.getAllByText("Perimeter brick masonry — East & North facades").length).toBeGreaterThan(0);

    // Switch to History Logs and check update audit entry
    const historyTab = screen.getByRole("button", { name: /History Logs/i });
    fireEvent.click(historyTab);
    expect(screen.getByText(/Task details updated:/i)).toBeInTheDocument();
  });

  it("allows service provider to cancel a task via Cancel Task modal with reason", () => {
    render(<ActiveDeploymentWorkspace deployment={deployment} basePath="/hands" />);

    const activityTab = screen.getByRole("button", { name: /Activity/i });
    fireEvent.click(activityTab);

    const cancelBtns = screen.getAllByRole("button", { name: /Cancel Task/i });
    expect(cancelBtns.length).toBeGreaterThan(0);
    fireEvent.click(cancelBtns[0]);

    // Cancel modal opens
    const modal = screen.getByRole("dialog", { name: /Cancel Site Task/i });
    expect(modal).toBeInTheDocument();

    // Select a quick preset reason: "Weather Disruption / Heavy Rainfall"
    const reasonBtn = screen.getByRole("button", { name: /Weather Disruption/i });
    fireEvent.click(reasonBtn);

    // Confirm cancellation
    const confirmBtn = within(modal).getByRole("button", { name: /Confirm Cancellation/i });
    fireEvent.click(confirmBtn);

    // Modal closes
    expect(screen.queryByRole("dialog", { name: /Cancel Site Task/i })).not.toBeInTheDocument();

    // Task is now marked Cancelled
    expect(screen.getAllByRole("button", { name: /Cancelled/i }).length).toBeGreaterThan(0);
    expect(screen.getByText(/Weather Disruption \/ Heavy Rainfall/i)).toBeInTheDocument();

    // Switch to History Logs and verify audit log was added
    const historyTab = screen.getByRole("button", { name: /History Logs/i });
    fireEvent.click(historyTab);
    expect(screen.getByText(/Task cancelled:/i)).toBeInTheDocument();
    expect(screen.getByText(/Reason: Weather Disruption \/ Heavy Rainfall/i)).toBeInTheDocument();
  });

  it("allows date selection in calendar to view scheduled tasks for another day", () => {
    render(<ActiveDeploymentWorkspace deployment={deployment} basePath="/hands" />);

    const activityTab = screen.getByRole("button", { name: /Activity/i });
    fireEvent.click(activityTab);

    // Click on date cell for 2026-09-10 in calendar grid
    const date10Btn = screen.getByRole("button", { name: /2026-09-10/i });
    fireEvent.click(date10Btn);

    // Agenda now shows tasks for Thursday, Sep 10, 2026
    expect(screen.getByText(/Thursday, Sep 10, 2026/i)).toBeInTheDocument();
    expect(screen.getAllByText("M-25 concrete pour & mechanical vibrator compaction").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/BOQ-06.3/i).length).toBeGreaterThan(0);
  });
});
