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
import { Bookmark, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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
      {/* Top Right Quick Actions: Saved Wishlist & Orders */}
      <div className={styles.overviewTopNavActions}>
        <Link
          href={projectId ? `/basics/experts?saved=true&projectId=${projectId}` : "/basics/experts?saved=true"}
          className={styles.discoveryWishlistBtn}
          title="Saved Specialists & Wishlist"
          aria-label="View saved specialists"
        >
          <Bookmark size={15} aria-hidden="true" />
        </Link>
        <Link
          href={projectId ? `/basics/engagements?projectId=${projectId}` : "/basics/engagements"}
          className={styles.discoveryWishlistBtn}
          title="Orders & Engagements"
          aria-label="View orders and engagements"
        >
          <ShoppingBag size={15} aria-hidden="true" />
        </Link>
      </div>

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
                <item.icon size={22} className={styles.dockIconSvg} aria-hidden="true" />
              </span>
              <span className={styles.dockLabel}>{item.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
