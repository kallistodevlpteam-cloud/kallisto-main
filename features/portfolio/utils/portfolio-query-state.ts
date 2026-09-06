import type { PortfolioTab } from "@/features/portfolio/types/portfolio.types";

const OWNER_TABS: PortfolioTab[] = [
  "projects",
  "case-studies",
  "tagged",
  "reviews",
  "pricing",
];

const PUBLIC_TABS: PortfolioTab[] = [
  "projects",
  "case-studies",
  "tagged",
  "reviews",
  "pricing",
];

export function getPortfolioTabs(isOwner: boolean): PortfolioTab[] {
  return isOwner ? OWNER_TABS : PUBLIC_TABS;
}

export function parsePortfolioTab(
  value: string | null | undefined,
  isOwner: boolean,
): PortfolioTab {
  const allowedTabs = getPortfolioTabs(isOwner);
  return allowedTabs.includes(value as PortfolioTab)
    ? (value as PortfolioTab)
    : "projects";
}

export function buildPortfolioQuery(
  currentParams: URLSearchParams,
  tab: PortfolioTab,
): string {
  const params = new URLSearchParams(currentParams);
  params.set("portfolioTab", tab);
  params.delete("project");
  return params.toString();
}
