import { PageReadinessManifest } from "../types/developerConsole.types";
import { virtualOfficeManifest } from "./virtualOffice.manifest";

export const manifests: PageReadinessManifest[] = [
  virtualOfficeManifest,
];

export function resolveManifestByPathname(pathname: string): PageReadinessManifest | null {
  for (const manifest of manifests) {
    if (manifest.routePattern.test(pathname)) {
      return manifest;
    }
  }
  return null;
}
