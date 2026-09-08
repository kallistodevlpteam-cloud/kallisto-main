import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ContractorPaymentModal } from "@/features/hands/components/contractor-payment-modal";

describe("ContractorPaymentModal Component", () => {
  const defaultProps = {
    contractorName: "Apex Integrated Civil & Finishing Crew",
    assignedWorkersCount: 7,
    totalWorkersRequested: 10,
    projectName: "Nila Residence",
    location: "Thiruvananthapuram, Kerala",
    dailyRate: 8600,
    tradesBreakdown: [
      { trade: "Masons", quantity: 2, dailyRate: 950 },
      { trade: "Electricians", quantity: 1, dailyRate: 1100 },
      { trade: "Helpers", quantity: 4, dailyRate: 650 },
    ],
    onClose: vi.fn(),
    onPaymentSuccess: vi.fn(),
  };

  it("renders contractor payment details and assigned workforce summary", () => {
    render(<ContractorPaymentModal {...defaultProps} />);

    expect(screen.getByText("Contractor Workforce Payment")).toBeInTheDocument();
    expect(screen.getByText("Apex Integrated Civil & Finishing Crew")).toBeInTheDocument();
    expect(screen.getByText(/7 of 10 workers assigned/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Payout Amount:/i)).toBeInTheDocument();
  });

  it("switches between Bank Transfer and UPI Transfer payment methods", () => {
    render(<ContractorPaymentModal {...defaultProps} />);

    // Initially Bank Transfer tab active
    expect(screen.getAllByText(/Verified Contractor Bank Account Details/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText("50100492817264").length).toBeGreaterThan(0);

    // Click UPI Transfer tab
    const upiTabs = screen.getAllByRole("button", { name: /UPI Transfer/i });
    fireEvent.click(upiTabs[0]);

    expect(screen.getByText(/Verified Contractor UPI Transfer/i)).toBeInTheDocument();
    expect(screen.getByText(/apexintegratedcivilfinishingcrew@okaxis/i)).toBeInTheDocument();
    expect(screen.getByText(/Scan to Pay/i)).toBeInTheDocument();
  });

  it("displays shift duration badge and calculates total payout based on durationDays prop", () => {
    render(<ContractorPaymentModal {...defaultProps} durationDays={3} />);

    expect(screen.getAllByText("Shift Duration:").length).toBeGreaterThan(0);
    expect(screen.getByText(/3 shifts \/ days/i)).toBeInTheDocument();
    expect(screen.getAllByText(/16,800/i).length).toBeGreaterThan(0);
  });

  it("submits payment with UTR / Reference ID and displays success receipt", async () => {
    render(<ContractorPaymentModal {...defaultProps} />);

    // Fill reference number
    const refInput = screen.getByLabelText(/Bank Transfer UTR \/ Payment Reference Number/i);
    fireEvent.change(refInput, { target: { value: "UTR948192019482" } });

    const form = refInput.closest("form")!;
    fireEvent.submit(form);

    expect(screen.getByText("Payment Submitted & Recorded")).toBeInTheDocument();
    expect(screen.getByText("UTR948192019482")).toBeInTheDocument();
    expect(defaultProps.onPaymentSuccess).toHaveBeenCalled();
  });
});
