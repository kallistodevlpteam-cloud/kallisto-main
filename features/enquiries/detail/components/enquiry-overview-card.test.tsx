import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { EnquiryOverviewCard } from "@/features/enquiries/detail/components/enquiry-overview-card";

describe("EnquiryOverviewCard inspiration gallery", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders gallery images strictly from the backend inspiration list", () => {
    render(
      <EnquiryOverviewCard
        projectName="Sunrise Villa"
        inspirationImages={[
          { url: "/assets/projectbg.webp", alt: "Modern Architectural Structure" },
          { url: "/assets/nila-thumb1.jpg", alt: "Entrance Facade Architecture" },
          { url: "/assets/nila-thumb2.jpg", alt: "Living Area Interior Design" },
          { url: "/assets/nila-thumb3.jpg", alt: "Pool Deck Elevation View" },
        ]}
      />
    );

    expect(
      screen.getByRole("button", { name: "View inspiration image 1" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Modern Architectural Structure" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Entrance Facade Architecture" })
    ).toBeInTheDocument();
  });

  it("renders no gallery when the backend provides an empty inspiration list", () => {
    render(
      <EnquiryOverviewCard projectName="Sunrise Villa" inspirationImages={[]} />
    );

    expect(
      screen.queryByRole("button", { name: /View inspiration image/i })
    ).not.toBeInTheDocument();
  });

  it("renders no gallery when the inspiration list is absent", () => {
    render(<EnquiryOverviewCard projectName="Sunrise Villa" />);

    expect(
      screen.queryByRole("button", { name: /View inspiration image/i })
    ).not.toBeInTheDocument();
  });

  it("renders scope categories strictly from the backend scope list", () => {
    render(
      <EnquiryOverviewCard
        projectName="Veranda Court"
        projectScopes={[
          { id: 10, scope_name: "Commercial Fit-out", items: ["Open-plan layout", "Meeting rooms"] },
          { id: 11, scope_name: "MEP", items: ["HVAC design", "Fire safety"] },
        ]}
      />
    );

    expect(screen.getByText("Commercial Fit-out")).toBeInTheDocument();
    expect(screen.getByText("Open-plan layout")).toBeInTheDocument();
    expect(screen.getByText("Meeting rooms")).toBeInTheDocument();
    expect(screen.getByText("MEP")).toBeInTheDocument();
    expect(screen.getByText("HVAC design")).toBeInTheDocument();
  });

  it("renders an empty state when the backend scope list is empty", () => {
    render(<EnquiryOverviewCard projectName="Sunrise Villa" projectScopes={[]} />);

    expect(screen.getByText("No scope categories have been shared yet.")).toBeInTheDocument();
  });
});