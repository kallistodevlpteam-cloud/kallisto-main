"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import type { PortfolioProject } from "@/features/portfolio/types/portfolio.types";
import styles from "./portfolio-project-overview.module.css";

interface PortfolioProjectTeamProps {
  project: PortfolioProject;
}

export function PortfolioProjectTeam({
  project,
}: PortfolioProjectTeamProps) {
  const team = project.teamMembers && project.teamMembers.length > 0
    ? project.teamMembers
    : [
        {
          role: "Lead Architect",
          name: "Arjun K.",
          organization: "Arjun Architects",
          service: "Architecture & Concept Planning",
          status: "Verified" as const,
          isKallistoProvider: true,
          providerId: "arjun-architects",
        },
        {
          role: "Interior Designer",
          name: "Maya Nair",
          organization: "Arjun Architects",
          service: "Interior Architecture & Joinery",
          status: "Verified" as const,
          isKallistoProvider: true,
          providerId: "arjun-architects",
        },
        {
          role: "Structural Engineer",
          name: "K. R. Varma",
          organization: "Frame Structural Consultants",
          service: "Structural Engineering & Grid Analysis",
          status: "Partner" as const,
        },
        {
          role: "General Contractor",
          name: "Paulson Thomas",
          organization: "Greenfield Construction Ltd.",
          service: "Civil Construction & Execution",
          status: "Verified" as const,
          isKallistoProvider: true,
        },
      ];

  return (
    <section className={styles.sectionBlock} aria-labelledby="team-heading">
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleGroup}>
          <h3 className={styles.sectionTitle} id="team-heading">
            Project Team & Collaborators
          </h3>
          <p className={styles.sectionSubtitle}>
            Verified practitioners and specialist consultants involved
          </p>
        </div>
      </div>

      <div className={styles.teamGrid}>
        {team.map((member, idx) => (
          <div key={idx} className={styles.teamCard}>
            <div className={styles.teamCardHeader}>
              <span className={styles.teamRoleTag}>{member.role}</span>
              {member.status === "Verified" && (
                <VerifiedBadge size={16} title="Kallisto Verified Partner" />
              )}
            </div>

            <div>
              {member.isKallistoProvider ? (
                <Link
                  href={member.providerId ? `/portfolio?provider=${member.providerId}` : "/portfolio"}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <h4 className={styles.teamMemberName}>{member.name}</h4>
                  <ArrowUpRight size={14} color="#64748b" />
                </Link>
              ) : (
                <h4 className={styles.teamMemberName}>{member.name}</h4>
              )}
              <p className={styles.teamMemberOrg}>{member.organization}</p>
            </div>

            <p className={styles.teamMemberService}>{member.service}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
