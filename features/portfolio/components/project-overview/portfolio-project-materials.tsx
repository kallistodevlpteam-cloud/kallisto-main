"use client";

import type { PortfolioProject } from "@/features/portfolio/types/portfolio.types";
import styles from "./portfolio-project-overview.module.css";

interface PortfolioProjectMaterialsProps {
  project: PortfolioProject;
}

export function PortfolioProjectMaterials({
  project,
}: PortfolioProjectMaterialsProps) {
  const materials = project.materialItems && project.materialItems.length > 0
    ? project.materialItems
    : [
        {
          name: "Laterite",
          application: "Exterior cladding, retaining walls & courtyard masonry",
          colorSwatch: "#a0522d",
        },
        {
          name: "Natural Stone",
          application: "Courtyard paving, veranda copings & floor thresholds",
          colorSwatch: "#708090",
        },
        {
          name: "Timber",
          application: "Teak joinery, louvers, windows & acoustic ceilings",
          colorSwatch: "#8b5a2b",
        },
        {
          name: "Lime Plaster",
          application: "Breathable, moisture-regulating wall finishes",
          colorSwatch: "#f5f5dc",
        },
      ];

  return (
    <section className={styles.sectionBlock} aria-labelledby="materials-heading">
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleGroup}>
          <h3 className={styles.sectionTitle} id="materials-heading">
            Material Palette
          </h3>
          <p className={styles.sectionSubtitle}>
            Tactile materials, texture selections, and environmental applications
          </p>
        </div>
      </div>

      <div className={styles.materialsGrid}>
        {materials.map((mat) => (
          <div key={mat.name} className={styles.materialCard}>
            <div
              className={styles.materialSwatch}
              style={{ backgroundColor: mat.colorSwatch || "#8b5a2b" }}
            />

            <div className={styles.materialInfo}>
              <h4 className={styles.materialName}>{mat.name}</h4>
              <p className={styles.materialApp}>{mat.application}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
