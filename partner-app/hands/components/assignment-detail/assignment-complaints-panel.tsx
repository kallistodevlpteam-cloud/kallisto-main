"use client";

import React, { useState } from "react";
import { 
  CheckCircle2, 
  Clock, 
  Check,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Plus,
  X
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
  contractorName?: string;
  initialComplaints?: AssignmentComplaint[];
}

export function AssignmentComplaintsPanel({
  assignmentId: _assignmentId,
  projectName: _projectName,
  supervisorName: _supervisorName,
  contractorName = "Apex Integrated Civil",
  initialComplaints = [],
}: AssignmentComplaintsPanelProps) {
  const [complaints, setComplaints] = useState<AssignmentComplaint[]>(initialComplaints);
  const [filterStatus, setFilterStatus] = useState<"all" | ComplaintStatus>("all");
  // Provider complaints are permanently excluded; filter only shows All / Site Supervisor / You (own)
  const [filterRaiser, setFilterRaiser] = useState<"all" | "supervisor" | "contractor">("all");
  const [activeNoteComplaintId, setActiveNoteComplaintId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  // Raise Complaint form state
  const [showRaiseForm, setShowRaiseForm] = useState(false);
  const [raiseTitle, setRaiseTitle] = useState("");
  const [raiseDesc, setRaiseDesc] = useState("");
  const [raiseSeverity, setRaiseSeverity] = useState<ComplaintSeverity>("medium");
  const [raiseCategory, setRaiseCategory] = useState<AssignmentComplaint["category"]>("Material Shortage");


  const toggleCommentsExpanded = (complaintId: string) => {
    setExpandedComments((prev) => ({
      ...prev,
      [complaintId]: !prev[complaintId],
    }));
  };


  const raiserFiltered = complaints.filter((c) => {
    // Always hide provider-raised complaints — this is the labor contractor's platform
    if (c.raisedByRole?.toLowerCase().includes("provider")) return false;
    // Apply Raised By sub-filter (All / Site Supervisor / You)
    if (filterRaiser === "supervisor" && !c.raisedByRole?.toLowerCase().includes("supervisor")) return false;
    if (filterRaiser === "contractor" && c.raisedByRole?.toLowerCase().includes("supervisor")) return false;
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

  const handleRaiseComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!raiseTitle.trim() || !raiseDesc.trim()) return;

    const newComplaint: AssignmentComplaint = {
      id: `cmp-${Date.now()}`,
      title: raiseTitle.trim(),
      description: raiseDesc.trim(),
      severity: raiseSeverity,
      status: "open",
      category: raiseCategory,
      raisedBy: contractorName,
      raisedByRole: "Contractor",
      raisedAt: "Just now",
      notes: [],
    };

    setComplaints((prev) => [newComplaint, ...prev]);
    // Reset form
    setRaiseTitle("");
    setRaiseDesc("");
    setRaiseSeverity("medium");
    setRaiseCategory("Material Shortage");
    setShowRaiseForm(false);
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
          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
            {(["all", "open", "in_review", "resolved"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                style={{
                  fontSize: "12px",
                  padding: "6px 12px",
                  borderRadius: "7px",
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

          {/* Raise Complaint Button */}
          <button
            type="button"
            onClick={() => setShowRaiseForm((v) => !v)}
            aria-label="Raise Complaint"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              fontWeight: 700,
              padding: "7px 16px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#dc2626",
              color: "#ffffff",
              cursor: "pointer",
              transition: "background-color 120ms ease",
              flexShrink: 0,
            }}
          >
            <Plus size={14} />
            Raise Complaint
          </button>

        </div>

        {/* Bottom of the heading: Filter by Raiser */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "12px", fontWeight: 650, color: "#64748b" }}>Raised By:</span>
          <div style={{ display: "flex", gap: "5px" }}>
            {[
              { id: "all", label: "All" },
              { id: "supervisor", label: "Site Supervisor" },
              { id: "contractor", label: "You" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilterRaiser(item.id as "all" | "supervisor" | "contractor")}
                style={{
                  fontSize: "12px",
                  padding: "5px 12px",
                  borderRadius: "7px",
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


      {/* Raise Complaint Inline Form */}
      {showRaiseForm && (
        <div
          style={{
            margin: "0 0 14px",
            padding: "16px",
            backgroundColor: "#fff8f8",
            border: "1px solid #fecaca",
            borderRadius: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
              Raise a Complaint to Site Supervisor
            </span>
            <button
              type="button"
              onClick={() => setShowRaiseForm(false)}
              aria-label="Close raise complaint form"
              style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: "2px" }}
            >
              <X size={15} />
            </button>
          </div>
          <form onSubmit={handleRaiseComplaint} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <input
              type="text"
              placeholder="Complaint title *"
              value={raiseTitle}
              onChange={(e) => setRaiseTitle(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "7px 10px",
                border: "1px solid #e2e8f0",
                borderRadius: "7px",
                fontSize: "12.5px",
                outline: "none",
                boxSizing: "border-box",
                backgroundColor: "#ffffff",
              }}
            />
            <textarea
              placeholder="Describe the issue in detail *"
              value={raiseDesc}
              onChange={(e) => setRaiseDesc(e.target.value)}
              required
              rows={3}
              style={{
                width: "100%",
                padding: "7px 10px",
                border: "1px solid #e2e8f0",
                borderRadius: "7px",
                fontSize: "12.5px",
                outline: "none",
                resize: "vertical",
                boxSizing: "border-box",
                backgroundColor: "#ffffff",
              }}
            />
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "120px" }}>
                <label style={{ fontSize: "11px", fontWeight: 650, color: "#64748b", display: "block", marginBottom: "4px" }}>
                  Severity
                </label>
                <select
                  value={raiseSeverity}
                  onChange={(e) => setRaiseSeverity(e.target.value as ComplaintSeverity)}
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "7px",
                    fontSize: "12px",
                    outline: "none",
                    backgroundColor: "#ffffff",
                  }}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div style={{ flex: 1, minWidth: "140px" }}>
                <label style={{ fontSize: "11px", fontWeight: 650, color: "#64748b", display: "block", marginBottom: "4px" }}>
                  Category
                </label>
                <select
                  value={raiseCategory}
                  onChange={(e) => setRaiseCategory(e.target.value as AssignmentComplaint["category"])}
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "7px",
                    fontSize: "12px",
                    outline: "none",
                    backgroundColor: "#ffffff",
                  }}
                >
                   {(["Material Shortage", "Safety Hazard", "Access Delay", "Site Condition", "Workforce Dispute"] as const).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button
                type="button"
                onClick={() => setShowRaiseForm(false)}
                style={{
                  padding: "6px 14px",
                  fontSize: "12px",
                  fontWeight: 600,
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  background: "#ffffff",
                  color: "#64748b",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!raiseTitle.trim() || !raiseDesc.trim()}
                style={{
                  padding: "6px 14px",
                  fontSize: "12px",
                  fontWeight: 700,
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: !raiseTitle.trim() || !raiseDesc.trim() ? "#e2e8f0" : "#dc2626",
                  color: !raiseTitle.trim() || !raiseDesc.trim() ? "#94a3b8" : "#ffffff",
                  cursor: !raiseTitle.trim() || !raiseDesc.trim() ? "not-allowed" : "pointer",
                  transition: "background-color 120ms ease",
                }}
              >
                Submit Complaint
              </button>
            </div>
          </form>
        </div>
      )}

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

              {/* Inline Comment Composer — only for supervisor-raised complaints; contractor's own complaints are view-only */}
              {c.status !== "resolved" && activeNoteComplaintId === c.id && !c.raisedByRole?.toLowerCase().includes("contractor") && (
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
                  {c.raisedBy && (() => {
                    const isOwnComplaint = c.raisedByRole?.toLowerCase().includes("contractor");
                    return (
                      <>
                        <span>·</span>
                        <span>
                          Raised by{" "}
                          <strong style={{ color: "#0f172a", fontWeight: 650 }}>
                            {isOwnComplaint ? "You" : c.raisedBy}
                          </strong>
                        </span>
                        {/* Only show role badge for supervisor complaints; hide for own (contractor) complaints */}
                        {!isOwnComplaint && c.raisedByRole && (
                          <span
                            style={{
                              fontSize: "10.5px",
                              fontWeight: 650,
                              padding: "1px 6px",
                              borderRadius: "4px",
                              backgroundColor: "#ecfdf5",
                              color: "#047857",
                              border: "1px solid #d1fae5",
                            }}
                          >
                            {c.raisedByRole}
                          </span>
                        )}
                      </>
                    );
                  })()}
                </div>


                {/* Action buttons — hidden for contractor's own complaints (supervisor handles those) */}
                <div className={styles.complaintActionBtns}>
                  {(() => {
                    const isOwnComplaint = c.raisedByRole?.toLowerCase().includes("contractor");
                    if (isOwnComplaint) {
                      // Contractor can only VIEW their own complaints; supervisor reviews/resolves on their portal
                      return (
                        <span
                          style={{
                            fontSize: "11px",
                            color: "#94a3b8",
                            fontStyle: "italic",
                          }}
                        >
                          {c.status === "resolved"
                            ? "✓ Resolved by site supervisor"
                            : c.status === "in_review"
                            ? "⏳ Under review by site supervisor"
                            : "Awaiting site supervisor review"}
                        </span>
                      );
                    }
                    // Supervisor-raised complaints: contractor can comment and take action
                    if (c.status === "resolved") return null;
                    return (
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
                    );
                  })()}
                </div>

              </footer>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
