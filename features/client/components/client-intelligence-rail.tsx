"use client";

import React from "react";
import {
  AlertCircle,
  Calendar,
  Clock,
  FileCheck,
  FileText,
  CreditCard,
  Building,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { ClientProject } from "../types";
import styles from "./client-overview.module.css";

interface ClientIntelligenceRailProps {
  currentProject: ClientProject;
  onActionClick: (title: string) => void;
}

export function ClientIntelligenceRail({
  currentProject,
  onActionClick,
}: ClientIntelligenceRailProps) {
  return (
    <aside className={styles.intelligenceRail} aria-label="Project Intelligence Rail">
      {/* 1. Project Status & Progress Card */}
      <section className={styles.railSection} aria-label="Project Status">
        <div className={styles.railSectionHeader}>
          <span className={styles.railSectionTitle}>
            <TrendingUp size={12} style={{ color: "#6366f1" }} />
            <span>Project Status</span>
          </span>
          <span className={styles.railSectionCount}>{currentProject.progress}% Done</span>
        </div>

        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "12px 14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#64748b" }}>
            <span>Stage</span>
            <strong style={{ color: "#0f172a" }}>{currentProject.stage}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#64748b", marginTop: "6px" }}>
            <span>Lead Provider</span>
            <strong style={{ color: "#0f172a" }}>{currentProject.leadProvider}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#64748b", marginTop: "6px" }}>
            <span>Target Handover</span>
            <strong style={{ color: "#0f172a" }}>{currentProject.targetCompletion}</strong>
          </div>
        </div>
      </section>

      {/* 2. Needs Your Attention */}
      <section className={styles.railSection} aria-label="Needs Attention">
        <div className={styles.railSectionHeader}>
          <span className={styles.railSectionTitle}>
            <AlertCircle size={12} style={{ color: "#ef4444" }} />
            <span>Needs Attention</span>
          </span>
          <span className={styles.railSectionCount}>{currentProject.needsAttention.length}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {currentProject.needsAttention.map((item) => {
            const isUrgent = item.urgency === "high";
            return (
              <div
                key={item.id}
                className={`${styles.attentionCard} ${!isUrgent ? styles.attentionCardMedium : ""}`}
              >
                <div className={styles.attentionTop}>
                  <span className={styles.attentionTitle}>{item.title}</span>
                  <span className={isUrgent ? styles.attentionDate : styles.attentionDateMedium}>
                    {item.date}
                  </span>
                </div>
                {item.description && (
                  <p className={styles.attentionDesc}>{item.description}</p>
                )}
                <button
                  type="button"
                  className={styles.attentionActionBtn}
                  onClick={() => onActionClick(item.title)}
                >
                  {item.actionLabel}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Upcoming Milestones & Events */}
      <section className={styles.railSection} aria-label="Upcoming Schedule">
        <div className={styles.railSectionHeader}>
          <span className={styles.railSectionTitle}>
            <Calendar size={12} style={{ color: "#6366f1" }} />
            <span>Upcoming</span>
          </span>
          <span className={styles.railSectionCount}>{currentProject.upcoming.length}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {currentProject.upcoming.map((up) => (
            <div key={up.id} className={styles.upcomingCard}>
              <div className={styles.upcomingIconBox}>
                {up.type === "visit" ? (
                  <Building size={15} />
                ) : up.type === "payment" ? (
                  <CreditCard size={15} />
                ) : (
                  <Clock size={15} />
                )}
              </div>
              <div className={styles.upcomingMeta}>
                <span className={styles.upcomingTitle}>{up.title}</span>
                <span className={styles.upcomingTime}>
                  {up.date} {up.time ? `• ${up.time}` : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Live Recent Activity */}
      <section className={styles.railSection} aria-label="Recent Project Activity">
        <div className={styles.railSectionHeader}>
          <span className={styles.railSectionTitle}>
            <Clock size={12} style={{ color: "#64748b" }} />
            <span>Recent Activity</span>
          </span>
        </div>

        <div className={styles.activityList}>
          {currentProject.recentActivity.map((act) => (
            <div key={act.id} className={styles.activityItem}>
              <div className={styles.activityDot} />
              <div>
                <span className={styles.activityActor}>{act.actor}</span>{" "}
                <span>{act.action}</span>{" "}
                <span className={styles.activityTarget}>{act.target}</span>
                <span className={styles.activityTime}>{act.time}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}
