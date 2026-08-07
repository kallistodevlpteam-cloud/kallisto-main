import React from "react";
import { Terminal } from "lucide-react";

interface DeveloperFloatingButtonProps {
  onClick: () => void;
  blockerCount: number;
  warningCount: number | string;
  hasFailedCriticalCheck: boolean;
  isMissing: boolean;
}

export function DeveloperFloatingButton({
  onClick,
  blockerCount,
  warningCount,
  hasFailedCriticalCheck,
  isMissing,
}: DeveloperFloatingButtonProps) {
  let badgeClass = "badge-green";
  let badgeText = "✓";

  if (isMissing || blockerCount > 0 || hasFailedCriticalCheck) {
    badgeClass = "badge-red";
    badgeText = isMissing ? "!" : String(blockerCount);
  } else if (typeof warningCount === "number" && warningCount > 0) {
    badgeClass = "badge-amber";
    badgeText = String(warningCount);
  }

  return (
    <div className="dev-console-button-wrap">
      <button
        className="dev-console-floating-btn"
        onClick={onClick}
        type="button"
        aria-label="Open developer readiness console"
        title="Developer readiness"
      >
        <Terminal size={22} />
        <span className={`dev-console-badge ${badgeClass}`}>
          {badgeText}
        </span>
      </button>
    </div>
  );
}
