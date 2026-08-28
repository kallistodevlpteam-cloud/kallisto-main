"use client";

import { useState } from "react";
import { ChevronDown, Heart, Star, TrendingUp } from "lucide-react";
import styles from "./portfolio.module.css";

interface ReviewItem {
  id: string;
  reviewerName: string;
  totalSpend: string;
  totalReviewsCount: number;
  rating: number;
  date: string;
  comment: string;
  liked?: boolean;
}

export function PortfolioReviews() {
  const [dateFilter, setDateFilter] = useState("March 2021 - February 2022");
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>([
    {
      id: "rev-1",
      reviewerName: "Riya Thomas",
      totalSpend: "₹38,000",
      totalReviewsCount: 14,
      rating: 5,
      date: "16 Mar 2026",
      comment:
        "Clear technical coordination, dependable documentation and timely responses throughout the engagement.",
      liked: true,
    },
    {
      id: "rev-2",
      reviewerName: "Rohan & Sneha Kapoor",
      totalSpend: "₹1,25,000",
      totalReviewsCount: 8,
      rating: 5,
      date: "04 Feb 2026",
      comment:
        "Transformed our plot into a breathtaking climate-responsive villa. Attention to natural light, ventilation, and sustainable detailing exceeded our expectations.",
      liked: true,
    },
    {
      id: "rev-3",
      reviewerName: "Anitha Menon",
      totalSpend: "₹85,000",
      totalReviewsCount: 19,
      rating: 5,
      date: "12 Jan 2026",
      comment:
        "Extremely professional coordination, detailed BOQs without hidden variations, and flawless milestone execution from design to handover.",
      liked: false,
    },
  ]);

  const toggleLike = (id: string) => {
    setReviewsList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, liked: !r.liked } : r)),
    );
  };

  return (
    <section className={styles.modernReviewsSection}>
      {/* 1. Header with Date Filter */}
      <div className={styles.modernReviewsHeader}>
        <h2 className={styles.modernReviewsTitle}>Reviews</h2>
        <div className={styles.modernReviewsDateFilter} role="button" tabIndex={0}>
          <span>{dateFilter}</span>
          <ChevronDown size={14} className={styles.modernReviewsChevron} />
        </div>
      </div>

      {/* 2. Top 3-Column Summary Stats */}
      <div className={styles.modernReviewsStatsCard}>
        {/* Column 1: Total Reviews */}
        <div className={styles.modernReviewsStatCol}>
          <span className={styles.modernStatLabel}>Total Reviews</span>
          <div className={styles.modernStatValueRow}>
            <span className={styles.modernStatBigNum}>32</span>
            <span className={styles.modernGrowthBadge}>
              21% <TrendingUp size={11} strokeWidth={2.5} />
            </span>
          </div>
          <span className={styles.modernStatSub}>Growth in reviews on this year</span>
        </div>

        <div className={styles.modernStatsDivider} />

        {/* Column 2: Average Rating */}
        <div className={styles.modernReviewsStatCol}>
          <span className={styles.modernStatLabel}>Average Rating</span>
          <div className={styles.modernStatValueRow}>
            <span className={styles.modernStatBigNum}>4.9</span>
            <div className={styles.modernStarsCluster}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  fill="#f59e0b"
                  color="#f59e0b"
                />
              ))}
            </div>
          </div>
          <span className={styles.modernStatSub}>Average rating on this year</span>
        </div>

        <div className={styles.modernStatsDivider} />

        {/* Column 3: Rating Distribution Bars */}
        <div className={styles.modernReviewsDistCol}>
          <div className={styles.modernDistRow}>
            <span className={styles.modernDistStarLabel}>5</span>
            <div className={styles.modernDistBarTrack}>
              <div className={styles.modernDistBarFill} style={{ width: "82%", background: "#10b981" }} />
            </div>
            <span className={styles.modernDistCount}>2.0k</span>
          </div>
          <div className={styles.modernDistRow}>
            <span className={styles.modernDistStarLabel}>4</span>
            <div className={styles.modernDistBarTrack}>
              <div className={styles.modernDistBarFill} style={{ width: "48%", background: "#06b6d4" }} />
            </div>
            <span className={styles.modernDistCount}>1.0k</span>
          </div>
          <div className={styles.modernDistRow}>
            <span className={styles.modernDistStarLabel}>3</span>
            <div className={styles.modernDistBarTrack}>
              <div className={styles.modernDistBarFill} style={{ width: "24%", background: "#f59e0b" }} />
            </div>
            <span className={styles.modernDistCount}>500</span>
          </div>
          <div className={styles.modernDistRow}>
            <span className={styles.modernDistStarLabel}>2</span>
            <div className={styles.modernDistBarTrack}>
              <div className={styles.modernDistBarFill} style={{ width: "12%", background: "#3b82f6" }} />
            </div>
            <span className={styles.modernDistCount}>200</span>
          </div>
          <div className={styles.modernDistRow}>
            <span className={styles.modernDistStarLabel}>1</span>
            <div className={styles.modernDistBarTrack}>
              <div className={styles.modernDistBarFill} style={{ width: "3%", background: "#ef4444" }} />
            </div>
            <span className={styles.modernDistCount}>0k</span>
          </div>
        </div>
      </div>

      {/* 3. Review Items Feed */}
      <div className={styles.modernReviewsFeed}>
        {reviewsList.map((review) => (
          <article className={styles.modernReviewRow} key={review.id}>
            {/* Left User Meta */}
            <div className={styles.modernReviewUserMeta}>
              <div className={styles.modernReviewUserAvatar}>
                {review.reviewerName.charAt(0)}
              </div>
              <div className={styles.modernReviewUserInfo}>
                <h3 className={styles.modernReviewUserName}>{review.reviewerName}</h3>
                <span className={styles.modernReviewUserSpend}>
                  Total Spend: <strong>{review.totalSpend}</strong>
                </span>
                <span className={styles.modernReviewUserCount}>
                  Total Review: <strong>{review.totalReviewsCount}</strong>
                </span>
              </div>
            </div>

            {/* Right Content & Actions */}
            <div className={styles.modernReviewContent}>
              <div className={styles.modernReviewContentHeader}>
                <div className={styles.modernReviewContentStars}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={13}
                      fill={s <= review.rating ? "#f59e0b" : "#e2e8f0"}
                      color={s <= review.rating ? "#f59e0b" : "#e2e8f0"}
                    />
                  ))}
                </div>
                <span className={styles.modernReviewDate}>{review.date}</span>
              </div>

              <p className={styles.modernReviewBodyText}>{review.comment}</p>

              <div className={styles.modernReviewActionsBar}>
                <button type="button" className={styles.modernReviewActionBtn}>
                  Public Comment
                </button>
                <button type="button" className={styles.modernReviewActionBtn}>
                  Direct Message
                </button>
                <button
                  type="button"
                  className={styles.modernReviewHeartBtn}
                  onClick={() => toggleLike(review.id)}
                  aria-label="Like review"
                >
                  <Heart
                    size={14}
                    fill={review.liked ? "#3b82f6" : "none"}
                    color={review.liked ? "#3b82f6" : "#64748b"}
                  />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
