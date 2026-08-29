import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { HandsDashboard } from "@/partner-app/dashboards/hands-dashboard";
import { HubDashboard } from "@/partner-app/dashboards/hub-dashboard";
import { BasicsDashboard } from "@/partner-app/dashboards/basics-dashboard";
import { PartnerDashboardHub } from "@/partner-app/dashboards/partner-dashboard-hub";
import { PartnerAuthProvider } from "@/partner-app/auth/context/partner-auth-context";

describe("Partner Dashboards", () => {
  beforeEach(() => {
    cleanup();
  });

  it("renders Hands Dashboard with active fleet metrics, activities, and quick actions", () => {
    render(
      <PartnerAuthProvider>
        <HandsDashboard />
      </PartnerAuthProvider>
    );

    expect(screen.getByText("Available Workers")).toBeDefined();
    expect(screen.getByText("Active On-Site Fleet")).toBeDefined();
    expect(screen.getByText("Attendance Rate")).toBeDefined();
    expect(screen.getByText("Deploy Trade Crew")).toBeDefined();
    expect(screen.getByText("Review Workforce Requests")).toBeDefined();
    expect(screen.getByText("Active Trade Fleet Breakdown")).toBeDefined();
  });

  it("renders Hub Dashboard with snapshot metrics, orders requiring attention, and Odin intelligence", () => {
    render(
      <PartnerAuthProvider>
        <HubDashboard />
      </PartnerAuthProvider>
    );

    expect(screen.getByText("Active Orders")).toBeDefined();
    expect(screen.getByText("Orders Requiring Attention")).toBeDefined();
    expect(screen.getByRole("heading", { name: "Odin" })).toBeDefined();
  });

  it("renders Basics Dashboard with service bookings, active projects, and CSAT scores", () => {
    render(
      <PartnerAuthProvider>
        <BasicsDashboard />
      </PartnerAuthProvider>
    );

    expect(screen.getByText("Active Service Requests")).toBeDefined();
    expect(screen.getByText("Today's Bookings")).toBeDefined();
    expect(screen.getByText("Customer CSAT Score")).toBeDefined();
    expect(screen.getByText("Schedule Specialist Booking")).toBeDefined();
    expect(screen.getByText("Active Service Packages & CSAT")).toBeDefined();
  });

  it("PartnerDashboardHub renders correct dashboard based on forcedType", () => {
    render(
      <PartnerAuthProvider>
        <PartnerDashboardHub forcedType="HUB" />
      </PartnerAuthProvider>
    );

    expect(screen.getAllByText("Active Orders").length).toBeGreaterThan(0);

    cleanup();

    render(
      <PartnerAuthProvider>
        <PartnerDashboardHub forcedType="BASICS" />
      </PartnerAuthProvider>
    );

    expect(screen.getAllByText("Active Service Requests").length).toBeGreaterThan(0);
  });
});
