import { Suspense } from "react";
import { HandsOverview } from "@/features/hands";

export default function HandsOverviewPage() {
  return (
    <Suspense
      fallback={
        <div className="workspace-container">
          <div
            className="route-state-box route-state-loading"
            aria-label="Loading Hands workspace"
          >
            <div className="skeleton-bar skeleton-title" />
            <div className="skeleton-bar skeleton-subtitle" />
          </div>
        </div>
      }
    >
      <HandsOverview />
    </Suspense>
  );
}
