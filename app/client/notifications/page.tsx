import React, { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ClientNotificationsWorkspace } from "@/features/client/notifications/components/client-notifications-workspace";

export const metadata = {
  title: "Notifications | Kallisto Client Portal",
  description: "Track project enquiries, feasibility reviews, proposals, milestones and payment updates.",
};

export default function ClientNotificationsPage() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <div style={{ padding: "24px 32px" }}>
            <div style={{ height: "24px", width: "160px", background: "#f1f5f9", borderRadius: "6px" }} />
          </div>
        }
      >
        <ClientNotificationsWorkspace />
      </Suspense>
    </AppShell>
  );
}
