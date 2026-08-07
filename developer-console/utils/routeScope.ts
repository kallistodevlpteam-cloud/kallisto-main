export const supportedRoutePatterns = [
  /^\/$/,
  /^\/home(?:\/.*)?$/,
  /^\/enquiries(?:\/.*)?$/,
  /^\/projects(?:\/.*)?$/,
  /^\/clients(?:\/.*)?$/,
  /^\/calendar(?:\/.*)?$/,
  /^\/team(?:\/.*)?$/,
  /^\/documents(?:\/.*)?$/,
  /^\/payments(?:\/.*)?$/,
  /^\/analytics(?:\/.*)?$/,
  /^\/public-profile(?:\/.*)?$/,
  /^\/portfolio(?:\/.*)?$/,
  /^\/tools(?:\/.*)?$/,
  /^\/virtual-office(?:\/.*)?$/,
];

export function isServiceProviderVirtualOfficeRoute(pathname: string): boolean {
  return supportedRoutePatterns.some((pattern) => pattern.test(pathname));
}

const ROUTE_TITLE_MAP: Record<string, string> = {
  "/": "Home Overview",
  "/home": "Home Workspace",
  "/enquiries": "Enquiries Workspace",
  "/projects": "Projects Workspace",
  "/clients": "Clients Workspace",
  "/calendar": "Calendar Workspace",
  "/team": "Team Workspace",
  "/documents": "Documents Workspace",
  "/payments": "Payments Workspace",
  "/analytics": "Analytics Workspace",
  "/public-profile": "Public Profile Workspace",
  "/portfolio": "Portfolio Workspace",
  "/tools": "More Tools Workspace",
  "/virtual-office": "Virtual Office Overview",
};

export function getRouteTitle(pathname: string): string {
  for (const key of Object.keys(ROUTE_TITLE_MAP)) {
    if (pathname === key || pathname.startsWith(key + "/")) {
      return ROUTE_TITLE_MAP[key];
    }
  }
  return "Unknown Page";
}
