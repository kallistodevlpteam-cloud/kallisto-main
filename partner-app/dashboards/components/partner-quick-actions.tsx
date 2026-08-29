import React from "react";
import Link from "next/link";
import { ArrowRight, PlusCircle, CheckCircle, ExternalLink } from "lucide-react";
import { PartnerQuickAction } from "../../shared/types/partner-domain";

interface PartnerQuickActionsProps {
  actions: PartnerQuickAction[];
  accentColor?: string;
}

export function PartnerQuickActions({ actions, accentColor = "#0f172a" }: PartnerQuickActionsProps) {
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
        gap: "12px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>Quick Operational Actions</h3>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {actions.map((action) => {
          return (
            <Link
              key={action.id}
              href={action.href}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 14px",
                borderRadius: "10px",
                backgroundColor: action.primary ? "#0f172a" : "#f8fafc",
                color: action.primary ? "#ffffff" : "#0f172a",
                border: action.primary ? "none" : "1px solid #e2e8f0",
                textDecoration: "none",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "13px", fontWeight: 600 }}>{action.label}</span>
                <span style={{ fontSize: "11px", color: action.primary ? "#94a3b8" : "#64748b" }}>
                  {action.description}
                </span>
              </div>
              <ArrowRight size={15} color={action.primary ? "#ffffff" : "#64748b"} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
