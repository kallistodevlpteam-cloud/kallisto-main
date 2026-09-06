import React, { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ClientProjectsWorkspace } from "@/features/client/components/client-projects-workspace";

export default function ClientProjectsPage() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <div style={{ padding: "24px 32px" }}>
            <div style={{ height: "24px", width: "160px", background: "#f1f5f9", borderRadius: "6px" }} />
          </div>
        }
      >
        <ClientProjectsWorkspace />
      </Suspense>
    </AppShell>
  );
}
