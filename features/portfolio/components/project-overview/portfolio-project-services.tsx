"use client";

import { CheckCircle } from "lucide-react";
import type { PortfolioProject } from "@/features/portfolio/types/portfolio.types";
import styles from "./portfolio-project-overview.module.css";

interface PortfolioProjectServicesProps {
  project: PortfolioProject;
}

export function PortfolioProjectServices({
  project,
}: PortfolioProjectServicesProps) {
  const isCompleted = project.status === "completed";

  const services = project.serviceScopes && project.serviceScopes.length > 0
    ? project.serviceScopes
    : [
        {
          name: "Architecture",
          description:
            "Full architectural design services from conceptual development through schematic design and approvals.",
          deliverables: [
            "Concept design and massing models",
            "Space planning and master layout",
            "Design development package",
            "Architectural statutory approval sets",
          ],
          status: "Delivered" as const,
        },
        {
          name: "Interior Design",
          description:
            "Bespoke interior design and spatial coordination rooted in natural materials and ergonomic lighting.",
          deliverables: [
            "Interior space planning and zoning",
            "Material selection and finishes schedule",
            "Custom teak joinery & cabinetry details",
            "Lighting design and fixture selection",
          ],
          status: "Delivered" as const,
        },
        {
          name: "Working Drawings",
          description:
            "Comprehensive technical documentation and Good-For-Construction (GFC) sets for contractor execution.",
          deliverables: [
            "Detailed architectural construction drawings",
            "Door, window, and louvers schedule",
            "Toilet and kitchen layout sheets",
            "Structural and MEP coordination drawings",
          ],
          status: "Delivered" as const,
        },
        {
          name: "Project Coordination",
          description:
            "On-site monitoring, consultant integration, and strict quality assurance throughout construction.",
          deliverables: [
            "Structural and MEP consultant coordination",
            "Periodic site inspection and progress audits",
            "BOQ compliance and material verification",
            "Snagging management and handover sign-off",
          ],
          status: "Delivered" as const,
        },
      ];

  return (
    <section className={styles.sectionBlock} aria-labelledby="services-heading">
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleGroup}>
          <h3 className={styles.sectionTitle} id="services-heading">
            Scope of Services
          </h3>
          <p className={styles.sectionSubtitle}>
            Specialized deliverables and multidisciplinary scope executed
          </p>
        </div>
      </div>

      <div className={styles.servicesGrid}>
        {services.map((svc) => (
          <div key={svc.name} className={styles.serviceCard}>
            <div className={styles.serviceCardTop}>
              <div className={styles.serviceCardHeader}>
                <h4 className={styles.serviceName}>{svc.name}</h4>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: svc.status === "Delivered" || isCompleted ? "#059669" : "#2563eb",
                    background: svc.status === "Delivered" || isCompleted ? "#ecfdf5" : "#eff6ff",
                    padding: "2px 8px",
                    borderRadius: 9999,
                  }}
                >
                  {isCompleted ? "Delivered" : svc.status}
                </span>
              </div>

              <p className={styles.serviceDesc}>{svc.description}</p>
            </div>

            <div className={styles.serviceDeliverablesList}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                Key Deliverables
              </span>
              {svc.deliverables.map((deliv, idx) => (
                <div key={idx} className={styles.serviceDeliverableItem}>
                  <CheckCircle size={13} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{deliv}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
