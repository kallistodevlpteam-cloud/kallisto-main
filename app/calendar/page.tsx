import React, { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { CalendarWorkspacePage } from "@/features/calendar/components/calendar-workspace-page";

export default function CalendarPage() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="workspace-container">
            <div className="route-state-box route-state-loading" aria-label="Loading calendar workspace">
              <div className="skeleton-bar skeleton-title" />
              <div className="skeleton-bar skeleton-subtitle" />
            </div>
          </div>
        }
      >
        <CalendarWorkspacePage />
      </Suspense>
    </AppShell>
  );
}
