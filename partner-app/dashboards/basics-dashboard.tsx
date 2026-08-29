"use client";

import React from "react";
import { usePartnerAuth } from "../auth/context/partner-auth-context";
import { PartnerStatusBanner } from "./components/partner-status-banner";
import { PartnerMetricCard } from "./components/partner-metric-card";
import { PartnerActivityFeed } from "./components/partner-activity-feed";
import { PartnerQuickActions } from "./components/partner-quick-actions";
import {
  BASICS_DASHBOARD_METRICS,
  BASICS_ACTIVITIES,
  BASICS_QUICK_ACTIONS,
} from "../shared/mock/partner-mock-data";

export function BasicsDashboard() {
  const { user } = usePartnerAuth();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <PartnerStatusBanner partnerType="BASICS" user={user} />

      {/* Metrics Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px",
        }}
      >
        {BASICS_DASHBOARD_METRICS.map((metric) => (
          <PartnerMetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      {/* Main Grid: Activity Feed + Quick Actions & Service Quality */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: "20px",
          alignItems: "start",
        }}
      >
        <PartnerActivityFeed
          title="Specialist Service Bookings & Inspection Feed"
          activities={BASICS_ACTIVITIES}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <PartnerQuickActions actions={BASICS_QUICK_ACTIONS} />

          {/* Specialist Category Breakdown Card */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "14px",
              padding: "20px",
              border: "1px solid rgba(226, 232, 240, 0.9)",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
              Active Service Packages & CSAT
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { category: "HVAC Engineering & VRV Diagnostics", count: "6 jobs", score: "4.9 ★", color: "#059669" },
                { category: "Waterproofing & Membrane Insulation", count: "4 jobs", score: "5.0 ★", color: "#0284c7" },
                { category: "Turnkey Modular Joinery & Veneer", count: "5 jobs", score: "4.8 ★", color: "#8b5cf6" },
                { category: "Deep Cleaning & Handover Sanitization", count: "3 jobs", score: "4.9 ★", color: "#eab308" },
              ].map((item) => (
                <div
                  key={item.category}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 10px",
                    borderRadius: "8px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #f1f5f9",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>{item.category}</span>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>{item.count} in progress</span>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: item.color }}>{item.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
