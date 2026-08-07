"use client";

import React from "react";
import { Calendar, Clock, IndianRupee, Layers, User } from "lucide-react";

interface StatCard {
  id: string;
  label: string;
  value: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

export interface ProjectStatValues {
  startDate: string;
  duration: string;
  builtUpArea: string;
  budget: string;
  client: string;
  projectType?: string;
}

interface ProjectStatCardsBarProps {
  values?: Partial<ProjectStatValues>;
}

const DEFAULT_STAT_VALUES: ProjectStatValues = {
  startDate: "12 Aug 2026",
  duration: "26 Weeks",
  builtUpArea: "3,250 sq ft",
  budget: "₹1.85 Cr",
  client: "Arjun Nair",
};

export function ProjectStatCardsBar({ values }: ProjectStatCardsBarProps) {
  const resolvedValues = { ...DEFAULT_STAT_VALUES, ...values };
  const cards: StatCard[] = [
    { id: "start-date", label: "Start Date", value: resolvedValues.startDate, icon: Calendar, iconBg: "#EEF2FF", iconColor: "#4F46E5" },
    { id: "duration", label: "Duration", value: resolvedValues.duration, icon: Clock, iconBg: "#F0FDF4", iconColor: "#16A34A" },
    { id: "built-up", label: "Built-up Area", value: resolvedValues.builtUpArea, icon: Layers, iconBg: "#F5F3FF", iconColor: "#7C3AED" },
    { id: "budget", label: "Budget", value: resolvedValues.budget, icon: IndianRupee, iconBg: "#FEF2F2", iconColor: "#E11D48" },
    { id: "client", label: "Client", value: resolvedValues.client, icon: User, iconBg: "#ECFEFF", iconColor: "#0891B2" },
  ];

  return (
    <div className="project-stat-cards-container">
      <div className="project-stat-cards-bar">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.id} className="horiz-stat-card">
              <div className="horiz-stat-icon-box" style={{ backgroundColor: card.iconBg, color: card.iconColor }}>
                <Icon size={18} strokeWidth={2} aria-hidden="true" />
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
