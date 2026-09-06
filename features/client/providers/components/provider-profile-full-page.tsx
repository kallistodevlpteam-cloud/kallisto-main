"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  CheckCircle2,
  Send,
  Sparkles,
} from "lucide-react";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { RupeeIcon } from "@/components/layout/sidebar-icons";
import { useOdin } from "@/hooks/use-odin";
import type { RegisteredServiceProvider } from "../types/client-providers.types";
import styles from "../styles/provider-profile-full-page.module.css";

interface ProviderProfileFullPageProps {
  provider: RegisteredServiceProvider;
}

export function ProviderProfileFullPage({ provider }: ProviderProfileFullPageProps) {
  const { openOdin } = useOdin();

  const handleOpenOdin = () => {
    openOdin({
      prompt: `I would like to review the qualifications, milestone pricing, and architectural portfolio of ${provider.name} for my construction project.`,
      context: {
        route: "/home",
        workspaceId: "client-portal",
        source: "home-templates",
        activeEntityId: provider.id,
        activeEntityType: "provider",
      },
    });
  };

  return (
    <div className={styles.pageContainer}>
      {/* Top Back Row */}
      <div className={styles.topBackRow}>
        <Link href="/client/providers" className={styles.backBtn}>
          <ArrowLeft size={15} />
          <span>Back to Practices</span>
        </Link>
      </div>

      {/* Hero Banner */}
      <section
        className={styles.heroBanner}
        style={{ backgroundImage: `url(${provider.coverImage})` }}
        aria-label={`${provider.name} Hero Banner`}
      >
        <div
          className={styles.heroOverlay}
          style={{
            background: `linear-gradient(180deg, rgba(0, 0, 0, 0.2) 0%, rgba(15, 23, 42, 0.92) 100%), ${provider.bannerGradient}`,
            backgroundBlendMode: "overlay, normal",
          }}
        >
          <div className={styles.verificationBadge}>
            <VerifiedBadge size={16} />
            <span>{provider.verificationBadge}</span>
          </div>

          <h1 className={styles.heroTitle}>{provider.name}</h1>
          <p className={styles.heroSubtitle}>
            {provider.categoryLabel} · {provider.location}
          </p>
        </div>
      </section>

      {/* 2-Column Content Layout */}
      <div className={styles.profileGrid}>
        {/* Main Left Column */}
        <main className={styles.mainCol}>
          {/* Practice Overview */}
          <section className={styles.sectionCard} aria-labelledby="heading-overview">
            <h2 id="heading-overview" className={styles.sectionHeading}>
              Practice Overview
            </h2>
            <p className={styles.bodyText}>{provider.bio}</p>
          </section>

          {/* Studio Philosophy */}
          {provider.philosophy && (
            <section className={styles.sectionCard} aria-labelledby="heading-philosophy">
              <h2 id="heading-philosophy" className={styles.sectionHeading}>
                Studio Philosophy
              </h2>
              <blockquote className={styles.philosophyQuote}>
                &ldquo;{provider.philosophy}&rdquo;
              </blockquote>
            </section>
          )}

          {/* Services & Deliverables */}
          {provider.servicesOffered?.length > 0 && (
            <section className={styles.sectionCard} aria-labelledby="heading-services">
              <h2 id="heading-services" className={styles.sectionHeading}>
                Services & Deliverables
              </h2>
              <ul className={styles.servicesList}>
                {provider.servicesOffered.map((service, i) => (
                  <li key={i} className={styles.serviceItem}>
                    <CheckCircle2 size={15} className={styles.checkIcon} />
                    <span>{service}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Specializations */}
          {provider.skills?.length > 0 && (
            <section className={styles.sectionCard} aria-labelledby="heading-specializations">
              <h2 id="heading-specializations" className={styles.sectionHeading}>
                Specializations
              </h2>
              <div className={styles.chipsWrap}>
                {provider.skills.map((skill, i) => (
                  <span key={i} className={styles.skillChip}>
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Featured Projects Gallery */}
          {provider.featuredProjects?.length > 0 && (
            <section className={styles.sectionCard} aria-labelledby="heading-projects">
              <h2 id="heading-projects" className={styles.sectionHeading}>
                Featured Projects
              </h2>
              <div className={styles.projectsGrid}>
                {provider.featuredProjects.map((project) => (
                  <div key={project.id} className={styles.projectCard}>
                    <div
                      className={styles.projectImage}
                      style={{ backgroundImage: `url(${project.coverImage})` }}
                    />
                    <div className={styles.projectMeta}>
                      <h3 className={styles.projectTitle}>{project.title}</h3>
                      <p className={styles.projectSubtitle}>
                        {project.location} · {project.year} · {project.budget}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Virtual Office Team */}
          {provider.team?.length > 0 && (
            <section className={styles.sectionCard} aria-labelledby="heading-team">
              <h2 id="heading-team" className={styles.sectionHeading}>
                Virtual Office Team
              </h2>
              <div className={styles.teamList}>
                {provider.team.map((member, i) => (
                  <div key={i} className={styles.teamRow}>
                    <div className={styles.teamAvatar}>
                      {member.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                        {member.name}
                      </p>
                      <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                        {member.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Client Reviews */}
          {provider.reviews?.length > 0 && (
            <section className={styles.sectionCard} aria-labelledby="heading-reviews">
              <h2 id="heading-reviews" className={styles.sectionHeading}>
                Client Reviews ({provider.reviews.length})
              </h2>
              <div className={styles.reviewsList}>
                {provider.reviews.map((rev) => (
                  <div key={rev.id} className={styles.reviewItem}>
                    <div className={styles.reviewHeader}>
                      <p className={styles.clientName}>{rev.clientName}</p>
                      <span className={styles.reviewStars}>
                        <Star size={12} fill="#0f172a" color="#0f172a" />
                        {rev.rating.toFixed(1)}
                      </span>
                    </div>
                    <p className={styles.reviewComment}>&ldquo;{rev.comment}&rdquo;</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        {/* Right Sticky Column */}
        <aside className={styles.sideCol} aria-label="Practice Actions & Credentials">
          <div className={styles.actionCard}>
            <div className={styles.feeBlock}>
              <p className={styles.feeLabel}>Starting Fee</p>
              <div className={styles.feeValue}>
                <RupeeIcon size={20} />
                <span>{provider.baseFee}</span>
                <span className={styles.feeUnit}>/{provider.baseFeeUnit}</span>
              </div>
            </div>

            <button
              className={styles.btnPrimaryConnect}
              type="button"
              onClick={() =>
                alert(`Direct consultation inquiry initiated for ${provider.name}.`)
              }
            >
              <Send size={15} />
              <span>Connect Practice</span>
            </button>

            <button
              className={styles.btnSecondaryOdin}
              type="button"
              onClick={handleOpenOdin}
            >
              <Sparkles size={15} />
              <span>Ask Odin AI</span>
            </button>

            <div className={styles.credentialsWrap}>
              {provider.coaRegistrationNumber && (
                <div className={styles.credentialRow}>
                  <span>COA Registration</span>
                  <span className={styles.credentialValue}>{provider.coaRegistrationNumber}</span>
                </div>
              )}
              {provider.gstin && (
                <div className={styles.credentialRow}>
                  <span>GSTIN</span>
                  <span className={styles.credentialValue}>{provider.gstin}</span>
                </div>
              )}
              <div className={styles.credentialRow}>
                <span>Rating</span>
                <span className={styles.credentialValue}>
                  ★ {provider.rating.toFixed(1)} ({provider.reviewCount} reviews)
                </span>
              </div>
              <div className={styles.credentialRow}>
                <span>Experience</span>
                <span className={styles.credentialValue}>{provider.experienceYears} Years</span>
              </div>
              <div className={styles.credentialRow}>
                <span>Completed Projects</span>
                <span className={styles.credentialValue}>{provider.completedProjectsCount}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
