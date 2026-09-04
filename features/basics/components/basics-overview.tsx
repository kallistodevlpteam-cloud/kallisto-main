"use client";

import {
  BoqDuotoneIcon,
  BuildingDuotoneIcon,
  DocumentsDuotoneIcon,
  DrawingsDuotoneIcon,
  EnergyDuotoneIcon,
  ExploreDuotoneIcon,
  LayersDuotoneIcon,
  PortfolioDuotoneIcon,
  ResolveDuotoneIcon,
  StudioDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import { ArrowRight, ChevronRight, PanelRight, Plus, Star, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
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

const SAVED_SPECIALISTS_PREVIEW = [
  {
    id: "bp_renderfield",
    name: "RenderField Studio",
    domain: "Architectural Visualization",
    rating: 4.9,
    reviews: 59,
  },
  {
    id: "bp_modubim",
    name: "ModuBIM Studio",
    domain: "BIM Coordination",
    rating: 4.8,
    reviews: 29,
  },
  {
    id: "bp_beamworks",
    name: "BeamWorks Structural",
    domain: "Steel & RCC Engineering",
    rating: 4.7,
    reviews: 36,
  },
];

export function BasicsOverview({ projectId }: { projectId?: string }) {
  const [sidePanelOpen, setSidePanelOpen] = useState(false);

  return (
    <div className={styles.overviewPage}>
      {/* Top Right Side Panel Toggle Button */}
      <button
        type="button"
        className={`${styles.basicsSideToggleBtn} ${sidePanelOpen ? styles.basicsSideToggleBtnActive : ""}`}
        onClick={() => setSidePanelOpen((prev) => !prev)}
        title={sidePanelOpen ? "Close side panel" : "Open side panel"}
        aria-label="Toggle side panel"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="4" />
          <line x1="16" y1="8" x2="16" y2="16" />
        </svg>
      </button>

      {/* Grok-Style Centered Intelligence Hub & Command Palette */}
      <section className={styles.grokHeroContainer} aria-label="Kallisto Basics Command Hub">
        {/* Brand Header with unified Kallisto Basics logo */}
        <div className={styles.grokBrand}>
          <Image
            src="/kallisto-basics-logo.png"
            alt="Kallisto Basics"
            width={260}
            height={42}
            className={styles.grokBasicsLogoImg}
            priority
          />
          <p className={styles.grokTagline}>
            Find verified specialists, scope requirements, and build your project with precision.
          </p>
        </div>

        {/* Minimal Search Pill */}
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
                <item.icon size={22} className={styles.dockIconSvg} aria-hidden="true" />
              </span>
              <span className={styles.dockLabel}>{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Slide-out Right Intelligence Side Panel */}
      {sidePanelOpen ? (
        <>
          <div
            className={styles.basicsDrawerBackdrop}
            onClick={() => setSidePanelOpen(false)}
            aria-hidden="true"
          />
          <aside className={styles.basicsDrawerPanel} aria-label="Basics Quick Hub">
            <div className={styles.basicsDrawerHeader}>
              <h2 className={styles.basicsDrawerTitle}>Basics Hub</h2>
              <button
                type="button"
                className={styles.basicsDrawerCloseBtn}
                onClick={() => setSidePanelOpen(false)}
                title="Close panel"
                aria-label="Close panel"
              >
                <X size={15} aria-hidden="true" />
              </button>
            </div>

            <div className={styles.basicsDrawerContent}>
              {/* Quick Actions */}
              <div className={styles.basicsDrawerSection}>
                <h3 className={styles.basicsDrawerSectionTitle}>Quick Actions</h3>
                <Link
                  href={`/basics/requirements/new${projectId ? `?projectId=${projectId}` : ""}`}
                  className={styles.primaryButton}
                  style={{ width: "100%", justifyContent: "center", height: "36px", fontSize: "12.5px" }}
                  onClick={() => setSidePanelOpen(false)}
                >
                  <Plus size={14} aria-hidden="true" />
                  <span>Post a Requirement</span>
                </Link>
                <Link
                  href={`/basics/experts${projectId ? `?projectId=${projectId}` : ""}`}
                  className={styles.secondaryButton}
                  style={{ width: "100%", justifyContent: "center", height: "36px", fontSize: "12.5px" }}
                  onClick={() => setSidePanelOpen(false)}
                >
                  <StudioDuotoneIcon size={16} aria-hidden="true" />
                  <span>Browse Experts Directory</span>
                </Link>
              </div>

              {/* Saved Specialists */}
              <div className={styles.basicsDrawerSection}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h3 className={styles.basicsDrawerSectionTitle}>Saved Specialists</h3>
                  <Link
                    href="/basics/experts"
                    style={{ fontSize: "11px", color: "#0284c7", textDecoration: "none", fontWeight: "600" }}
                    onClick={() => setSidePanelOpen(false)}
                  >
                    View all
                  </Link>
                </div>
                {SAVED_SPECIALISTS_PREVIEW.map((spec) => (
                  <Link
                    key={spec.id}
                    href={`/basics/experts/${spec.id}${projectId ? `?projectId=${projectId}` : ""}`}
                    className={styles.basicsDrawerCard}
                    onClick={() => setSidePanelOpen(false)}
                  >
                    <div className={styles.basicsDrawerCardLeft}>
                      <div className={styles.basicsDrawerCardIcon}>
                        <PortfolioDuotoneIcon size={16} aria-hidden="true" />
                      </div>
                      <div className={styles.basicsDrawerCardInfo}>
                        <strong className={styles.basicsDrawerCardName}>{spec.name}</strong>
                        <span className={styles.basicsDrawerCardSubtitle}>{spec.domain}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "11.5px", fontWeight: "650", color: "#854d0e" }}>
                      <Star size={11} fill="#eab308" color="#eab308" />
                      <span>{spec.rating}</span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Building Codes & Compliance */}
              <div className={styles.basicsDrawerSection}>
                <h3 className={styles.basicsDrawerSectionTitle}>Compliance & Standards</h3>
                <Link
                  href="/basics/experts?code=NBC+2016"
                  className={styles.basicsDrawerCard}
                  onClick={() => setSidePanelOpen(false)}
                >
                  <div className={styles.basicsDrawerCardLeft}>
                    <div className={styles.basicsDrawerCardIcon}>
                      <DocumentsDuotoneIcon size={16} aria-hidden="true" />
                    </div>
                    <div className={styles.basicsDrawerCardInfo}>
                      <strong className={styles.basicsDrawerCardName}>National Building Code</strong>
                      <span className={styles.basicsDrawerCardSubtitle}>NBC 2016 verified specialists</span>
                    </div>
                  </div>
                  <ChevronRight size={14} color="#94a3b8" />
                </Link>
                <Link
                  href="/basics/experts?code=ASHRAE+90.1"
                  className={styles.basicsDrawerCard}
                  onClick={() => setSidePanelOpen(false)}
                >
                  <div className={styles.basicsDrawerCardLeft}>
                    <div className={styles.basicsDrawerCardIcon}>
                      <DocumentsDuotoneIcon size={16} aria-hidden="true" />
                    </div>
                    <div className={styles.basicsDrawerCardInfo}>
                      <strong className={styles.basicsDrawerCardName}>ASHRAE Standards</strong>
                      <span className={styles.basicsDrawerCardSubtitle}>HVAC & Energy Efficiency</span>
                    </div>
                  </div>
                  <ChevronRight size={14} color="#94a3b8" />
                </Link>
              </div>
            </div>
          </aside>
        </>
      ) : null}
    </div>
  );
}
