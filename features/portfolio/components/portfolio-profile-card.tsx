import type {
  PortfolioPageData,
  PortfolioTab,
} from "@/features/portfolio/types/portfolio.types";
import { PortfolioPage } from "./portfolio-page";

interface PortfolioProfileCardProps {
  data: PortfolioPageData;
  initialTab: PortfolioTab;
  initialCollectionId?: string;
  initialProjectId?: string;
  hidePricing?: boolean;
  shareOnly?: boolean;
  hideAddProject?: boolean;
  projectBasePath?: string;
}

export function PortfolioProfileCard(props: PortfolioProfileCardProps) {
  return <PortfolioPage {...props} />;
}
