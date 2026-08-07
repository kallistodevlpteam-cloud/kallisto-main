"use client";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  Download,
  FileCheck,
  History,
  Lock,
  MessageSquare,
  RefreshCw,
  Send,
  Share2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  StudioAuditEvent,
  StudioOutputVersion,
  StudioTask,
  StudioValidationIssue,
} from "@/types/domain/studio";
import { StudioMockRepository } from "@/services/repositories/studio-mock-repository";
import { StudioService } from "@/services/studio/studio-service";
import { BOQWorkspace } from "./boq-workspace";
import { EstimateWorkspace } from "./estimate-workspace";
import { ProposalWorkspace } from "./proposal-workspace";
import { SpecificationReportWorkspace } from "./specification-report-workspace";

import styles from "./studio-workspace.module.css";
import { VisualisationWorkspace } from "./visualisation-workspace";

export interface StudioWorkspaceShellProps {
  taskId: string;
  initialTask?: StudioTask;
  initialVersion?: StudioOutputVersion;
}

const repository = new StudioMockRepository();
const studioService = new StudioService(repository);

export function StudioWorkspaceShell({
  taskId,
  initialTask,
  initialVersion,
}: StudioWorkspaceShellProps) {
  const [task, setTask] = useState<StudioTask | null>(initialTask || null);
  const [version, setVersion] = useState<StudioOutputVersion | null>(initialVersion || null);
  const [allVersions, setAllVersions] = useState<StudioOutputVersion[]>([]);
  const [activeTab, setActiveTab] = useState<"editor" | "validation" | "revisions" | "activity">("editor");
  const [validationIssues, setValidationIssues] = useState<StudioValidationIssue[]>([]);
  const [auditEvents, setAuditEvents] = useState<StudioAuditEvent[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userRole] = useState("lead_architect");
  const [userId] = useState("usr-architect-01");
  const [userName] = useState("Lead Architect");
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadData = async () => {
    const loadedTask = await repository.getTaskById(taskId);
    if (loadedTask) {
      setTask(loadedTask);
      const latestVer = await repository.getLatestTaskVersion(taskId);
      setVersion(latestVer);
      const vers = await repository.getAllTaskVersions(taskId);
      setAllVersions(vers);
      const issues = await studioService.validateTask(taskId);
      setValidationIssues(issues);
      const events = await repository.getAuditEvents(taskId);
      setAuditEvents(events);
    }
  };

  useEffect(() => {
    loadData();
  }, [taskId]);

  if (!task || !version) {
    return (
      <div className={styles.loadingContainer}>
        <RefreshCw size={24} className={styles.spinner} />
        <p>Loading Studio Production Workspace...</p>
      </div>
    );
  }

  const isApprovedOrPublished = task.status === "approved" || task.status === "published";

  const handleTransition = async (targetStatus: any) => {
    setIsProcessing(true);
    setActionMessage(null);
    try {
      const updatedTask = await studioService.transitionTaskStatus(
        task.id,
        targetStatus,
        userId,
        userRole,
        userName
      );
      setTask({ ...updatedTask });
      setActionMessage(`Task status updated to '${targetStatus}'.`);
      await loadData();
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateRevision = async () => {
    setIsProcessing(true);
    setActionMessage(null);
    try {
      const newVer = await studioService.createNewRevision(task.id, userId, userRole, userName);
      setActionMessage(`Spawned new revision ${newVer.versionLabel}.`);
      await loadData();
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePublish = async () => {
    setIsProcessing(true);
    setActionMessage(null);
    try {
      const pubRecord = await studioService.publishTaskOutput(
        task.id,
        userId,
        userRole,
        userName,
        `idemp-pub-${Date.now()}`
      );
      setActionMessage(`Published document to project: ${pubRecord.documentRef}`);
      await loadData();
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const statusBadgeClassMap: Record<string, string> = {
    draft: styles.statusDraft,
    review_required: styles.statusReview,
    approved: styles.statusApproved,
    published: styles.statusPublished,
    changes_requested: styles.statusChanges,
  };

  return (
    <div className={styles.workspaceShell}>
      {/* Shell Top Header Bar */}
      <div className={styles.shellHeader}>
        <div className={styles.shellHeaderLeft}>
          <Link href="/studio" className={styles.backLink}>
            <ArrowLeft size={16} />
            <span>Studio</span>
          </Link>
          <div className={styles.headerDivider} />
          <div>
            <div className={styles.titleRow}>
              <h1 className={styles.taskTitle}>
                {task.projectName} &bull; {task.useCase.replace(/_/g, " ").toUpperCase()}
              </h1>
              <span className={styles.versionTag}>{version.versionLabel}</span>
              <span className={`${styles.statusPill} ${statusBadgeClassMap[task.status] || styles.statusDraft}`}>
                {task.status.replace(/_/g, " ").toUpperCase()}
              </span>
            </div>
            <p className={styles.taskMeta}>
              Project Code: <strong>{task.projectCode}</strong> &bull; Created by: {task.ownerName} &bull; Start Method: {task.startMethod}
            </p>
          </div>
        </div>

        {/* Action Bar Buttons */}
        <div className={styles.shellHeaderRight}>
          <span className={styles.autosaveText}>
            <CheckCircle size={14} className={styles.greenCheck} /> Autosaved
          </span>

          {task.status === "draft" && (
            <button
              type="button"
              className={styles.actionBtnSecondary}
              onClick={() => handleTransition("review_required")}
              disabled={isProcessing}
            >
              <Send size={15} />
              Submit for Review
            </button>
          )}

          {task.status === "review_required" && (
            <>
              <button
                type="button"
                className={styles.actionBtnSecondary}
                onClick={() => handleTransition("changes_requested")}
                disabled={isProcessing}
              >
                Request Changes
              </button>
              <button
                type="button"
                className={styles.actionBtnPrimary}
                onClick={() => handleTransition("approved")}
                disabled={isProcessing}
              >
                <CheckCircle size={15} />
                Approve
              </button>
            </>
          )}

          {task.status === "approved" && (
            <button
              type="button"
              className={styles.actionBtnPrimary}
              onClick={handlePublish}
              disabled={isProcessing}
            >
              <FileCheck size={15} />
              Publish to Project
            </button>
          )}

          {isApprovedOrPublished && (
            <button
              type="button"
              className={styles.actionBtnSecondary}
              onClick={handleCreateRevision}
              disabled={isProcessing}
            >
              <RefreshCw size={15} />
              Create Revision (V{String(version.versionNumber + 1).padStart(2, "0")})
            </button>
          )}
        </div>
      </div>

      {actionMessage && (
        <div className={styles.actionBanner}>
          <Sparkles size={16} />
          <span>{actionMessage}</span>
        </div>
      )}

      {isApprovedOrPublished && (
        <div className={styles.immutableBanner}>
          <Lock size={16} />
          <span>
            Version {version.versionLabel} is {task.status.toUpperCase()} and immutable. To modify values, click &quot;Create Revision&quot;.
          </span>
        </div>
      )}

      {/* Tabs Row */}
      <div className={styles.tabNavBar}>
        <button
          type="button"
          className={`${styles.tabItem} ${activeTab === "editor" ? styles.tabItemActive : ""}`}
          onClick={() => setActiveTab("editor")}
        >
          Workspace Editor
        </button>
        <button
          type="button"
          className={`${styles.tabItem} ${activeTab === "validation" ? styles.tabItemActive : ""}`}
          onClick={() => setActiveTab("validation")}
        >
          Validation Checks ({validationIssues.length})
        </button>
        <button
          type="button"
          className={`${styles.tabItem} ${activeTab === "revisions" ? styles.tabItemActive : ""}`}
          onClick={() => setActiveTab("revisions")}
        >
          Revision History ({allVersions.length})
        </button>
        <button
          type="button"
          className={`${styles.tabItem} ${activeTab === "activity" ? styles.tabItemActive : ""}`}
          onClick={() => setActiveTab("activity")}
        >
          Audit Log ({auditEvents.length})
        </button>
      </div>

      {/* Main Tab Content */}
      <div className={styles.shellBody}>
        {activeTab === "editor" ? (
          <>
            {task.workspaceType === "boq" && (
              <BOQWorkspace task={task} version={version} readOnly={isApprovedOrPublished} />
            )}
            {task.workspaceType === "estimate" && (
              <EstimateWorkspace task={task} version={version} readOnly={isApprovedOrPublished} />
            )}
            {task.workspaceType === "visualisation" && (
              <VisualisationWorkspace task={task} version={version} readOnly={isApprovedOrPublished} />
            )}
            {task.workspaceType === "proposal" && (
              <ProposalWorkspace task={task} version={version} readOnly={isApprovedOrPublished} />
            )}
            {task.workspaceType === "specification_report" && (
              <SpecificationReportWorkspace task={task} version={version} readOnly={isApprovedOrPublished} />
            )}
          </>
        ) : activeTab === "validation" ? (
          <div className={styles.validationCardList}>
            <h3 className={styles.sectionHeading}>Workflow Validation &amp; Quality Checks</h3>
            {validationIssues.length === 0 ? (
              <div className={styles.emptyValBox}>
                <CheckCircle size={20} className={styles.greenCheck} />
                <p>Zero validation errors detected. Output is compliant and ready for review.</p>
              </div>
            ) : (
              validationIssues.map((issue) => (
                <div key={issue.id} className={styles.issueItemCard}>
                  <AlertCircle size={18} className={styles.warnIcon} />
                  <div>
                    <h4 className={styles.issueTitle}>{issue.code}: {issue.message}</h4>
                    {issue.field && <p className={styles.issueField}>Field: {issue.field}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : activeTab === "revisions" ? (
          <div className={styles.revisionsList}>
            <h3 className={styles.sectionHeading}>Version Revision Audit History</h3>
            {allVersions.map((v) => (
              <div key={v.id} className={styles.versionHistoryCard}>
                <div className={styles.verHeaderRow}>
                  <span className={styles.verLabelPill}>{v.versionLabel}</span>
                  <span className={styles.verDateText}>{new Date(v.createdAt).toLocaleString()}</span>
                </div>
                <p className={styles.verAuthorText}>Created by: User {v.createdByUserId}</p>
                {v.publishRecord && (
                  <p className={styles.pubRecordText}>
                    Published to project on {new Date(v.publishRecord.publishedAt).toLocaleDateString()} (Ref: {v.publishRecord.documentRef})
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.auditLogList}>
            <h3 className={styles.sectionHeading}>System Audit Trail</h3>
            {auditEvents.map((evt) => (
              <div key={evt.id} className={styles.auditEventCard}>
                <Clock size={16} className={styles.clockIcon} />
                <div>
                  <h5 className={styles.auditActionTitle}>{evt.action} &bull; {evt.actorName}</h5>
                  <p className={styles.auditDetails}>{evt.details}</p>
                  <span className={styles.auditTime}>{new Date(evt.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
