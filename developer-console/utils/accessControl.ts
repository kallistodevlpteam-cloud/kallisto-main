import { Environment } from "../types/developerConsole.types";

export function canAccessDeveloperConsole(
  user: { role: string } | null,
  environment: Environment,
  featureFlags: { developerConsoleEnabled?: boolean },
  routeIsSupported: boolean
): boolean {
  const hasConsoleFlag = !!featureFlags?.developerConsoleEnabled;
  const trustedRoles = ["developer", "super_admin", "qa"];
  const isAuthorizedRole = user ? trustedRoles.includes(user.role) : false;

  return !!(
    routeIsSupported &&
    isAuthorizedRole &&
    (environment !== "production" || hasConsoleFlag)
  );
}
