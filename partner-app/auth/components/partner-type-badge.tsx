import React from "react";
import { PartnerType } from "../../shared/types/partner-domain";
import { getPartnerConfig } from "../../shared/config/partner-config";

interface PartnerTypeBadgeProps {
  partnerType: PartnerType;
  size?: "sm" | "md" | "lg";
  showDot?: boolean;
  className?: string;
}

export function PartnerTypeBadge({
  partnerType,
  size = "md",
  showDot = true,
  className = "",
}: PartnerTypeBadgeProps) {
  const config = getPartnerConfig(partnerType);

  const sizeStyles = {
    sm: { fontSize: "11px", padding: "2px 8px", height: "20px", gap: "4px" },
    md: { fontSize: "12px", padding: "3px 10px", height: "24px", gap: "6px" },
    lg: { fontSize: "13px", padding: "4px 12px", height: "28px", gap: "8px" },
  }[size];

  return (
    <span
      className={`partner-type-badge ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: "9999px",
        fontWeight: 600,
        letterSpacing: "0.02em",
        border: `1px solid ${config.borderColor}`,
        backgroundColor: config.lightBgColor,
        color: config.accentColor,
        ...sizeStyles,
      }}
    >
      {showDot && (
        <span
          style={{
            width: size === "sm" ? "5px" : "6px",
            height: size === "sm" ? "5px" : "6px",
            borderRadius: "50%",
            backgroundColor: config.accentColor,
          }}
        />
      )}
      <span>{config.displayName}</span>
    </span>
  );
}
