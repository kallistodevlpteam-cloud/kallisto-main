import type {
  PortfolioProfile,
  PortfolioProject,
} from "@/features/portfolio/types/portfolio.types";
import { PortfolioEmptyState } from "./portfolio-empty-state";
import { PortfolioInstaTile } from "./portfolio-insta-tile";
import styles from "./portfolio.module.css";

interface PortfolioProjectGridProps {
  projects: PortfolioProject[];
  profile: PortfolioProfile;
  isOwner: boolean;
  onOpenProject: (
    project: PortfolioProject,
    trigger: HTMLButtonElement,
  ) => void;
}

export function PortfolioProjectGrid({
  projects,
  isOwner,
  onOpenProject,
}: PortfolioProjectGridProps) {
  if (projects.length === 0) {
    return (
      <PortfolioEmptyState
        title="No published projects"
        description={
          isOwner
            ? "Add your first project to start building the visual portfolio."
            : "Published work will appear here when it becomes available."
        }
        actionLabel={isOwner ? "Add project" : undefined}
        actionHref={
          isOwner
            ? "/portfolio?portfolioTab=projects&create=project"
            : undefined
        }
      />
    );
  }

  return (
    <div className={styles.instaGrid}>
      {projects.map((project, index) => (
        <PortfolioInstaTile
          project={project}
          eager={index < 4}
          onOpen={onOpenProject}
          key={project.id}
        />
      ))}
    </div>
  );
}
