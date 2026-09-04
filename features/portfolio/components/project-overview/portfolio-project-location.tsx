"use client";

import { MapPin, ShieldCheck, Compass } from "lucide-react";
import type { PortfolioProject } from "@/features/portfolio/types/portfolio.types";
import styles from "./portfolio-project-overview.module.css";

interface PortfolioProjectLocationProps {
  project: PortfolioProject;
}

export function PortfolioProjectLocation({
  project,
}: PortfolioProjectLocationProps) {
  const cityState = `${project.location.city}, ${project.location.state}`;
  const districtCountry = `${project.location.district ? `${project.location.district} District • ` : ""}${project.location.country}`;

  return (
    <section className={styles.sectionBlock} aria-labelledby="location-heading">
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleGroup}>
          <h3 className={styles.sectionTitle} id="location-heading">
            Project Location
          </h3>
          <p className={styles.sectionSubtitle}>
            Geographical zone and climatic orientation
          </p>
        </div>
      </div>

      <div className={styles.locationBox}>
        <div className={styles.locationInfo}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <MapPin size={20} color="#0f172a" />
            <h4 className={styles.locationCity}>{cityState}</h4>
          </div>

          <p className={styles.locationDesc}>
            {districtCountry}
            <br />
            <strong>Bio-Climatic Zone:</strong> Tropical Coastal Zone · Warm-Humid with Southwest & Northeast Monsoon cycles.
          </p>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: "#64748b",
              background: "#ffffff",
              padding: "6px 12px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              alignSelf: "flex-start",
            }}
          >
            <ShieldCheck size={14} color="#10b981" />
            <span>Exact residential plot address protected for client privacy</span>
          </div>
        </div>

        {/* Stylized Vector Map Canvas Placeholder */}
        <div className={styles.locationMapCanvas}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              color: "#475569",
            }}
          >
            <Compass size={32} color="#0f172a" />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
              {project.location.city}, Kerala
            </span>
            <span style={{ fontSize: 11, color: "#64748b" }}>
              Latitude 9.9312° N · Longitude 76.2673° E
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
