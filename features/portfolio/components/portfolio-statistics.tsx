import Link from "next/link";
import { Star } from "lucide-react";
import type { PortfolioStatistic } from "@/features/portfolio/types/portfolio.types";
import styles from "./portfolio.module.css";

interface PortfolioStatisticsProps {
  statistics: PortfolioStatistic[];
}

export function PortfolioStatistics({
  statistics,
}: PortfolioStatisticsProps) {
  return (
    <nav className={styles.statisticsBar} aria-label="Portfolio statistics">
      {statistics.map((statistic) => (
        <Link
          className={styles.statisticItem}
          href={statistic.href}
          key={statistic.id}
        >
          <div className={styles.statisticValueRow}>
            <strong className={styles.statisticValue}>{statistic.value}</strong>
            {statistic.hasStar ? (
              <Star
                className={styles.starIcon}
                size={16}
                fill="#f59e0b"
                color="#f59e0b"
                aria-hidden="true"
              />
            ) : null}
          </div>
          <span className={styles.statisticLabel}>{statistic.label}</span>
        </Link>
      ))}
    </nav>
  );
}
