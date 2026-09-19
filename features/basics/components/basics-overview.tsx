"use client";

import {
  BoqDuotoneIcon,
  BuildingDuotoneIcon,
  DrawingsDuotoneIcon,
  EnergyDuotoneIcon,
  ExploreDuotoneIcon,
  LayersDuotoneIcon,
  ResolveDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import { LayoutDashboard, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { KallistoLogoMark } from "@/components/layout/kallisto-brand";
import { ExpertSearchBar } from "./expert-search-bar";
import styles from "./basics-workspace.module.css";

const QUICK_SEARCH_DISCIPLINES = [
  {
    label: "MEP",
    query: "MEP",
    icon: EnergyDuotoneIcon,
    accentColor: "#0284c7",
    bgTint: "#f0f9ff",
  },
  {
    label: "Structural",
    query: "Structural",
    icon: BuildingDuotoneIcon,
    accentColor: "#16a34a",
    bgTint: "#f0fdf4",
  },
  {
    label: "3D BIM",
    query: "BIM",
    icon: LayersDuotoneIcon,
    accentColor: "#9333ea",
    bgTint: "#faf5ff",
  },
  {
    label: "Architecture",
    query: "Architecture",
    icon: DrawingsDuotoneIcon,
    accentColor: "#e11d48",
    bgTint: "#fff1f2",
  },
  {
    label: "Fire Safety",
    query: "Fire Safety",
    icon: ResolveDuotoneIcon,
    accentColor: "#ea580c",
    bgTint: "#fff7ed",
  },
  {
    label: "Geotechnical",
    query: "Geotechnical",
    icon: ExploreDuotoneIcon,
    accentColor: "#0891b2",
    bgTint: "#ecfeff",
  },
  {
    label: "Cost & QS",
    query: "Quantity Surveying",
    icon: BoqDuotoneIcon,
    accentColor: "#d97706",
    bgTint: "#fefce8",
  },
];

export function BasicsOverview({ projectId }: { projectId?: string }) {
  return (
    <div className={styles.overviewPage}>
      {/* Top Right Quick Actions: Post Requirement & Dashboard */}
      <div className={styles.overviewTopNavActions}>
        <Link
          href={projectId ? `/basics/requirements/new?projectId=${projectId}` : "/basics/requirements/new"}
          className={styles.overviewRoundBtn}
          title="Post a Requirement"
          aria-label="Post a requirement"
        >
          <Plus size={16} aria-hidden="true" />
        </Link>
        <Link
          href={projectId ? `/basics/dashboard?projectId=${projectId}` : "/basics/dashboard"}
          className={styles.overviewTopNavBtn}
          title="Basics Dashboard"
          aria-label="View Basics dashboard"
        >
          <LayoutDashboard size={14} className={styles.overviewTopNavIcon} aria-hidden="true" />
          <span>Dashboard</span>
        </Link>
      </div>

      {/* Grok-Style Centered Intelligence Hub & Command Palette */}
      <section className={styles.grokHeroContainer} aria-label="Kallisto Basics Command Hub">
        {/* Brand Header with crisp vector Kallisto Basics lockup */}
        <div className={styles.grokBrand}>
          <div className={styles.grokBasicsBrandHeader} aria-label="Kallisto Basics">
            <KallistoLogoMark size={28} className={styles.grokBasicsLogoMark} />
            <span className={styles.grokBasicsBrandTitle}>kallisto</span>
            <span className={styles.grokBasicsBrandTag}>basics</span>
          </div>
          <p className={styles.grokTagline}>
            Find verified specialists, scope requirements, and build your project with precision.
          </p>
        </div>

        {/* Minimal Search Pill with Dynamic Hints */}
        <div className={styles.grokSearchWrapper}>
          <ExpertSearchBar projectId={projectId} />
        </div>

        {/* Quick Search Discipline Dock */}
        <div className={styles.quickSearchDock} role="navigation" aria-label="Quick discipline search">
          {QUICK_SEARCH_DISCIPLINES.map((item) => (
            <Link
              key={item.label}
              href={`/basics/experts?q=${encodeURIComponent(item.query)}${projectId ? `&projectId=${encodeURIComponent(projectId)}` : ""}`}
              className={styles.dockItem}
              title={`Find ${item.label} specialists`}
              style={{
                "--item-accent": item.accentColor,
                "--item-bg": item.bgTint,
              } as React.CSSProperties}
            >
              <span className={styles.dockIconSquircle}>
                <item.icon size={19} className={styles.dockIconSvg} aria-hidden="true" />
              </span>
              <span className={styles.dockLabel}>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Explore all specialists & studios CTA trigger */}
        <Link
          href={projectId ? `/basics/experts?projectId=${projectId}` : "/basics/experts"}
          className={styles.viewDirectoryTrigger}
          title="Explore all specialists & studios"
          aria-label="Explore all specialists and studios"
        >
          <span>Explore all specialists & studios</span>
          <ArrowRight size={13} aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
