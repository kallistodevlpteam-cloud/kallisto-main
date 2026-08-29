import React from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { PartnerMetric } from "../../shared/types/partner-domain";

interface PartnerMetricCardProps {
  metric: PartnerMetric;
}

export function PartnerMetricCard({ metric }: PartnerMetricCardProps) {
  const isUp = metric.trend === "up";
  const isDown = metric.trend === "down";

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "14px",
        padding: "18px 20px",
        border: "1px solid rgba(226, 232, 240, 0.9)",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "13px", fontWeight: 600, color: "#64748b" }}>{metric.label}</span>
        {metric.change && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "2px",
              fontSize: "11px",
              fontWeight: 600,
              color: isUp ? "#10b981" : isDown ? "#ef4444" : "#64748b",
              backgroundColor: isUp ? "#ecfdf5" : isDown ? "#fef2f2" : "#f1f5f9",
              padding: "2px 6px",
              borderRadius: "9999px",
            }}
          >
            {isUp && <ArrowUpRight size={12} />}
            {isDown && <ArrowDownRight size={12} />}
            {!isUp && !isDown && <Minus size={12} />}
            {metric.change}
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
        <span
          style={{
            fontSize: "26px",
            fontWeight: 700,
            color: metric.colorTheme || "#0f172a",
            letterSpacing: "-0.03em",
          }}
        >
          {metric.value}
        </span>
      </div>

      <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8", lineHeight: 1.35 }}>
        {metric.caption}
      </p>
    </div>
  );
}
