import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./project-site-workspace.module.css";

interface SiteDateNavigationProps {
  label: string;
  onPrevious: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
}

export function SiteDateNavigation({
  label,
  onPrevious,
  onNext,
  nextDisabled = false,
}: SiteDateNavigationProps) {
  return (
    <div className={styles.dateNavigation} aria-label="Site date navigation">
      <button
        type="button"
        aria-label="Previous site day"
        onClick={onPrevious}
      >
        <ChevronLeft size={15} aria-hidden="true" />
      </button>
      <time>{label}</time>
      <button
        type="button"
        aria-label="Next site day"
        disabled={nextDisabled}
        onClick={onNext}
      >
        <ChevronRight size={15} aria-hidden="true" />
      </button>
    </div>
  );
}
