import React from "react";
import { Sparkles, CheckCircle2, ShieldCheck, MapPin } from "lucide-react";
import { PartnerType, PartnerUser } from "../../shared/types/partner-domain";
import { getPartnerConfig } from "../../shared/config/partner-config";
import { PartnerTypeBadge } from "../../auth/components/partner-type-badge";

interface PartnerStatusBannerProps {
  partnerType: PartnerType;
  user: PartnerUser | null;
}

export function PartnerStatusBanner({ partnerType, user }: PartnerStatusBannerProps) {
  const config = getPartnerConfig(partnerType);

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        padding: "24px 28px",
        border: `1px solid ${config.borderColor}`,
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        background: `linear-gradient(135deg, #ffffff 0%, ${config.lightBgColor} 100%)`,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <PartnerTypeBadge partnerType={partnerType} size="md" />
          <span style={{ fontSize: "12px", color: "#64748b", display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <MapPin size={12} />
            {user?.location || "Kochi Hub, Kerala"}
          </span>
          <span style={{ fontSize: "12px", color: "#10b981", display: "inline-flex", alignItems: "center", gap: "4px", fontWeight: 600 }}>
            <ShieldCheck size={13} />
            Verified Partner
          </span>
        </div>

        <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>
          {user?.partnerBusinessName || config.portalTitle}
        </h1>

        <p style={{ margin: 0, fontSize: "13px", color: "#475569" }}>
          {config.description}
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "10px 16px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
            System Status
          </span>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#10b981", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10b981" }} />
            Operational · 100% SLA
          </span>
        </div>
      </div>
    </div>
  );
}
