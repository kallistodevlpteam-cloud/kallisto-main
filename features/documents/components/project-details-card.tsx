"use client";

import React from "react";
import {
  Calendar,
  Clock,
  Layers,
  MapPin,
  Home,
  User,
  Activity,
  FileText,
} from "lucide-react";

interface StatCardItem {
  id: string;
  label: string;
  value: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

export function ProjectDetailsCard() {
  const statCards: StatCardItem[] = [
    {
      id: "start-date",
      label: "Start Date",
      value: "12 Aug 2026",
      icon: Calendar,
      iconBg: "#EEF2FF",
      iconColor: "#4F46E5",
    },
    {
      id: "duration",
      label: "Duration",
      value: "26 Weeks",
      icon: Clock,
      iconBg: "#F0FDF4",
      iconColor: "#16A34A",
    },
    {
      id: "built-up",
      label: "Built-up Area",
      value: "3,250 sq ft",
      icon: Layers,
      iconBg: "#F5F3FF",
      iconColor: "#7C3AED",
    },
    {
      id: "site-area",
      label: "Site Area",
      value: "6.5 Cents",
      icon: MapPin,
      iconBg: "#FEF2F2",
      iconColor: "#E11D48",
    },
    {
      id: "type",
      label: "Project Type",
      value: "Residential Villa",
      icon: Home,
      iconBg: "#FFFBEB",
      iconColor: "#D97706",
    },
    {
      id: "client",
      label: "Client",
      value: "Arjun Nair",
      icon: User,
      iconBg: "#ECFEFF",
      iconColor: "#0891B2",
    },
    {
      id: "status",
      label: "Status",
      value: "In Progress",
      icon: Activity,
      iconBg: "#FFF7ED",
      iconColor: "#EA580C",
    },
  ];

  return (
    <div className="project-details-card">
      {/* Vertical Stat Cards Stack */}
      <div className="pdc-stat-stack">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.id} className="pdc-stat-card">
              <div
                className="pdc-stat-icon-box"
                style={{ backgroundColor: card.iconBg, color: card.iconColor }}
              >
                <Icon size={18} strokeWidth={2} />
              </div>
              <div className="pdc-stat-info">
                <span className="pdc-stat-label">{card.label}</span>
                <span className="pdc-stat-value">{card.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Description & Notes Section */}
      <div className="pdc-notes-section">
        <div className="pdc-notes-header">
          <FileText size={14} className="pdc-notes-icon" />
          <span className="pdc-notes-title">Overview & Notes</span>
        </div>
        <p className="pdc-notes-text">
          Luxury 4-bedroom contemporary residential villa featuring sustainable tropical architecture, double-height glass elevations, private pool deck, and smart climate automation.
        </p>
      </div>
    </div>
  );
}
