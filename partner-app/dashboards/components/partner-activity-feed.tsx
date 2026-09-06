import React from "react";
import { CheckCircle2, Clock, AlertTriangle, Truck, Users, ShieldAlert, Sparkles } from "lucide-react";
import { PartnerActivityItem } from "../../shared/types/partner-domain";

interface PartnerActivityFeedProps {
  title?: string;
  activities: PartnerActivityItem[];
}

export function PartnerActivityFeed({ title = "Live Operations Feed", activities }: PartnerActivityFeedProps) {
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "completed":
      case "approved":
        return { bg: "#ecfdf5", color: "#059669", label: "Completed", icon: CheckCircle2 };
      case "urgent":
        return { bg: "#fef2f2", color: "#dc2626", label: "Urgent", icon: AlertTriangle };
      case "in_transit":
        return { bg: "#eff6ff", color: "#2563eb", label: "In Transit", icon: Truck };
      case "pending":
      default:
        return { bg: "#fefce8", color: "#d97706", label: "Pending", icon: Clock };
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "14px",
        padding: "20px",
        border: "1px solid rgba(226, 232, 240, 0.9)",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>{title}</h3>
        <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500 }}>Live Real-Time</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {activities.map((act) => {
          const badge = getStatusBadge(act.status);
          const StatusIcon = badge.icon;
          return (
            <div
              key={act.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "10px 12px",
                borderRadius: "10px",
                backgroundColor: "#f8fafc",
                border: "1px solid #f1f5f9",
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  backgroundColor: badge.bg,
                  color: badge.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "2px",
                }}
              >
                <StatusIcon size={14} />
              </div>

              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {act.title}
                  </span>
                  <span style={{ fontSize: "11px", color: "#94a3b8", flexShrink: 0 }}>{act.timeAgo}</span>
                </div>
                <p style={{ margin: 0, fontSize: "12px", color: "#64748b", lineHeight: 1.4 }}>
                  {act.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
