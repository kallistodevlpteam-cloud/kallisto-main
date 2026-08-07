"use client";

import { Star, UserCheck } from "lucide-react";
import styles from "./portfolio.module.css";

export function PortfolioReviews() {
  const reviews = [
    {
      id: "rev-1",
      clientName: "Rohan & Sneha Kapoor",
      projectTitle: "Nila Residence, Kochi",
      rating: 5,
      date: "May 2026",
      comment:
        "Arjun Architects transformed our dream plot into a breathtaking tropical modern villa. The attention to natural light, ventilation, and sustainable materials exceeded our highest expectations.",
      verifiedClient: true,
    },
    {
      id: "rev-2",
      clientName: "Anitha Menon",
      projectTitle: "Courtyard House, Thrissur",
      rating: 5,
      date: "February 2026",
      comment:
        "Extremely professional coordination, detailed BOQs without hidden variations, and flawless execution. The traditional nadumuttam courtyard integration is the soul of our home.",
      verifiedClient: true,
    },
    {
      id: "rev-3",
      clientName: "Fern Tech Pvt Ltd",
      projectTitle: "Fern Workspace, Infopark",
      rating: 5,
      date: "November 2025",
      comment:
        "Delivered our 12,000 sq ft commercial headquarters on time and within budget. Their spatial planning boosted team collaboration and employee well-being significantly.",
      verifiedClient: true,
    },
  ];

  return (
    <div className={styles.reviewsContainer}>
      <div className={styles.reviewsSummaryCard}>
        <div className={styles.ratingScoreBox}>
          <span className={styles.ratingScore}>4.8</span>
          <div className={styles.starRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={18}
                fill="#f59e0b"
                color="#f59e0b"
                aria-hidden="true"
              />
            ))}
          </div>
          <span className={styles.ratingCount}>Based on 32 verified client reviews</span>
        </div>
        <div className={styles.ratingBreakdown}>
          <div className={styles.breakdownRow}>
            <span>98% Client Satisfaction Rate</span>
          </div>
          <div className={styles.breakdownRow}>
            <span>100% On-Time Project Delivery Record</span>
          </div>
        </div>
      </div>

      <div className={styles.reviewsList}>
        {reviews.map((rev) => (
          <article className={styles.reviewCard} key={rev.id}>
            <div className={styles.reviewHeader}>
              <div>
                <div className={styles.clientNameRow}>
                  <h3>{rev.clientName}</h3>
                  {rev.verifiedClient ? (
                    <span className={styles.verifiedClientBadge}>
                      <UserCheck size={12} aria-hidden="true" /> Verified Client
                    </span>
                  ) : null}
                </div>
                <p className={styles.reviewProject}>{rev.projectTitle}</p>
              </div>
              <span className={styles.reviewDate}>{rev.date}</span>
            </div>
            <div className={styles.reviewRatingRow}>
              {[...Array(rev.rating)].map((_, index) => (
                <Star
                  key={index}
                  size={14}
                  fill="#f59e0b"
                  color="#f59e0b"
                  aria-hidden="true"
                />
              ))}
            </div>
            <p className={styles.reviewComment}>{rev.comment}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
