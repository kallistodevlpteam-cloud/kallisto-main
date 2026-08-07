"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Plus, Layers, CheckCircle2, ArrowUpRight } from "lucide-react";
import styles from "./portfolio-showcase-grid.module.css";

interface ShowcaseItem {
  id: string;
  title: string;
  category: string;
  date: string;
  image: string;
  tags: string[];
  status: "Completed" | "In Review" | "Featured";
}

const INITIAL_PROJECTS: ShowcaseItem[] = [
  {
    id: "proj-1",
    title: "Villa Horizon - Minimalist Residence",
    category: "Architectural Concept",
    date: "Jul 2026",
    image: "/assets/kallisto-partner-franchise-hero.png",
    tags: ["Residential", "3D Render", "BIM"],
    status: "Featured",
  },
  {
    id: "proj-2",
    title: "Aura Executive Spatial Workspace",
    category: "Interior & Workspace Design",
    date: "Jun 2026",
    image: "/assets/hero-desk-2.png",
    tags: ["Commercial", "BOQ Approved", "Vastu Compliant"],
    status: "Completed",
  },
  {
    id: "proj-3",
    title: "Vertex Sustainable Towers",
    category: "Site Feasibility & Structure",
    date: "May 2026",
    image: "/assets/quotation-retyping-workflow.png",
    tags: ["High-Rise", "Feasibility Report"],
    status: "Completed",
  },
];

export function PortfolioShowcaseGrid() {
  const [filter, setFilter] = useState<string>("All");
  const [projects] = useState<ShowcaseItem[]>(INITIAL_PROJECTS);

  const filteredProjects =
    filter === "All"
      ? projects
      : projects.filter((p) => p.category.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className={styles.container}>
      {/* Section Header */}
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Portfolio Showcase</h2>
          <p className={styles.sectionDesc}>
            Completed architectural concepts, engineering drawings, and verified past projects.
          </p>
        </div>

        <button className={styles.addShowcaseBtn} type="button">
          <Plus size={16} />
          <span>Add Showcase</span>
        </button>
      </div>

      {/* Filter Pills */}
      <div className={styles.filterBar}>
        {["All", "Architectural", "Interior", "Feasibility"].map((cat) => (
          <button
            key={cat}
            type="button"
            className={`${styles.filterPill} ${filter === cat ? styles.filterPillActive : ""}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className={styles.grid}>
        {filteredProjects.map((project) => (
          <div key={project.id} className={styles.card}>
            <div className={styles.imageContainer}>
              <Image
                src={project.image}
                alt={project.title}
                fill
                className={styles.projectImg}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <span className={styles.statusBadge}>
                <CheckCircle2 size={12} />
                {project.status}
              </span>
            </div>

            <div className={styles.cardContent}>
              <div className={styles.categoryRow}>
                <span className={styles.categoryText}>
                  <Layers size={13} />
                  {project.category}
                </span>
                <span className={styles.dateText}>{project.date}</span>
              </div>

              <h3 className={styles.projectTitle}>{project.title}</h3>

              <div className={styles.tagsRow}>
                {project.tags.map((tag, idx) => (
                  <span key={idx} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>

              <div className={styles.cardFooter}>
                <button className={styles.viewDetailsBtn} type="button">
                  <span>View Project Showcase</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
