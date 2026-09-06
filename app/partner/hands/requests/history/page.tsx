import { Suspense } from "react";
import { RequestHistoryWorkspace } from "@/features/hands";

export default function PartnerHandsRequestHistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="workspace-container">
          <div
            className="route-state-box route-state-loading"
            aria-label="Loading Request History workspace"
          >
            <div className="skeleton-bar skeleton-title" />
            <div className="skeleton-bar skeleton-subtitle" />
          </div>
        </div>
      }
    >
      <RequestHistoryWorkspace />
    </Suspense>
  );
}
