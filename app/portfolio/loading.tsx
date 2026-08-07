import styles from "@/features/portfolio/components/portfolio.module.css";

export default function PortfolioLoading() {
  return (
    <div className={styles.loadingPage} aria-label="Loading portfolio">
      <div className={styles.loadingBanner} />
      <div className={styles.loadingProfile}>
        <div className={styles.loadingAvatar} />
        <div className={styles.loadingLines}>
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className={styles.loadingCollections}>
        {Array.from({ length: 8 }, (_, index) => (
          <span key={index} />
        ))}
      </div>
      <div className={styles.loadingGrid}>
        {Array.from({ length: 6 }, (_, index) => (
          <span key={index} />
        ))}
      </div>
    </div>
  );
}
