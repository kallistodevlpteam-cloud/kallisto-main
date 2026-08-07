"use client";

import {
  AlertTriangle,
  FolderPlus,
  RefreshCw,
  Share2,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import React, { useState } from "react";

export interface RoutePageContainerProps {
  title: string;
  variant?: "default" | "studio";
  className?: string;
  containerClassName?: string;
  description?: string;
  /** Rich React node rendered directly below the h1 — use instead of description for structured metadata. */
  descriptionContent?: React.ReactNode;
  category?: string;
  primaryActionLabel?: string;
  primaryActionIcon?: LucideIcon;
  onPrimaryAction?: () => void;
  showShareAction?: boolean;
  /** Optional custom content rendered in the center of the title row. */
  titleCenterContent?: React.ReactNode;
  /** Optional custom content rendered in the left side of the title row. */
  titleRowContent?: React.ReactNode;
  /** Optional custom content rendered in the right side of the title row. */
  titleRightContent?: React.ReactNode;
  showHeading?: boolean;
  children?: React.ReactNode;
}

export type ViewState = "success" | "loading" | "empty" | "error" | "forbidden";

export function RoutePageContainer({
  title,
  variant = "default",
  className,
  containerClassName,
  description,
  descriptionContent,
  category,
  primaryActionLabel,
  primaryActionIcon: PrimaryActionIcon = FolderPlus,
  onPrimaryAction,
  showShareAction = true,
  titleCenterContent,
  titleRowContent,
  titleRightContent,
  showHeading = true,
  children,
}: RoutePageContainerProps) {
  const [viewState, setViewState] = useState<ViewState>("success");

  const resolvedContainerClass =
    variant === "studio"
      ? `workspace-container studio-page-container${containerClassName ? ` ${containerClassName}` : ""}`
      : `workspace-container${containerClassName ? ` ${containerClassName}` : ""}`;

  return (
    <div className={`${resolvedContainerClass}${className ? ` ${className}` : ""}`}>
      {/* Top Page Heading */}
      {showHeading ? <div className="page-heading">
        <div className="page-heading-left">
          <div className="page-heading-title">
            {category ? <p className="eyebrow">{category}</p> : null}
            <div className="title-with-share">
              <h1>{title}</h1>
              {showShareAction ? (
                <button
                  type="button"
                  className="title-share-btn"
                  aria-label={`Share ${title}`}
                  title={`Share ${title}`}
                >
                  <Share2 size={16} strokeWidth={1.8} />
                </button>
              ) : null}
            </div>
            {descriptionContent ?? (description ? <p className="heading-note">{description}</p> : null)}
          </div>

          {titleCenterContent && (
            <div className="page-heading-center">
              {titleCenterContent}
            </div>
          )}

          {titleRowContent
            ? titleRowContent
            : primaryActionLabel && (
                <button className="primary-action" type="button" onClick={onPrimaryAction}>
                  <PrimaryActionIcon size={16} />
                  <span>{primaryActionLabel}</span>
                </button>
              )}
        </div>

        {titleRightContent && (
          <div className="page-heading-right">
            {titleRightContent}
          </div>
        )}
      </div> : null}



      {/* Dynamic View State Render */}
      {viewState === "loading" && (
        <div className="route-state-box route-state-loading" aria-label="Loading state">
          <div className="skeleton-bar skeleton-title" />
          <div className="skeleton-bar skeleton-subtitle" />
          <div className="skeleton-grid">
            <div className="skeleton-card" />
            <div className="skeleton-card" />
            <div className="skeleton-card" />
          </div>
        </div>
      )}

      {viewState === "empty" && (
        <div className="route-state-box route-state-empty" aria-label="Empty state">
          <div className="empty-state-icon">
            <FolderPlus size={32} strokeWidth={1.5} />
          </div>
          <h3>No {title.toLowerCase()} records found</h3>
          <p>You haven&apos;t added or created any items in {title} yet. Get started by creating your first record.</p>
          {primaryActionLabel && (
            <button className="primary-action-btn" type="button" onClick={onPrimaryAction}>
              <span>{primaryActionLabel}</span>
            </button>
          )}
        </div>
      )}

      {viewState === "error" && (
        <div className="route-state-box route-state-error" aria-label="Error state">
          <div className="error-state-icon">
            <AlertTriangle size={32} strokeWidth={1.5} />
          </div>
          <h3>Failed to load {title}</h3>
          <p>We encountered an unexpected network or service error while retrieving your data.</p>
          <button className="retry-action-btn" type="button" onClick={() => setViewState("success")}>
            <RefreshCw size={14} />
            <span>Retry request</span>
          </button>
        </div>
      )}

      {viewState === "forbidden" && (
        <div className="route-state-box route-state-forbidden" aria-label="Permission denied state">
          <div className="forbidden-state-icon">
            <ShieldAlert size={32} strokeWidth={1.5} />
          </div>
          <h3>Access Denied</h3>
          <p>Your service provider account does not have permission to access {title}.</p>
          <button className="request-access-btn" type="button">
            <span>Request authorization</span>
          </button>
        </div>
      )}

      {viewState === "success" && children ? (
        <div className="route-content-wrap">{children}</div>
      ) : null}
    </div>
  );
}
