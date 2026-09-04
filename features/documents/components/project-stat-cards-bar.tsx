"use client";

import React from "react";
import {
  BuildingDuotoneIcon,
  CalendarDuotoneIcon,
  ClockDuotoneIcon,
  LayersDuotoneIcon,
  PaymentsDuotoneIcon,
  UserDuotoneIcon,
} from "@/components/layout/sidebar-icons";

interface StatCard {
  id: string;
  label: string;
  value: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

export interface ProjectStatValues {
  startDate?: string;
  duration?: string;
  builtUpArea?: string;
  budget?: string;
  client?: string;
  clientLabel?: string;
  serviceProvider?: string;
  providerLabel?: string;
  projectType?: string;
}

interface ProjectStatCardsBarProps {
  values?: Partial<ProjectStatValues>;
}

const DEFAULT_STAT_VALUES: ProjectStatValues = {
  projectType: "Residential Design",
  duration: "Within 6 Months",
  builtUpArea: "2,800 – 3,200 sq ft",
  budget: "₹40L – ₹60L",
  client: "Ananya Builders",
};

export function ProjectStatCardsBar({ values }: ProjectStatCardsBarProps) {
  const resolvedValues = { ...DEFAULT_STAT_VALUES, ...values };
  const firstCard: StatCard = values?.projectType
    ? {
        id: "project-type",
        label: "Project Type",
        value: resolvedValues.projectType || "Residential Design",
        icon: BuildingDuotoneIcon,
        iconBg: "#EEF2FF",
        iconColor: "#4F46E5",
      }
    : {
        id: "start-date",
        label: "Start Date",
        value: resolvedValues.startDate || "12 Aug 2026",
        icon: CalendarDuotoneIcon,
        iconBg: "#EEF2FF",
        iconColor: "#4F46E5",
      };

  const fifthCardLabel = values?.providerLabel || values?.clientLabel || (values?.serviceProvider ? "Service Provider" : "Client");
  const fifthCardValue = values?.serviceProvider || resolvedValues.client || "Arjun Architects";

  const cards: StatCard[] = [
    firstCard,
    {
      id: "duration",
      label: "Duration",
      value: resolvedValues.duration || "Within 6 Months",
      icon: ClockDuotoneIcon,
      iconBg: "#F0FDF4",
      iconColor: "#16A34A",
    },
    {
      id: "built-up",
      label: "Built-up Area",
      value: resolvedValues.builtUpArea || "2,800 – 3,200 sq ft",
      icon: LayersDuotoneIcon,
      iconBg: "#F5F3FF",
      iconColor: "#7C3AED",
    },
    {
      id: "budget",
      label: "Budget",
      value: resolvedValues.budget || "₹40L – ₹60L",
      icon: PaymentsDuotoneIcon,
      iconBg: "#FEF2F2",
      iconColor: "#E11D48",
    },
    {
      id: "client",
      label: fifthCardLabel,
      value: fifthCardValue,
      icon: UserDuotoneIcon,
      iconBg: "#ECFEFF",
      iconColor: "#0891B2",
    },
  ];

  return (
    <div className="project-stat-cards-container" aria-label="Project Snapshot">
      <div style={{ marginBottom: "10px" }}>
        <h3
          style={{
            margin: 0,
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "var(--muted, #64748b)",
          }}
        >
          PROJECT SNAPSHOT
        </h3>
      </div>
      <div className="project-stat-cards-bar">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.id} className="horiz-stat-card">
              <div
                className="horiz-stat-icon-box"
                style={{ backgroundColor: card.iconBg, color: card.iconColor }}
              >
                <Icon size={18} aria-hidden="true" />
              </div>
              <div className="horiz-stat-info">
                <span className="horiz-stat-label">{card.label}</span>
                <span className="horiz-stat-value">{card.value}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
