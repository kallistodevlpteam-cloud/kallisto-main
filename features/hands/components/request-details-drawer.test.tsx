import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RequestDetailsDrawer } from "./request-details-drawer";
import type { WorkforceRequest } from "../types/hands.types";

afterEach(cleanup);

const mockRequest: WorkforceRequest = {
  id: "request-test-partial",
  projectId: "proj-001",
  projectName: "Nila Residence",
  location: "Thiruvananthapuram, Kerala",
  trade: "Multi-Trade Squad",
  requiredDate: "Tomorrow",
  quantity: 20,
  fulfilled: 11,
  status: "Partially assigned",
  contractorName: "Apex Integrated Civil",
  contractorRating: 4.9,
  contractorExperienceYears: 12,
  dailyRate: 920,
  shiftTiming: "8:00 AM – 5:00 PM",
  duration: "3 weeks",
  isMultiTrade: true,
  tradesBreakdown: [
    { trade: "Masons", quantity: 8, fulfilled: 5, dailyRate: 950 },
    { trade: "Electricians", quantity: 4, fulfilled: 2, dailyRate: 1100 },
    { trade: "Helpers", quantity: 8, fulfilled: 4, dailyRate: 650 },
  ],
};

describe("RequestDetailsDrawer — Split Contractor Matching", () => {
  it("renders pending deficit and allows splitting remaining 9 workers with a nearby contractor", () => {
    const handleClose = vi.fn();
    const handleNavigate = vi.fn();

    render(
      <RequestDetailsDrawer
        request={mockRequest}
        onClose={handleClose}
        onNavigateTab={handleNavigate}
      />
    );

    // Deficit warning notice
    expect(
      screen.getByText(/9 worker positions are still pending assignment under primary contractor/i)
    ).toBeInTheDocument();

    // Nearby contractors section
    expect(
      screen.getByText(/Match nearby contractors for remaining 9 workers/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Malabar Site & Civil Crew")).toBeInTheDocument();

    // Click split & assign action button
    const splitBtn = screen.getByRole("button", {
      name: /Split & request remaining 9 workers from Malabar/i,
    });
    fireEvent.click(splitBtn);

    // Confirmation banner displayed & fulfillment updated
    expect(
      screen.getByText(/100% Workforce Fulfilled via Multi-Contractor Split!/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/11 workers assigned to Apex Integrated Civil \+ 9 workers assigned to Malabar Site & Civil Crew/i)
    ).toBeInTheDocument();
  });
});
