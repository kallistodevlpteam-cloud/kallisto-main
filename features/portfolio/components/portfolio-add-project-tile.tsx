import { Plus } from "lucide-react";
import styles from "./portfolio.module.css";

interface PortfolioAddProjectTileProps {
  onClick: () => void;
}

export function PortfolioAddProjectTile({
  onClick,
}: PortfolioAddProjectTileProps) {
  return (
    <button
      className={styles.addProjectTile}
      type="button"
      onClick={onClick}
    >
      <Plus size={22} aria-hidden="true" />
      <span>Add project</span>
    </button>
  );
}
