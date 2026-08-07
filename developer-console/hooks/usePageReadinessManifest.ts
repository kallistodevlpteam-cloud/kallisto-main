import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PageReadinessManifest } from "../types/developerConsole.types";
import { resolveManifestByPathname } from "../registry";
import { isServiceProviderVirtualOfficeRoute } from "../utils/routeScope";

export function usePageReadinessManifest() {
  const pathname = usePathname();
  const [manifest, setManifest] = useState<PageReadinessManifest | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isMissing, setIsMissing] = useState(false);

  useEffect(() => {
    const supported = isServiceProviderVirtualOfficeRoute(pathname);
    setIsSupported(supported);

    if (supported) {
      const resolved = resolveManifestByPathname(pathname);
      if (resolved) {
        setManifest(resolved);
        setIsMissing(false);
      } else {
        setManifest(null);
        setIsMissing(true);
      }
    } else {
      setManifest(null);
      setIsMissing(false);
    }
  }, [pathname]);

  return { manifest, isSupported, isMissing, pathname };
}
