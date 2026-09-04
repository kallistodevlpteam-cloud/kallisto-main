"use client";

import React from "react";
import Image from "next/image";
import {
  X,
  Star,
  MapPin,
  Building,
  CheckCircle2,
  Send,
  Sparkles,
} from "lucide-react";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { RupeeIcon } from "@/components/layout/sidebar-icons";
import type { RegisteredServiceProvider } from "../types/client-providers.types";
import styles from "../styles/client-providers.module.css";

interface ProviderProfileDrawerProps {
  provider: RegisteredServiceProvider | null;
  onClose: () => void;
  onOpenOdinWithProvider?: (provider: RegisteredServiceProvider) => void;
}

export function ProviderProfileDrawer({
  provider,
  onClose,
  onOpenOdinWithProvider,
}: ProviderProfileDrawerProps) {
  if (!provider) return null;

  return (
    <div className={styles.drawerBackdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={styles.drawer}
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <div
          className={styles.drawerHeader}
          style={{ backgroundImage: `url(${provider.coverImage})` }}
        >
          <div
            className={styles.drawerHeaderOverlay}
            style={{
              background: `linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(15, 23, 42, 0.95) 100%), ${provider.bannerGradient}`,
              backgroundBlendMode: "overlay, normal",
            }}
          >
            <button
              className={styles.drawerCloseBtn}
              onClick={onClose}
              type="button"
              aria-label="Close Provider Profile"
            >
              <X size={16} />
            </button>

            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(6px)",
                  padding: "4px 10px",
                  borderRadius: "9999px",
                  fontSize: "11px",
                  fontWeight: 700,
                  marginBottom: "8px",
                }}
              >
                <VerifiedBadge size={14} />
                <span>{provider.verificationBadge}</span>
              </div>
              <h2 className={styles.drawerTitle}>{provider.name}</h2>
              <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "rgba(255, 255, 255, 0.85)" }}>
                {provider.categoryLabel} · {provider.location}
              </p>
            </div>
          </div>
        </div>

        <div className={styles.drawerBody}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {provider.coaRegistrationNumber && (
              <span className={styles.credentialPill}>
                <strong>Reg No:</strong> {provider.coaRegistrationNumber}
              </span>
            )}
            {provider.gstin && (
              <span className={styles.credentialPill}>
                <strong>GSTIN:</strong> {provider.gstin}
              </span>
            )}
            <span className={styles.credentialPill}>
              <Star size={12} fill="#d97706" color="#d97706" />
              <strong>{provider.rating.toFixed(1)}</strong> ({provider.reviewCount} reviews)
            </span>
          </div>

          <div>
            <h4 className={styles.drawerSectionTitle}>Practice Overview</h4>
            <p style={{ fontSize: "13.5px", color: "#334155", lineHeight: "1.6", margin: 0 }}>
              {provider.bio}
            </p>
          </div>

          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              padding: "14px 16px",
            }}
          >
            <h4 className={styles.drawerSectionTitle} style={{ marginBottom: "4px" }}>
              Studio Philosophy
            </h4>
            <p style={{ fontStyle: "italic", fontSize: "13px", color: "#475569", margin: 0 }}>
              &ldquo;{provider.philosophy}&rdquo;
            </p>
          </div>

          <div>
            <h4 className={styles.drawerSectionTitle}>Services & Deliverables</h4>
            <ul className={styles.serviceList}>
              {provider.servicesOffered.map((srv, idx) => (
                <li key={idx}>{srv}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className={styles.drawerSectionTitle}>Specializations</h4>
            <div className={styles.skillsWrap}>
              {provider.skills.map((skill, idx) => (
                <span key={idx} className={styles.skillBadge}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className={styles.drawerSectionTitle}>Virtual Office Team</h4>
            <div className={styles.teamRow}>
              {provider.team.map((member, idx) => (
                <div key={idx} className={styles.teamMemberCard}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: provider.avatarColor,
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "13px",
                      flexShrink: 0,
                    }}
                  >
                    {member.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className={styles.memberMeta}>
                    <span className={styles.memberName}>{member.name}</span>
                    <span className={styles.memberRole}>{member.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className={styles.drawerSectionTitle}>Featured Completed Projects</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {provider.featuredProjects.map((proj) => (
                <div
                  key={proj.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "10px 12px",
                  }}
                >
                  <div
                    style={{
                      width: "60px",
                      height: "50px",
                      borderRadius: "6px",
                      backgroundImage: `url(${proj.coverImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
                    <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#0f172a" }}>
                      {proj.title}
                    </span>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>
                      {proj.location} · {proj.year}
                    </span>
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                    {proj.budget}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className={styles.drawerSectionTitle}>Verified Client Reviews</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {provider.reviews.map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "12px 14px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                      {rev.clientName}
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "2px", fontSize: "12px", fontWeight: 700, color: "#d97706" }}>
                      <Star size={11} fill="#d97706" color="#d97706" />
                      {rev.rating.toFixed(1)}
                    </span>
                  </div>
                  <p style={{ fontSize: "12.5px", color: "#475569", margin: 0, lineHeight: "1.5" }}>
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.drawerFooter}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "#64748b" }}>
              Starting Fee
            </span>
            <span style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", display: "inline-flex", alignItems: "center", gap: "2px" }}>
              <RupeeIcon size={15} />
              {provider.baseFee}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {onOpenOdinWithProvider && (
              <button
                type="button"
                className={styles.btnCoverflowSecondary}
                style={{ color: "#0f172a", background: "#f1f5f9", borderColor: "#cbd5e1" }}
                onClick={() => onOpenOdinWithProvider(provider)}
              >
                <Sparkles size={14} color="#4f46e5" />
                <span>Ask Odin</span>
              </button>
            )}

            <button
              className={styles.btnEnquire}
              type="button"
              onClick={() => {
                alert(`Consultation request sent to ${provider.name}! Their team will review your project requirements in their Kallisto Virtual Office.`);
                onClose();
              }}
            >
              <Send size={14} />
              <span>Connect Practice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
