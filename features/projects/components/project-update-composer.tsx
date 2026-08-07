"use client";

import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  useRef,
  useEffect,
} from "react";
import Image from "next/image";
import {
  Image as ImageIcon,
  FileText,
  Flag,
  Send,
  X,
  AlertTriangle,
  Check,
  ClipboardList,
  Users,
  ChevronDown,
  Mic,
  Radio,
  Plus,
} from "lucide-react";
import {
  ProjectUpdateType,
  UpdateVisibility,
  ProjectUpdateAttachment,
  CreateProjectUpdateInput,
} from "@/types/domain/project-update";
import styles from "../projects.module.css";

export interface ProjectUpdateComposerRef {
  focusAndExpand: () => void;
}

interface ProjectUpdateComposerProps {
  projectId: string;
  currentUser?: {
    id: string;
    name: string;
    role: string;
    avatarUrl?: string;
  };
  hasPermission?: boolean;
  onCreateUpdate: (input: CreateProjectUpdateInput) => Promise<void>;
}

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
const MAX_ATTACHMENTS_COUNT = 4;

export const ProjectUpdateComposer = forwardRef<
  ProjectUpdateComposerRef,
  ProjectUpdateComposerProps
>(function ProjectUpdateComposer(
  {
    projectId,
    currentUser = {
      id: "usr-arjun",
      name: "Arjun Menon",
      role: "Project Manager",
      avatarUrl:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    hasPermission = true,
    onCreateUpdate,
  },
  ref
) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [updateType, setUpdateType] = useState<ProjectUpdateType>("general");
  const [visibility, setVisibility] = useState<UpdateVisibility>("project_team");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [attachments, setAttachments] = useState<ProjectUpdateAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Visibility Change Confirmation Modal
  const [pendingVisibility, setPendingVisibility] = useState<UpdateVisibility | null>(null);
  const [showVisibilityConfirm, setShowVisibilityConfirm] = useState(false);

  // File Upload input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  // Draft persistence key
  const draftKey = `kallisto_update_draft_${projectId}`;

  // Restore draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.body || parsed.title) {
          setTitle(parsed.title || "");
          setBody(parsed.body || "");
          setUpdateType(parsed.type || "general");
          setVisibility(parsed.visibility || "project_team");
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, [draftKey]);

  // Persist draft on changes
  useEffect(() => {
    if (title || body) {
      try {
        localStorage.setItem(
          draftKey,
          JSON.stringify({ title, body, type: updateType, visibility })
        );
      } catch {
        // Ignore storage errors
      }
    }
  }, [title, body, updateType, visibility, draftKey]);

  // Expose focusAndExpand to parent header + Add Update button
  useImperativeHandle(ref, () => ({
    focusAndExpand: () => {
      setIsExpanded(true);
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 50);
    },
  }));

  if (!hasPermission) {
    return null;
  }

  const handleClearDraft = () => {
    setTitle("");
    setBody("");
    setUpdateType("general");
    setVisibility("project_team");
    setAttachments([]);
    try {
      localStorage.removeItem(draftKey);
    } catch {
      // Ignore
    }
  };

  const handleVisibilitySelect = (newVis: UpdateVisibility) => {
    // If attempting to expand visibility from internal to client_visible, prompt confirmation
    if (visibility === "internal" && newVis === "client_visible") {
      setPendingVisibility(newVis);
      setShowVisibilityConfirm(true);
    } else {
      setVisibility(newVis);
    }
  };

  const confirmVisibilityChange = () => {
    if (pendingVisibility) {
      setVisibility(pendingVisibility);
    }
    setShowVisibilityConfirm(false);
    setPendingVisibility(null);
  };

  // Simulate file upload with progress
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (attachments.length + files.length > MAX_ATTACHMENTS_COUNT) {
      alert(`Maximum ${MAX_ATTACHMENTS_COUNT} attachments permitted per update.`);
      return;
    }

    Array.from(files).forEach((file) => {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        alert(`File "${file.name}" exceeds maximum size limit of 25 MB.`);
        return;
      }

      const isImage = file.type.startsWith("image/");
      const attachmentId = `att-draft-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

      const newAttachment: ProjectUpdateAttachment = {
        id: attachmentId,
        type: isImage ? "image" : "document",
        name: file.name,
        sizeBytes: file.size,
        mimeType: file.type,
        url: isImage ? URL.createObjectURL(file) : "/assets/docs/sample_doc.pdf",
        uploadProgress: 20,
        uploadStatus: "uploading",
      };

      setAttachments((prev) => [...prev, newAttachment]);

      // Simulate upload progress
      let currentProgress = 20;
      const interval = setInterval(() => {
        currentProgress += 30;
        if (currentProgress >= 100) {
          clearInterval(interval);
          setAttachments((prev) =>
            prev.map((item) =>
              item.id === attachmentId
                ? { ...item, uploadProgress: 100, uploadStatus: "completed" }
                : item
            )
          );
        } else {
          setAttachments((prev) =>
            prev.map((item) =>
              item.id === attachmentId
                ? { ...item, uploadProgress: currentProgress }
                : item
            )
          );
        }
      }, 200);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveAttachment = (attId: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!body.trim() && !title.trim()) || isSubmitting) return;

    // Check if attachments are still uploading
    const hasUploading = attachments.some((a) => a.uploadStatus === "uploading");
    if (hasUploading) {
      alert("Please wait for all file uploads to complete before posting.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreateUpdate({
        projectId,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorRole: currentUser.role,
        authorAvatar: currentUser.avatarUrl,
        type: updateType,
        title: title.trim() || undefined,
        body: body.trim() || undefined,
        visibility,
        attachments: attachments.map((att) => {
          const cleanAtt = { ...att };
          if (selectedCategory && !cleanAtt.documentCategory) {
            cleanAtt.documentCategory = selectedCategory;
          }
          delete cleanAtt.uploadProgress;
          delete cleanAtt.uploadStatus;
          return cleanAtt;
        }),
      });

      handleClearDraft();
      setIsExpanded(false);
    } catch (err) {
      console.error("Failed to post project update:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.projectUpdateComposerCard}>
      <form onSubmit={handleSubmit} className={styles.composerForm}>
        {/* Compact Reference-image style input bar */}
        <div className={styles.composerInputBar}>
          {/* Collapsed: placeholder textarea */}
          {!isExpanded ? (
            <div className={styles.composerCollapsedRow}>
              {/* Left: + button + All dropdown */}
              <div className={styles.composerCollapsedLeft}>
                <button
                  type="button"
                  className={styles.composerPlusBtn}
                  onClick={() => {
                    setIsExpanded(true);
                    setTimeout(() => textInputRef.current?.focus(), 50);
                  }}
                  aria-label="Add attachment or action"
                >
                  <Plus size={16} />
                </button>
                <button
                  type="button"
                  className={styles.composerAllChip}
                  onClick={() => {
                    setIsExpanded(true);
                    setTimeout(() => textInputRef.current?.focus(), 50);
                  }}
                >
                  All
                  <ChevronDown size={12} />
                </button>
              </div>

              {/* Centre: placeholder text */}
              <button
                type="button"
                className={styles.composerPlaceholderText}
                onClick={() => {
                  setIsExpanded(true);
                  setTimeout(() => textInputRef.current?.focus(), 50);
                }}
              >
                Share update, site progress, type @ to mention, or / for actions...
              </button>

              {/* Right: mic + audio waveform buttons */}
              <div className={styles.composerCollapsedRight}>
                <button type="button" className={styles.composerMicBtn} aria-label="Voice input">
                  <Mic size={16} />
                </button>
                <button type="button" className={styles.composerAudioBtn} aria-label="Audio">
                  <Radio size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.composerTopRow}>
              <div className={styles.composerUserHeader}>
                <div className={styles.composerAvatarWrapper}>
                  {currentUser.avatarUrl ? (
                    <Image
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      width={36}
                      height={36}
                      className={styles.composerAvatar}
                      unoptimized
                    />
                  ) : (
                    <div className={styles.composerAvatarFallback}>
                      {currentUser.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <span className={styles.composerTitleLabel}>Share an update</span>
              </div>

              <div className={styles.composerInputBox}>
                <input
                  type="text"
                  className={styles.composerTitleInput}
                  placeholder="Update title (optional)..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <textarea
                  ref={textInputRef}
                  className={styles.composerTextArea}
                  rows={3}
                  placeholder="Share update, site progress, type @ to mention, or / for actions..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Uploaded attachments preview */}
        {attachments.length > 0 && (
          <div className={styles.composerAttachmentsRow}>
            {attachments.map((att) => (
              <div key={att.id} className={styles.composerAttachmentItem}>
                <span className={styles.attachmentName} title={att.name}>
                  {att.name}
                </span>

                {att.uploadStatus === "uploading" ? (
                  <span className={styles.attachmentProgressText}>
                    {att.uploadProgress}%
                  </span>
                ) : (
                  <Check size={13} className={styles.attachmentDoneIcon} />
                )}

                <button
                  type="button"
                  className={styles.attachmentRemoveBtn}
                  onClick={() => handleRemoveAttachment(att.id)}
                  title="Remove attachment"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          style={{ display: "none" }}
          multiple
          accept="image/*,.pdf,.doc,.docx,.xlsx"
          onChange={handleFileSelect}
        />

        {/* Bottom Toolbar Row */}
        <div className={styles.composerToolbar}>
          <div className={styles.composerActionsLeft}>
            <button
              type="button"
              className={`${styles.composerActionChip} ${
                attachments.some((a) => a.type === "image") ? styles.chipActive : ""
              }`}
              onClick={() => {
                setIsExpanded(true);
                setUpdateType("general");
                fileInputRef.current?.click();
              }}
              title="Attach photo"
            >
              <ImageIcon size={15} />
              <span>Photo</span>
            </button>

            <button
              type="button"
              className={`${styles.composerActionChip} ${
                updateType === "document_uploaded" ? styles.chipActive : ""
              }`}
              onClick={() => {
                setIsExpanded(true);
                setUpdateType("document_uploaded");
                setSelectedCategory("drawings");
                fileInputRef.current?.click();
              }}
              title="Attach document"
            >
              <FileText size={15} />
              <span>Document</span>
            </button>

            <button
              type="button"
              className={`${styles.composerActionChip} ${
                updateType === "milestone" ? styles.chipActive : ""
              }`}
              onClick={() => {
                setIsExpanded(true);
                setUpdateType((prev) => (prev === "milestone" ? "general" : "milestone"));
              }}
              title="Tag as Milestone"
            >
              <Flag size={15} />
              <span>Milestone</span>
            </button>

            <button
              type="button"
              className={`${styles.composerActionChip} ${
                updateType === "site_report" ? styles.chipActive : ""
              }`}
              onClick={() => {
                setIsExpanded(true);
                setUpdateType((prev) => (prev === "site_report" ? "general" : "site_report"));
              }}
              title="Tag as Site report"
            >
              <ClipboardList size={15} />
              <span>Site report</span>
            </button>
          </div>

          <div className={styles.composerActionsRight}>
            {/* Audience/Visibility Selector Pill */}
            <div className={styles.visibilitySelector}>
              <Users size={15} className={styles.visibilityIcon} />
              <select
                value={visibility}
                onChange={(e) =>
                  handleVisibilitySelect(e.target.value as UpdateVisibility)
                }
                className={styles.visibilitySelect}
              >
                <option value="project_team">Project team</option>
                <option value="client_visible">Client visible</option>
                <option value="internal">Internal only</option>
              </select>
              <ChevronDown size={14} className={styles.visibilityChevron} />
            </div>

            <button
              type="button"
              className={styles.composerCancelBtn}
              onClick={() => {
                handleClearDraft();
                setIsExpanded(false);
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={styles.composerSubmitBtn}
              disabled={(!body.trim() && !title.trim()) || isSubmitting}
            >
              <Send size={14} />
              <span>{isSubmitting ? "Posting..." : "Post Update"}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Visibility Expansion Confirmation Dialog */}
      {showVisibilityConfirm && (
        <div className={styles.clientModalBackdrop} onClick={() => setShowVisibilityConfirm(false)}>
          <div className={styles.clientModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-600" />
                <h3>Expand Update Visibility?</h3>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setShowVisibilityConfirm(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className={styles.modalContent}>
              <p className="text-sm text-slate-600 mb-4">
                You are changing visibility from <strong>Internal only</strong> to{" "}
                <strong>Client visible</strong>. Please ensure this update contains no internal cost calculations or team discussions.
              </p>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => setShowVisibilityConfirm(false)}
                >
                  Keep Internal
                </button>
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={confirmVisibilityChange}
                >
                  Confirm Client Visible
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
