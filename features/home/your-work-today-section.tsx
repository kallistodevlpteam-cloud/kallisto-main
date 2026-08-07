"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  FileText,
  MoreVertical,
  Send,
  Sparkles,
} from "lucide-react";
import { PriorityPreview, RecentWorkItem } from "@/types/domain/home";
import { useOdin } from "@/hooks/use-odin";
import styles from "./home-workspace.module.css";

export interface YourWorkTodaySectionProps {
  needsAttentionItems: PriorityPreview[];
  recentWorkItems: RecentWorkItem[];
}

export type WorkTodayTab = "needs-attention" | "continue-working" | "ask-odin";

export function YourWorkTodaySection({
  needsAttentionItems,
  recentWorkItems,
}: YourWorkTodaySectionProps) {
  const [activeTab, setActiveTab] = useState<WorkTodayTab>("needs-attention");
  const [odinInput, setOdinInput] = useState("");
  const { openOdin } = useOdin();

  const handleAskOdinPrompt = (prompt: string) => {
    openOdin({
      prompt,
      context: {
        route: "/home",
        workspaceId: "ws-default",
        source: "home-your-work-today",
      },
    });
  };

  const handleOdinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!odinInput.trim()) return;
    handleAskOdinPrompt(odinInput.trim());
    setOdinInput("");
  };

  // Display all Needs Attention priorities and recent work items
  const visibleNeedsAttention = needsAttentionItems;
  const visibleRecentWork = recentWorkItems.slice(0, 5);

  return (
    <section className={styles.sectionContainerDominant}>
      <div className={styles.sectionHeaderRow}>
        <div>
          <h2 className={styles.sectionTitleDominant}>Your Work Today</h2>
          <p className={styles.sectionSubtitle}>
            Resolve priorities, continue recent operational work or query Odin for next steps.
          </p>
        </div>
        <Link href="/projects" className={styles.headerActionLink}>
          <span>View all priorities</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Workspace Card Container */}
      <div className={styles.workTodayCardContainer}>
        {/* Tab Header Bar */}
        <div className={styles.cardTabHeader}>
          <div className={styles.tabList} role="tablist" aria-label="Your work today views">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "needs-attention"}
              aria-controls="panel-needs-attention"
              id="tab-needs-attention"
              className={`${styles.tabBtn}${activeTab === "needs-attention" ? ` ${styles.tabBtnActive}` : ""}`}
              onClick={() => setActiveTab("needs-attention")}
            >
              Needs attention ({visibleNeedsAttention.length})
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "continue-working"}
              aria-controls="panel-continue-working"
              id="tab-continue-working"
              className={`${styles.tabBtn}${activeTab === "continue-working" ? ` ${styles.tabBtnActive}` : ""}`}
              onClick={() => setActiveTab("continue-working")}
            >
              Continue working ({visibleRecentWork.length})
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "ask-odin"}
              aria-controls="panel-ask-odin"
              id="tab-ask-odin"
              className={`${styles.tabBtn}${activeTab === "ask-odin" ? ` ${styles.tabBtnActive}` : ""}`}
              onClick={() => setActiveTab("ask-odin")}
            >
              <Sparkles size={14} className={styles.sparkleIcon} />
              <span>Ask Odin</span>
            </button>
          </div>
        </div>

        {/* TAB 1: NEEDS ATTENTION */}
        {activeTab === "needs-attention" && (
          <div
            id="panel-needs-attention"
            className={styles.tabPanel}
            role="tabpanel"
            aria-labelledby="tab-needs-attention"
          >
            {visibleNeedsAttention.length === 0 ? (
              <div className={styles.emptyStateBox}>
                <p>You’re clear for now. No urgent actions require your attention.</p>
              </div>
            ) : (
              <div className={styles.rowsList}>
                {visibleNeedsAttention.map((item) => {
                  let priorityDotClass = styles.priorityDotMedium;
                  let badgeClass = styles.statusNeutral;

                  if (item.priorityLevel === "critical") {
                    priorityDotClass = styles.priorityDotCritical;
                    badgeClass = styles.statusOverdue;
                  } else if (item.priorityLevel === "high") {
                    priorityDotClass = styles.priorityDotHigh;
                    badgeClass = styles.statusDueToday;
                  }

                  return (
                    <div key={item.id} className={styles.priorityRow}>
                      {/* Priority Dot Indicator (Restrained) */}
                      <div className={styles.priorityIndicatorCell}>
                        <span className={`${styles.priorityDot} ${priorityDotClass}`} title={`Priority: ${item.priorityLevel}`} />
                      </div>

                      {/* Content Stack */}
                      <div className={styles.rowMainCell}>
                        <div className={styles.rowTitleLine}>
                          <strong className={styles.itemTitle}>{item.tag}</strong>
                          <span className={styles.rowDot}>·</span>
                          <span className={styles.projectContext}>{item.projectName}</span>
                        </div>
                        {item.subtitle && <p className={styles.rowSubtitle}>{item.subtitle}</p>}
                      </div>

                      {/* Meta Context & Responsible Person */}
                      <div className={styles.rowMetaCell}>
                        {item.dueText && <span className={`${styles.statusPill} ${badgeClass}`}>{item.dueText}</span>}
                        {item.assignedTo && <span className={styles.ownerText}>{item.assignedTo}</span>}
                      </div>

                      {/* Primary Action Button */}
                      <div className={styles.rowActionCell}>
                        {item.destination.availability === "available" ? (
                          <Link href={item.destination.route} className={styles.btnActionPrimary}>
                            <span>{item.actionLabel}</span>
                          </Link>
                        ) : (
                          <button type="button" className={styles.btnActionPrimary} disabled>
                            <span>{item.actionLabel}</span>
                          </button>
                        )}
                        <button type="button" className={styles.btnOverflowMenu} aria-label="More options">
                          <MoreVertical size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CONTINUE WORKING */}
        {activeTab === "continue-working" && (
          <div
            id="panel-continue-working"
            className={styles.tabPanel}
            role="tabpanel"
            aria-labelledby="tab-continue-working"
          >
            {visibleRecentWork.length === 0 ? (
              <div className={styles.emptyStateBox}>
                <p>No recent operational documents or drafts found.</p>
              </div>
            ) : (
              <div className={styles.rowsList}>
                {visibleRecentWork.map((item) => (
                  <div key={item.id} className={styles.priorityRow}>
                    <div className={styles.rowIconCell}>
                      <FileText size={16} className={styles.iconBlue} />
                    </div>

                    <div className={styles.rowMainCell}>
                      <div className={styles.rowTitleLine}>
                        <span className={styles.categoryTag}>{item.category}</span>
                        <span className={styles.rowDot}>·</span>
                        <strong className={styles.itemTitle}>{item.subTitle}</strong>
                        <span className={styles.rowDot}>·</span>
                        <span className={styles.projectContext}>{item.projectName}</span>
                      </div>
                      <p className={styles.rowSubtitle}>
                        {item.status} · <small>{item.updatedAt}</small>
                      </p>
                    </div>

                    <div className={styles.rowActionCell}>
                      {item.destination.availability === "available" ? (
                        <Link href={item.destination.route} className={styles.btnActionPrimary}>
                          <span>{item.actionLabel}</span>
                        </Link>
                      ) : (
                        <button type="button" className={styles.btnActionPrimary} disabled>
                          <span>{item.actionLabel}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ASK ODIN */}
        {activeTab === "ask-odin" && (
          <div
            id="panel-ask-odin"
            className={styles.tabPanel}
            role="tabpanel"
            aria-labelledby="tab-ask-odin"
          >
            <div className={styles.odinPanelWrap}>
              <form onSubmit={handleOdinSubmit} className={styles.odinInputBox}>
                <input
                  type="text"
                  className={styles.odinInput}
                  placeholder="Ask Odin about project risks, site visits, or today's priorities..."
                  value={odinInput}
                  onChange={(e) => setOdinInput(e.target.value)}
                />
                <button type="submit" className={styles.odinSubmitBtn} aria-label="Submit query to Odin">
                  <Send size={15} />
                </button>
              </form>

              <div className={styles.suggestedPromptsRow}>
                <span className={styles.suggestedLabel}>Suggested:</span>
                <button
                  type="button"
                  className={styles.promptChip}
                  onClick={() => handleAskOdinPrompt("Summarise today")}
                >
                  Summarise today
                </button>
                <button
                  type="button"
                  className={styles.promptChip}
                  onClick={() => handleAskOdinPrompt("Show projects at risk")}
                >
                  Show projects at risk
                </button>
                <button
                  type="button"
                  className={styles.promptChip}
                  onClick={() => handleAskOdinPrompt("What requires my approval?")}
                >
                  What requires my approval?
                </button>
                <button
                  type="button"
                  className={styles.promptChip}
                  onClick={() => handleAskOdinPrompt("Draft a client update")}
                >
                  Draft a client update
                </button>
                <button
                  type="button"
                  className={styles.promptChip}
                  onClick={() => handleAskOdinPrompt("Prepare tomorrow’s site plan")}
                >
                  Prepare tomorrow’s site plan
                </button>
                <button
                  type="button"
                  className={styles.promptChip}
                  onClick={() => handleAskOdinPrompt("Identify overdue commitments")}
                >
                  Identify overdue commitments
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
