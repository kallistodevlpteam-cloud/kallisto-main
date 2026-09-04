"use client";

import { Star } from "lucide-react";
import type { PortfolioProject } from "@/features/portfolio/types/portfolio.types";
import styles from "./portfolio-project-overview.module.css";

interface PortfolioProjectFeedbackProps {
  project: PortfolioProject;
}

export function PortfolioProjectFeedback({
  project,
}: PortfolioProjectFeedbackProps) {
  const feedback = project.clientFeedback;
  if (!feedback) return null;

  return (
    <section className={styles.sectionBlock} aria-labelledby="feedback-heading">
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleGroup}>
          <h3 className={styles.sectionTitle} id="feedback-heading">
            Client Feedback & Review
          </h3>
          <p className={styles.sectionSubtitle}>
            Verified testimonial from the property owner
          </p>
        </div>
      </div>

      <div className={styles.feedbackBox}>
        <div className={styles.feedbackStars} aria-label={`${feedback.rating} out of 5 stars`}>
          {Array.from({ length: feedback.rating }).map((_, i) => (
            <Star key={i} size={18} fill="#f59e0b" color="#f59e0b" aria-hidden="true" />
          ))}
        </div>

        <blockquote className={styles.feedbackQuote}>
          &ldquo;{feedback.quote}&rdquo;
        </blockquote>

        <div className={styles.feedbackAuthor}>
          <span className={styles.feedbackName}>{feedback.clientName}</span>
          <span className={styles.feedbackContext}>
            {feedback.projectContext}
            {feedback.date ? ` • ${feedback.date}` : ""}
          </span>
        </div>
      </div>
    </section>
  );
}
