import { SiteView } from "../types/site.types";

const SITE_VIEW_SLUGS: Record<SiteView, string> = {
  overview: "overview",
  daily_logs: "daily-logs",
  inspections: "inspections",
  issues: "issues",
  attendance: "attendance",
};

const SLUG_TO_SITE_VIEW = Object.entries(SITE_VIEW_SLUGS).reduce<
  Record<string, SiteView>
>((result, [view, slug]) => {
  result[slug] = view as SiteView;
  return result;
}, {});

export function parseSiteView(value: string | null): SiteView | null {
  if (!value) return null;
  if (value === "daily_logs") return "daily_logs";
  return SLUG_TO_SITE_VIEW[value] || null;
}

export function createSiteViewUrl(
  currentUrl: string,
  view: SiteView,
): string {
  const url = new URL(currentUrl);
  url.searchParams.set("tab", "site");
  url.searchParams.set("siteView", SITE_VIEW_SLUGS[view]);
  return `${url.pathname}${url.search}`;
}
