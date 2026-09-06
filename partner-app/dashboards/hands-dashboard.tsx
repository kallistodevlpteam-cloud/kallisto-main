"use client";

import React from "react";
import { usePartnerAuth } from "../auth/context/partner-auth-context";
import { PartnerStatusBanner } from "./components/partner-status-banner";
import { PartnerMetricCard } from "./components/partner-metric-card";
import { PartnerActivityFeed } from "./components/partner-activity-feed";
import { PartnerQuickActions } from "./components/partner-quick-actions";
import {
  HANDS_DASHBOARD_METRICS,
  HANDS_ACTIVITIES,
  HANDS_QUICK_ACTIONS,
} from "../shared/mock/partner-mock-data";

export function HandsDashboard() {
  const { user } = usePartnerAuth();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <PartnerStatusBanner partnerType="HANDS" user={user} />

      {/* Metrics Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px",
        }}
      >
        {HANDS_DASHBOARD_METRICS.map((metric) => (
          <PartnerMetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      {/* Main Grid: Activity Feed + Quick Actions & Crew Overview */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: "20px",
          alignItems: "start",
        }}
      >
        <PartnerActivityFeed
          title="Trade Crew & Deployment Feed"
          activities={HANDS_ACTIVITIES}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <PartnerQuickActions actions={HANDS_QUICK_ACTIONS} />

          {/* Trade Category Breakdown Card */}
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
              Active Trade Fleet Breakdown
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { trade: "Masons & Plasterers", active: 48, total: 60, color: "#0284c7" },
                { trade: "Certified Electricians", active: 32, total: 38, color: "#eab308" },
                { trade: "Plumbing Specialists", active: 24, total: 30, color: "#06b6d4" },
                { trade: "Carpenters & Joinery", active: 24, total: 28, color: "#8b5cf6" },
              ].map((item) => (
                <div key={item.trade} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                    <span style={{ fontWeight: 600, color: "#334155" }}>{item.trade}</span>
                    <span style={{ color: "#64748b" }}>
                      {item.active} / {item.total} deployed ({Math.round((item.active / item.total) * 100)}%)
                    </span>
                  </div>
                  <div style={{ height: "6px", width: "100%", backgroundColor: "#f1f5f9", borderRadius: "9999px", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${(item.active / item.total) * 100}%`,
                        backgroundColor: item.color,
                        borderRadius: "9999px",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
