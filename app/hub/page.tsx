import { Suspense } from "react";

import { AppShell } from "@/components/layout/app-shell";
import {
  HubWorkspace,
  HubWorkspaceSkeleton,
} from "@/features/hub/components/hub-workspace";

export default function HubPage() {
  return (
    <AppShell>
      <Suspense fallback={<HubWorkspaceSkeleton />}>
        <HubWorkspace />
      </Suspense>
    </AppShell>
  );
}
