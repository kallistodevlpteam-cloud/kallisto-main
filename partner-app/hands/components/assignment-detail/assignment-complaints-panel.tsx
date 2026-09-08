"use client";

import React, { useState } from "react";
import { 
  CheckCircle2, 
  Clock, 
  Check,
  MessageSquare,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { 
  AssignmentComplaint, 
  ComplaintNote,
  ComplaintSeverity, 
  ComplaintStatus 
} from "../../types/assignment-domain";
import styles from "./assignment-detail.module.css";

interface AssignmentComplaintsPanelProps {
  assignmentId?: string;
  projectName?: string;
  supervisorName?: string;
  initialComplaints?: AssignmentComplaint[];
}

export function AssignmentComplaintsPanel({
  assignmentId: _assignmentId,
  projectName: _projectName,
  supervisorName: _supervisorName,
  initialComplaints = [],
}: AssignmentComplaintsPanelProps) {
  const [complaints, setComplaints] = useState<AssignmentComplaint[]>(initialComplaints);
  const [filterStatus, setFilterStatus] = useState<"all" | ComplaintStatus>("all");
  const [filterRaiser, setFilterRaiser] = useState<"all" | "supervisor" | "provider">("all");
  const [activeNoteComplaintId, setActiveNoteComplaintId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  const toggleCommentsExpanded = (complaintId: string) => {
    setExpandedComments((prev) => ({
      ...prev,
      [complaintId]: !prev[complaintId],
    }));
  };

  const raiserFiltered = complaints.filter((c) => {
    if (filterRaiser === "supervisor" && !c.raisedByRole?.toLowerCase().includes("supervisor")) return false;
    if (filterRaiser === "provider" && !c.raisedByRole?.toLowerCase().includes("provider")) return false;
    return true;
  });

  const openComplaintsCount = raiserFiltered.filter((c) => c.status === "open").length;
  const inReviewCount = raiserFiltered.filter((c) => c.status === "in_review").length;
  const resolvedCount = raiserFiltered.filter((c) => c.status === "resolved").length;

  const filteredComplaints = raiserFiltered.filter((c) => {
    if (filterStatus === "all") return true;
    return c.status === filterStatus;
  });

  const handleAddNote = (complaintId: string) => {
    if (!noteText.trim()) return;

    const newNote: ComplaintNote = {
      id: `note-${Date.now()}`,
      author: "You",
      authorRole: "Contractor",
      timestamp: "Just now",
      text: noteText.trim(),
    };

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          return {
            ...c,
            notes: [...(c.notes || []), newNote],
          };
        }
        return c;
      })
    );

    setExpandedComments((prev) => ({
      ...prev,
      [complaintId]: true,
    }));

    setNoteText("");
    setActiveNoteComplaintId(null);
  };


  const handleToggleResolve = (complaintId: string) => {
    if (activeNoteComplaintId === complaintId) {
      setActiveNoteComplaintId(null);
      setNoteText("");
    }
    setExpandedComments((prev) => ({
      ...prev,
      [complaintId]: true,
    }));
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          const isResolved = c.status === "resolved";
          const newStatus: ComplaintStatus = isResolved ? "open" : "resolved";
          return {
            ...c,
            status: newStatus,
            resolvedAt: newStatus === "resolved" ? "Just now" : undefined,
            resolutionNotes:
              newStatus === "resolved"
                ? c.resolutionNotes || "Action verified on site by project manager."
                : c.resolutionNotes,
          };
        }
        return c;
      })
    );
  };

  const handleToggleReview = (complaintId: string) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          const isInReview = c.status === "in_review";
          const newStatus: ComplaintStatus = isInReview ? "open" : "in_review";
          return {
            ...c,
            status: newStatus,
          };
        }
        return c;
      })
    );
  };

  const getSeverityBadge = (sev: ComplaintSeverity) => {
    switch (sev) {
      case "high":
        return <span className={styles.severityHigh}>High Severity</span>;
      case "medium":
        return <span className={styles.severityMedium}>Medium Severity</span>;
      case "low":
        return <span className={styles.severityLow}>Low Severity</span>;
    }
  };

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case "open":
        return <span className={styles.complaintStatusOpen}>● Open</span>;
      case "in_review":
        return <span className={styles.complaintStatusReview}>⏳ In Review</span>;
      case "resolved":
        return <span className={styles.complaintStatusResolved}>✓ Resolved</span>;
    }
  };

  return (
    <div className={styles.complaintsContent}>
      {/* Top Action Bar */}
      <div className={styles.complaintsActionBar} style={{ flexDirection: "column", alignItems: "stretch", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
          {/* Heading + Count Badges */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#0f172a" }}>
              Site Complaints & Impediments
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 650,
                  color: "#dc2626",
                  backgroundColor: "#fef2f2",
                  padding: "2px 8px",
                  borderRadius: "9999px",
                }}
              >
                {openComplaintsCount} Open
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 650,
                  color: "#d97706",
                  backgroundColor: "#fffbeb",
                  padding: "2px 8px",
                  borderRadius: "9999px",
                }}
              >
                {inReviewCount} In Review
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 650,
                  color: "#059669",
                  backgroundColor: "#ecfdf5",
                  padding: "2px 8px",
                  borderRadius: "9999px",
                }}
              >
                {resolvedCount} Resolved
              </span>
            </div>
          </div>

          {/* Filter by Status */}
          <div style={{ display: "flex", gap: "4px" }}>
            {(["all", "open", "in_review", "resolved"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                style={{
                  fontSize: "11px",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  border: "1px solid",
                  borderColor: filterStatus === st ? "#2563eb" : "#e2e8f0",
                  backgroundColor: filterStatus === st ? "#eff6ff" : "#ffffff",
                  color: filterStatus === st ? "#2563eb" : "#64748b",
                  fontWeight: filterStatus === st ? 700 : 500,
                  cursor: "pointer",
                  textTransform: "capitalize",
                  transition: "all 0.15s ease",
                }}
              >
                {st === "all" ? "All" : st.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom of the heading: Filter by Raiser */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "11px", fontWeight: 650, color: "#64748b" }}>Raised By:</span>
          <div style={{ display: "flex", gap: "4px" }}>
            {[
              { id: "all", label: "All" },
              { id: "supervisor", label: "Site Supervisor" },
              { id: "provider", label: "Provider" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilterRaiser(item.id as "all" | "supervisor" | "provider")}
                style={{
                  fontSize: "11px",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  border: "1px solid",
                  borderColor: filterRaiser === item.id ? "#0f172a" : "#e2e8f0",
                  backgroundColor: filterRaiser === item.id ? "#0f172a" : "#ffffff",
                  color: filterRaiser === item.id ? "#ffffff" : "#64748b",
                  fontWeight: filterRaiser === item.id ? 700 : 500,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Complaints List */}
      <div className={styles.complaintsList}>
        {filteredComplaints.length === 0 ? (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              backgroundColor: "#ffffff",
              border: "1px dashed #cbd5e1",
              borderRadius: "14px",
              color: "#64748b",
            }}
          >
            <CheckCircle2 size={32} color="#059669" style={{ margin: "0 auto 8px" }} />
            <p style={{ margin: 0, fontWeight: 700, color: "#0f172a", fontSize: "14px" }}>
              No complaints in this view
            </p>
            <p style={{ margin: "4px 0 0", fontSize: "12.5px" }}>
              Site operations are clear. No active impediments reported.
            </p>
          </div>
        ) : (
          filteredComplaints.map((c) => (
            <article key={c.id} className={styles.complaintCard}>
              <div className={styles.complaintHeaderRow}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <h3 className={styles.complaintTitle}>{c.title}</h3>
                  {getSeverityBadge(c.severity)}
                  <span
                    style={{
                      fontSize: "10.5px",
                      fontWeight: 650,
                      color: "#475569",
                      backgroundColor: "#f1f5f9",
                      padding: "2px 7px",
                      borderRadius: "6px",
                    }}
                  >
                    {c.category}
                  </span>
                </div>
                <div>{getStatusBadge(c.status)}</div>
              </div>

              <p className={styles.complaintDesc}>{c.description}</p>

              {/* Comments Thread (displayed if comments exist, including when marked resolved) */}
              {c.notes && c.notes.length > 0 && (
                <div className={styles.complaintNotesThread}>
                  <button
                    type="button"
                    onClick={() => toggleCommentsExpanded(c.id)}
                    className={styles.complaintNotesHeaderBtn}
                    aria-expanded={Boolean(expandedComments[c.id])}
                    title={expandedComments[c.id] ? "Hide comments" : "Show comments"}
                  >
                    <MessageSquare size={13} color="#64748b" />
                    <span>
                      Comments ({c.notes.length})
                    </span>
                    {expandedComments[c.id] ? (
                      <ChevronUp size={13} color="#64748b" />
                    ) : (
                      <ChevronDown size={13} color="#64748b" />
                    )}
                  </button>

                  {expandedComments[c.id] && (
                    <div className={styles.complaintNotesList}>
                      {c.notes.map((n) => (
                        <div key={n.id} className={styles.complaintNoteBubble}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>
                              {n.author}{" "}
                              <span style={{ fontWeight: 500, color: "#64748b", fontSize: "11px" }}>
                                ({n.authorRole})
                              </span>
                            </span>
                            <span style={{ fontSize: "11px", color: "#64748b" }}>{n.timestamp}</span>
                          </div>
                          <p style={{ margin: "3px 0 0", fontSize: "12.5px", color: "#334155", lineHeight: 1.45 }}>
                            {n.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Inline Comment Composer (unresolved complaints only) */}
              {c.status !== "resolved" && activeNoteComplaintId === c.id && (
                <div className={styles.noteComposerBox}>
                  <textarea
                    placeholder="Write a comment..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className={styles.noteTextarea}
                    rows={2}
                    autoFocus
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveNoteComplaintId(null);
                        setNoteText("");
                      }}
                      className={styles.cancelNoteBtn}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddNote(c.id)}
                      className={styles.submitNoteBtn}
                      disabled={!noteText.trim()}
                    >
                      Post Comment
                    </button>
                  </div>
                </div>
              )}

              <footer className={styles.complaintMetaFooter}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", fontSize: "11.5px", color: "#64748b" }}>
                  <span>{c.raisedAt}</span>
                  {c.raisedBy && (
                    <>
                      <span>·</span>
                      <span>
                        Raised by <strong style={{ color: "#0f172a", fontWeight: 650 }}>{c.raisedBy}</strong>
                      </span>
                      {c.raisedByRole && (
                        <span
                          style={{
                            fontSize: "10.5px",
                            fontWeight: 650,
                            padding: "1px 6px",
                            borderRadius: "4px",
                            backgroundColor: c.raisedByRole.toLowerCase().includes("supervisor") ? "#ecfdf5" : "#f5f3ff",
                            color: c.raisedByRole.toLowerCase().includes("supervisor") ? "#047857" : "#6d28d9",
                            border: c.raisedByRole.toLowerCase().includes("supervisor") ? "1px solid #d1fae5" : "1px solid #ede9fe",
                          }}
                        >
                          {c.raisedByRole}
                        </span>
                      )}
                    </>
                  )}
                </div>

                <div className={styles.complaintActionBtns}>
                  {c.status !== "resolved" && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          if (activeNoteComplaintId === c.id) {
                            setActiveNoteComplaintId(null);
                            setNoteText("");
                          } else {
                            setActiveNoteComplaintId(c.id);
                            setNoteText("");
                            setExpandedComments((prev) => ({
                              ...prev,
                              [c.id]: true,
                            }));
                          }
                        }}
                        className={styles.complaintActionBtn}
                        title="Add a comment"
                      >
                        <MessageSquare size={13} />
                        <span>Comment</span>
                      </button>

                      {c.status === "open" && (
                        <button
                          type="button"
                          onClick={() => handleToggleReview(c.id)}
                          className={styles.complaintActionBtn}
                          title="Start review on this complaint"
                        >
                          <Clock size={13} strokeWidth={2} />
                          <span>Start Review</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleToggleResolve(c.id)}
                        className={styles.complaintActionBtn}
                        aria-label="✓ Mark Resolved"
                        title="Mark complaint as resolved"
                      >
                        <Check size={13} strokeWidth={2} />
                        <span>Mark Resolved</span>
                      </button>
                    </>
                  )}
                </div>
              </footer>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
