"use client";

import React from "react";
import { Star } from "lucide-react";
import type { StudioProviderCardReference } from "@/types/domain/studio-message";

interface ProviderEnquiryGlanceCardProps {
  providerCard: StudioProviderCardReference;
}

export function ProviderEnquiryGlanceCard({
  providerCard,
}: ProviderEnquiryGlanceCardProps) {
  const coverImg = "/assets/nila-hero.jpg";
  const avatarImg = providerCard.avatarUrl || "/assets/arjun-avatar.jpg";

  return (
    <div style={{ marginTop: "12px", marginBottom: "14px" }}>
      {/* Chosen Provider Card (Exact Card structure from Provider Home Page) */}
      <div
        style={{
          width: "280px",
          maxWidth: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          cursor: "default",
        }}
      >
        {/* Banner with Glass Star Rating */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "155px",
            borderRadius: "16px",
            backgroundImage: `url(${coverImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            overflow: "hidden",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
          }}
        >
          {/* Subtle gradient overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, transparent 40%, rgba(0, 0, 0, 0.65) 100%)",
            }}
          />

          {/* Glass Rating Badge */}
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              background: "rgba(15, 23, 42, 0.6)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              color: "#ffffff",
              fontSize: "11.5px",
              fontWeight: 800,
              padding: "3px 8px",
              borderRadius: "8px",
              zIndex: 2,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            }}
          >
            <Star size={11} fill="#ffffff" color="#ffffff" />
            <span>{providerCard.rating || "4.8"}</span>
          </div>
        </div>

        {/* Bottom Meta Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "4px 2px 0 2px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              backgroundImage: `url(${avatarImg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              flexShrink: 0,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
              border: "1px solid #e2e8f0",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "3px", minWidth: 0 }}>
            <h3
              style={{
                fontSize: "14.5px",
                fontWeight: 700,
                color: "#0f172a",
                margin: 0,
                lineHeight: 1.2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {providerCard.name}
            </h3>
            <p
              style={{
                fontSize: "12px",
                fontWeight: 500,
                color: "#64748b",
                margin: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {providerCard.packageTitle ? `${providerCard.packageTitle} • ${providerCard.packagePrice}` : "Structural & Civil Engineering"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
