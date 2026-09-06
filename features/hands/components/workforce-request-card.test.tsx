import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WorkforceRequestCard } from "./workforce-request-card";
import { OpenRequestsCard } from "./open-requests-card";
import type { WorkforceRequest } from "../types/hands.types";

afterEach(() => {
  cleanup();
});

const sampleRequest: WorkforceRequest = {
  id: "req-1",
  projectId: "proj-001",
  projectName: "Nila Residence",
  location: "Thiruvananthapuram, Kerala",
  trade: "Carpenters",
  requiredDate: "Tomorrow",
  quantity: 5,
  fulfilled: 3,
  status: "Partially assigned",
  contractorName: "Forma Master Carpenters & Joinery Crew",
  contractorBrand: "forma",
  contractorRating: 4.9,
  contractorExperienceYears: 11,
  dailyRate: 950,
  contractorCoverImage:
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=900&auto=format&fit=crop&q=80",
};

describe("WorkforceRequestCard", () => {
  it("renders contractor cover, rating, project name, requested workers count, and status", () => {
    const handleSelect = vi.fn();

    render(
      <WorkforceRequestCard
        request={sampleRequest}
        onSelect={handleSelect}
      />,
    );

    // Rating badge & project tag
    expect(screen.getByText("4.9")).toBeInTheDocument();
    expect(screen.getByText("Nila Residence")).toBeInTheDocument();

    // Contractor title & trade
    expect(
      screen.getByText("Forma Master Carpenters & Joinery Crew"),
    ).toBeInTheDocument();
    expect(screen.getByText("Carpenters")).toBeInTheDocument();

    // 3-column metrics: requested workers count, assigned, required date
    expect(screen.getByText("5 workers")).toBeInTheDocument();
    expect(screen.getByText("requested")).toBeInTheDocument();
    expect(screen.getByText("3 / 5")).toBeInTheDocument();
    expect(screen.getByText("assigned")).toBeInTheDocument();
    expect(screen.getByText("Tomorrow")).toBeInTheDocument();
    expect(screen.getByText("required date")).toBeInTheDocument();

    // Status and action
    expect(screen.getByText("Partially assigned")).toBeInTheDocument();
    expect(screen.getByText("Track request")).toBeInTheDocument();

    // Click triggers select
    fireEvent.click(
      screen.getByRole("button", {
        name: "Carpenters request for Nila Residence",
      }),
    );
    expect(handleSelect).toHaveBeenCalledWith(sampleRequest);
  });

  it("renders OpenRequestsCard in cards grid mode and supports view toggle", () => {
    const handleNavigate = vi.fn();
    const handleOpen = vi.fn();
    const handleSelect = vi.fn();

    render(
      <OpenRequestsCard
        requests={[sampleRequest]}
        onNavigateTab={handleNavigate}
        onRequestWorkforce={handleOpen}
        onSelectRequest={handleSelect}
      />,
    );

    // Header & cards grid
    expect(screen.getByText("Open requests")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Pending workforce request cards"),
    ).toBeInTheDocument();
    expect(screen.getByText("5 workers")).toBeInTheDocument();

    // Toggle to list view
    fireEvent.click(screen.getByRole("button", { name: "List view" }));
    expect(
      screen.queryByLabelText("Pending workforce request cards"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Fulfilled")).toBeInTheDocument();

    // Toggle back to grid view
    fireEvent.click(screen.getByRole("button", { name: "Cards grid view" }));
    expect(
      screen.getByLabelText("Pending workforce request cards"),
    ).toBeInTheDocument();
  });

  it("renders multi-trade workforce request card with multiple labour types breakdown under a contractor", () => {
    const handleSelect = vi.fn();
    const multiTradeRequest: WorkforceRequest = {
      id: "req-multi-1",
      projectId: "proj-001",
      projectName: "Nila Residence",
      location: "Thiruvananthapuram, Kerala",
      trade: "Multi-Trade Squad",
      requiredDate: "Tomorrow",
      quantity: 10,
      fulfilled: 7,
      status: "Partially assigned",
      contractorName: "Apex Integrated Civil & Finishing Crew",
      contractorBrand: "apex",
      contractorRating: 4.9,
      contractorExperienceYears: 12,
      dailyRate: 920,
      isMultiTrade: true,
      tradesBreakdown: [
        {
          trade: "Masons",
          quantity: 4,
          fulfilled: 2,
          skillLevel: "Lead brick masons",
          dailyRate: 950,
        },
        {
          trade: "Electricians",
          quantity: 2,
          fulfilled: 1,
          skillLevel: "Certified wiring electricians",
          dailyRate: 1100,
        },
        {
          trade: "Helpers",
          quantity: 4,
          fulfilled: 4,
          skillLevel: "Material staging helpers",
          dailyRate: 650,
        },
      ],
      contractorCoverImage:
        "https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?w=900&auto=format&fit=crop&q=80",
    };

    render(
      <WorkforceRequestCard
        request={multiTradeRequest}
        onSelect={handleSelect}
      />,
    );

    // Multi-trade badges & tags
    expect(screen.getByText("Multi-Trade")).toBeInTheDocument();
    expect(screen.getByText("Multi-Trade Gang (3 Types)")).toBeInTheDocument();

    // Contractor title
    expect(
      screen.getByText("Apex Integrated Civil & Finishing Crew"),
    ).toBeInTheDocument();

    // Multi-trade labour breakdown
    expect(screen.getByText("Labour trades breakdown")).toBeInTheDocument();
    expect(screen.getByText("Masons")).toBeInTheDocument();
    expect(screen.getByText("Electricians")).toBeInTheDocument();
    expect(screen.getByText("Helpers")).toBeInTheDocument();
    expect(screen.getAllByText("4 req")).toHaveLength(2);
    expect(screen.getByText("• 2 assigned")).toBeInTheDocument();
    expect(screen.getByText("2 req")).toBeInTheDocument();
    expect(screen.getByText("• 1 assigned")).toBeInTheDocument();
    expect(screen.getByText("• 4 assigned")).toBeInTheDocument();

    // Metric strip
    expect(screen.getByText("10 workers")).toBeInTheDocument();
    expect(screen.getByText("3 trades req.")).toBeInTheDocument();
    expect(screen.getByText("7 / 10")).toBeInTheDocument();

    // Click handler
    fireEvent.click(
      screen.getByRole("button", {
        name: /Multi-trade workforce request for Nila Residence/i,
      }),
    );
    expect(handleSelect).toHaveBeenCalledWith(multiTradeRequest);
  });
});

