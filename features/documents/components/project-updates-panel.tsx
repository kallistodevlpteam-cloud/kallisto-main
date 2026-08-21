"use client";

import Image from "next/image";
import {
  AlertTriangle,
  AtSign,
  AudioLines,
  Check,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Eye,
  File as FileIcon,
  FileCode,
  FileSpreadsheet,
  FileText,
  HardHat,
  ImageIcon,
  MessageCircle,
  Mic,
  MoreHorizontal,
  Plus,
  SendHorizontal,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState, type RefObject } from "react";
import {
  PROJECT_UPDATES_PANEL_ID,
  type ProjectUpdatesLayoutMode,
} from "@/lib/layout/project-dashboard-responsive-contract";
import {
  AUDIENCE_OPTIONS,
  INITIAL_PROJECT_UPDATES,
  UPLOAD_CATEGORIES,
  useProjectUpdatesPanelState,
  type SiteActionOption,
  type UpdatePost,
  type UploadCategory,
} from "../hooks/use-project-updates-panel-state";

interface ProjectUpdatesPanelProps {
  projectId?: string;
  layoutMode: ProjectUpdatesLayoutMode;
  open: boolean;
  panelRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
  initialUpdates?: readonly UpdatePost[];
  updatesTitle?: string;
}

function FileIconBadge({ fileName }: { fileName: string }) {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";

  if (extension === "pdf") {
    return <span className="file-badge-icon pdf-badge"><FileText size={10} strokeWidth={2.5} /></span>;
  }
  if (["md", "txt", "doc", "docx"].includes(extension)) {
    return <span className="file-badge-icon doc-badge"><FileCode size={10} strokeWidth={2.5} /></span>;
  }
  if (["jpg", "jpeg", "png", "webp", "gif"].includes(extension)) {
    return <span className="file-badge-icon img-badge"><ImageIcon size={10} strokeWidth={2.5} /></span>;
  }
  return <span className="file-badge-icon generic-badge"><FileIcon size={10} strokeWidth={2.5} /></span>;
}

function ActionIconBadge({ iconName }: { iconName: SiteActionOption["iconName"] }) {
  if (iconName === "inspection") return <HardHat size={15} className="action-popover-icon inspection" />;
  if (iconName === "boq") return <FileSpreadsheet size={15} className="action-popover-icon boq" />;
  if (iconName === "media") return <ImageIcon size={15} className="action-popover-icon media" />;
  if (iconName === "safety") return <AlertTriangle size={15} className="action-popover-icon safety" />;
  if (iconName === "approval") return <ClipboardCheck size={15} className="action-popover-icon approval" />;
  return <Zap size={15} className="action-popover-icon default" />;
}

function UploadCategoryIcon({ category }: { category: UploadCategory }) {
  if (category.iconName === "media") return <ImageIcon size={16} className="cat-icon media" />;
  if (category.iconName === "documents") return <FileText size={16} className="cat-icon doc" />;
  if (category.iconName === "mentions") return <AtSign size={16} className="cat-icon mention" />;
  return <Zap size={16} className="cat-icon action" />;
}

function getTagThemeClass(tag: string): string {
  const value = tag.toLowerCase();
  if (value.includes("safety") || value.includes("risk") || value.includes("flag")) return "tag-theme-safety";
  if (value.includes("inspection")) return "tag-theme-inspection";
  if (value.includes("boq") || value.includes("materials")) return "tag-theme-boq";
  if (value.includes("media")) return "tag-theme-media";
  if (value.includes("doc") || value.includes("file")) return "tag-theme-doc";
  if (value.includes("mention")) return "tag-theme-mention";
  if (value.includes("approval")) return "tag-theme-approval";
  if (value.includes("milestone")) return "tag-theme-milestone";
  if (value.includes("design") || value.includes("revision")) return "tag-theme-design";
  return "tag-theme-default";
}

export function ProjectUpdatesPanel({
  projectId = "proj-001",
  layoutMode,
  open,
  panelRef,
  onClose,
  initialUpdates = INITIAL_PROJECT_UPDATES,
  updatesTitle = "Project Updates",
}: ProjectUpdatesPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const uploadMenuRef = useRef<HTMLDivElement>(null);
  const audienceMenuRef = useRef<HTMLDivElement>(null);
  const mentionsMenuRef = useRef<HTMLDivElement>(null);
  const actionsMenuRef = useRef<HTMLDivElement>(null);
  const { state } = useProjectUpdatesPanelState({
    fileInputRef,
    textareaRef,
    feedRef,
    uploadMenuRef,
    audienceMenuRef,
    mentionsMenuRef,
    actionsMenuRef,
  }, initialUpdates, projectId);
  const [isFocused, setIsFocused] = useState(false);
  const [lightbox, setLightbox] = useState<{
    images: string[];
    currentIndex: number;
    title?: string;
    authorName?: string;
  } | null>(null);
  const isDrawer = layoutMode === "drawer";
  const hasContent = isFocused || state.updateText.trim().length > 0 || state.attachedFiles.length > 0 || state.selectedAction !== null || state.selectedMentions.length > 0;

  const closeLightbox = () => {
    setLightbox(null);
    if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightbox) return;

      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowLeft" || e.key === "Left") {
        setLightbox((prev) =>
          prev
            ? {
                ...prev,
                currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length,
              }
            : null
        );
      } else if (e.key === "ArrowRight" || e.key === "Right") {
        setLightbox((prev) =>
          prev
            ? {
                ...prev,
                currentIndex: (prev.currentIndex + 1) % prev.images.length,
              }
            : null
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightbox]);

  const handlePrevImage = () => {
    setLightbox((prev) =>
      prev
        ? {
            ...prev,
            currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length,
          }
        : null
    );
  };

  const handleNextImage = () => {
    setLightbox((prev) =>
      prev
        ? {
            ...prev,
            currentIndex: (prev.currentIndex + 1) % prev.images.length,
          }
        : null
    );
  };

  return (
    <>
      {isDrawer && open ? (
        <button
          type="button"
          className="poc-updates-backdrop"
          aria-label="Dismiss project updates"
          tabIndex={-1}
          onClick={onClose}
        />
      ) : null}

      <div
        id={PROJECT_UPDATES_PANEL_ID}
        ref={panelRef}
        className="poc-right-column"
        role={isDrawer ? "dialog" : "complementary"}
        aria-modal={isDrawer ? true : undefined}
        aria-labelledby={isDrawer ? "project-updates-title" : undefined}
        aria-label={isDrawer ? undefined : "Project updates"}
        tabIndex={isDrawer ? -1 : undefined}
        hidden={isDrawer && !open}
        data-updates-presentation={layoutMode}
      >
        <div className="poc-updates-drawer-header">
          <div>
            <span className="poc-updates-drawer-kicker">Project activity</span>
            <h2 id="project-updates-title">Updates</h2>
          </div>
          <button
            type="button"
            className="poc-updates-drawer-close"
            aria-label="Close project updates"
            onClick={onClose}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="poc-updates-rail-header">
          <h3 className="poc-updates-rail-title">{updatesTitle}</h3>
        </div>

        <div
          className="poc-sections-card"
          ref={feedRef}
          data-update-count={state.updatesList.length}
          aria-label="Project update feed"
        >
          {state.updatesList.length === 0 ? (
            <div className="project-updates-empty" role="status">
              <strong>No updates yet</strong>
              <span>Share the first project activity update below.</span>
            </div>
          ) : null}

          {state.updatesList.map((post, index) => (
            <article key={post.id} className="post-item-card">
              <div className="post-header">
                <div className="post-avatar-wrapper">
                  <Image src={post.avatar} alt={post.authorName} width={40} height={40} className="post-avatar" />
                </div>
                <div className="post-author-info">
                  <div className="post-author-row">
                    <span className="post-author-name">{post.authorName}</span>
                    <CheckCircle2 size={14} className="post-verified-badge" aria-label="Verified" />
                    <span className="post-dot">•</span>
                    <span className="post-role-text">{post.role}</span>
                    <span className="post-dot">•</span>
                    <span className="post-date">{post.date}</span>
                  </div>
                  <div className="post-tag-row">
                    <div className={`milestone-badge-tag ${getTagThemeClass(post.tag)}`}>
                      <span className="milestone-badge-icon" aria-hidden="true">◆</span>
                      <span>{post.tag}</span>
                    </div>
                  </div>
                </div>
                <button type="button" className="post-more-btn" aria-label={`More options for ${post.authorName}'s update`}>
                  <MoreHorizontal size={18} aria-hidden="true" />
                </button>
              </div>

              <p className="post-content-text">{post.text}</p>

              {(() => {
                const postImages = post.mediaImages && post.mediaImages.length > 0
                  ? post.mediaImages
                  : post.mediaImg
                    ? [post.mediaImg]
                    : [];

                if (postImages.length > 1) {
                  return (
                    <div
                      className="post-multi-media-grid"
                      data-count={postImages.length >= 4 ? "more" : postImages.length}
                    >
                      {postImages.length >= 4 ? (
                        <>
                          {/* Main 3 columns */}
                          {postImages.slice(0, 3).map((imgUrl, imgIdx) => (
                            <button
                              key={imgIdx}
                              type="button"
                              className="post-grid-thumb-card"
                              onClick={() =>
                                setLightbox({
                                  images: postImages,
                                  currentIndex: imgIdx,
                                  title: post.tag || post.authorName,
                                  authorName: post.authorName,
                                })
                              }
                              aria-label={`View image ${imgIdx + 1}`}
                              title="Click to view image"
                            >
                              <Image src={imgUrl} alt="" fill unoptimized className="post-media-img" />
                            </button>
                          ))}

                          {/* 4th column stacked vertically into 2 thumbnails */}
                          <div className="post-grid-stacked-col">
                            <button
                              type="button"
                              className="post-grid-stacked-thumb"
                              onClick={() =>
                                setLightbox({
                                  images: postImages,
                                  currentIndex: 3,
                                  title: post.tag || post.authorName,
                                  authorName: post.authorName,
                                })
                              }
                              aria-label="View image 4"
                              title="Click to view image"
                            >
                              <Image src={postImages[3]} alt="" fill unoptimized className="post-media-img" />
                            </button>
                            <button
                              type="button"
                              className="post-grid-stacked-thumb"
                              onClick={() =>
                                setLightbox({
                                  images: postImages,
                                  currentIndex: 4,
                                  title: post.tag || post.authorName,
                                  authorName: post.authorName,
                                })
                              }
                              aria-label={`View ${postImages.length - 4} more images`}
                              title="Click to view all images"
                            >
                              <Image src={postImages[4]} alt="" fill unoptimized className="post-media-img" />
                              <div className="post-grid-overflow-overlay">
                                <span>+{postImages.length - 4} more</span>
                              </div>
                            </button>
                          </div>
                        </>
                      ) : (
                        /* 2 or 3 columns */
                        postImages.map((imgUrl, imgIdx) => (
                          <button
                            key={imgIdx}
                            type="button"
                            className="post-grid-thumb-card"
                            onClick={() =>
                              setLightbox({
                                images: postImages,
                                currentIndex: imgIdx,
                                title: post.tag || post.authorName,
                                authorName: post.authorName,
                              })
                            }
                            aria-label={`View image ${imgIdx + 1}`}
                            title="Click to view image"
                          >
                            <Image src={imgUrl} alt="" fill unoptimized className="post-media-img" />
                          </button>
                        ))
                      )}
                    </div>
                  );
                } else if (postImages.length === 1) {
                  return (
                    <button
                      type="button"
                      className="post-media-banner"
                      onClick={() =>
                        setLightbox({
                          images: postImages,
                          currentIndex: 0,
                          title: post.tag || post.authorName,
                          authorName: post.authorName,
                        })
                      }
                      aria-label={`View ${post.authorName}'s update media`}
                      title="Click to view full image"
                    >
                      <Image src={postImages[0]} alt={post.tag} fill unoptimized className="post-media-img" />
                      {post.mediaBadge ? <div className="post-media-badge"><span>{post.mediaBadge}</span></div> : null}
                    </button>
                  );
                }
                return null;
              })()}

              {post.attachedFilesList && post.attachedFilesList.length > 0 ? (
                <div className="post-attached-docs-list">
                  {post.attachedFilesList.map((doc, docIdx) => (
                    <div key={docIdx} className="post-attached-doc-card">
                      <FileIconBadge fileName={doc.name} />
                      <div className="post-doc-info">
                        <span className="post-doc-name">{doc.name}</span>
                        {doc.size ? <span className="post-doc-size">{doc.size}</span> : null}
                      </div>
                      <button
                        type="button"
                        className="post-doc-download-btn"
                        onClick={() => {
                          if (doc.url) window.open(doc.url, "_blank");
                          else setLightbox({ images: ["/assets/hero-architecture-banner.webp"], currentIndex: 0, title: doc.name });
                        }}
                        aria-label={`View ${doc.name}`}
                      >
                        <Eye size={13} />
                        <span>View</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="post-actions-bar">
                <button type="button" className="post-action-btn" aria-label={`Reply to ${post.authorName}`}>
                  <MessageCircle size={15} aria-hidden="true" /><span>Reply</span>
                </button>
                <button type="button" className="post-action-btn" aria-label={`Acknowledge ${post.authorName}'s update`}>
                  <Check size={15} strokeWidth={2.5} aria-hidden="true" /><span>Acknowledge</span>
                </button>
              </div>
              {index < state.updatesList.length - 1 ? <div className="post-item-divider" /> : null}
            </article>
          ))}
        </div>

        <div className="update-input-wrapper" data-updates-composer>
          {state.hasPillItems ? (
            <div className="uploaded-files-pill-row">
              {state.selectedAction ? (
                <div className="uploaded-file-pill action-pill">
                  <span className="file-badge-icon action-badge"><Zap size={10} strokeWidth={2.5} /></span>
                  <span className="uploaded-file-pill-name">Action: {state.selectedAction.label}</span>
                  <button type="button" className="uploaded-file-pill-remove" onClick={() => state.setSelectedAction(null)} aria-label="Remove action">
                    <X size={12} aria-hidden="true" />
                  </button>
                </div>
              ) : null}

              {state.selectedMentions.map((item) => (
                <div key={item.id} className="uploaded-file-pill mention-pill">
                  {item.type === "person" ? (
                    <Image src={item.avatar} alt="" width={16} height={16} className="mention-avatar-img" />
                  ) : <FileIconBadge fileName={item.name} />}
                  <span className="uploaded-file-pill-name">@{item.name}</span>
                  <button
                    type="button"
                    className="uploaded-file-pill-remove"
                    onClick={() => state.setSelectedMentions((current) => current.filter((mention) => mention.id !== item.id))}
                    aria-label={`Remove ${item.name} mention`}
                  >
                    <X size={12} aria-hidden="true" />
                  </button>
                </div>
              ))}

              {state.attachedFiles.map((file, index) => {
                const isImage = file.type.startsWith("image/");
                const previewUrl = isImage ? URL.createObjectURL(file) : undefined;
                return (
                  <div key={`${file.name}-${index}`} className={`uploaded-file-pill ${isImage ? "thumb-item" : ""}`}>
                    {isImage && previewUrl ? (
                      <Image
                        src={previewUrl}
                        alt={file.name}
                        width={46}
                        height={46}
                        className="thumb-img"
                        style={{ cursor: "pointer" }}
                        onClick={() => setLightbox({ images: [previewUrl], currentIndex: 0, title: file.name })}
                      />
                    ) : (
                      <>
                        <FileIconBadge fileName={file.name} />
                        <span className="uploaded-file-pill-name">{file.name}</span>
                      </>
                    )}
                    <button type="button" className="uploaded-file-pill-remove" onClick={() => state.handleRemoveFile(index)} aria-label={`Remove ${file.name}`}>
                      <X size={10} aria-hidden="true" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : null}

          {state.uploadMenuOpen ? (
            <div className="upload-category-menu" ref={uploadMenuRef}>
              <div className="popover-menu-scroll">
                {UPLOAD_CATEGORIES.map((category) => (
                  <button key={category.id} type="button" className="upload-category-item" onClick={() => state.handleCategorySelect(category)}>
                    <UploadCategoryIcon category={category} />
                    <span className="popover-command-name">{category.label}</span>
                    <span className="popover-item-description">{category.tag}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {state.audienceMenuOpen ? (
            <div className="audience-dropdown-menu" ref={audienceMenuRef}>
              <div className="popover-menu-scroll">
                {AUDIENCE_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`audience-menu-item ${state.selectedAudience.id === option.id ? "is-selected" : ""}`}
                    onClick={() => { state.setSelectedAudience(option); state.setAudienceMenuOpen(false); }}
                  >
                    <span className="popover-command-name">{option.label}</span>
                    <span className="popover-item-description">{option.badge}</span>
                    {state.selectedAudience.id === option.id ? <Check size={14} className="audience-check-icon" /> : null}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {state.mentionsMenuOpen ? (
            <div className="antigravity-popover-menu mentions-menu" ref={mentionsMenuRef}>
              <div className="popover-menu-scroll">
                {state.filteredTeamMembers.map((person) => (
                  <button key={person.id} type="button" className="popover-menu-item" onClick={() => state.handleSelectMention(person)}>
                    <Image src={person.avatar} alt="" width={18} height={18} className="popover-item-avatar" />
                    <span className="popover-command-name">@{person.name}</span>
                    <span className="popover-item-description">{person.role}</span>
                  </button>
                ))}
                {state.filteredProjectFiles.map((file) => (
                  <button key={file.id} type="button" className="popover-menu-item" onClick={() => state.handleSelectMention(file)}>
                    <FileIconBadge fileName={file.name} />
                    <span className="popover-command-name">@{file.name}</span>
                    <span className="popover-item-description">{file.category}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {state.actionsMenuOpen ? (
            <div className="antigravity-popover-menu actions-menu" ref={actionsMenuRef}>
              <div className="popover-menu-scroll">
                {state.filteredActions.map((action) => (
                  <button key={action.id} type="button" className="popover-menu-item action-item" onClick={() => state.handleSelectAction(action)}>
                    <ActionIconBadge iconName={action.iconName} />
                    <span className="popover-command-name">{action.command.replace(/^\//, "")}</span>
                    <span className="popover-item-description">{action.description}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="update-input-card">
            <label className="sr-only" htmlFor="project-update-draft">
              Share a project update
            </label>
            <textarea
              id="project-update-draft"
              ref={textareaRef}
              className="update-input-textarea"
              placeholder="Share update, site progress, type @ to mention, or / for actions..."
              value={state.updateText}
              onChange={state.handleTextareaChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  state.handleSendUpdate();
                }
              }}
              rows={2}
            />

            <div className="update-input-toolbar">
              <div className="update-toolbar-left">
                <input type="file" ref={fileInputRef} multiple hidden onChange={state.handleFileChange} />
                <div className="upload-popover-wrapper">
                  <button
                    type="button"
                    className={`update-attach-btn ${state.uploadMenuOpen ? "is-active" : ""}`}
                    onClick={() => {
                      state.setUploadMenuOpen((current) => !current);
                      state.setAudienceMenuOpen(false);
                      state.setMentionsMenuOpen(false);
                      state.setActionsMenuOpen(false);
                    }}
                    aria-label="Select update attachment or action"
                    aria-expanded={state.uploadMenuOpen}
                  >
                    <Plus size={18} strokeWidth={2} aria-hidden="true" />
                  </button>
                </div>

                <div className="audience-popover-wrapper">
                  <button
                    type="button"
                    className={`update-version-select ${state.audienceMenuOpen ? "is-active" : ""}`}
                    onClick={() => {
                      state.setAudienceMenuOpen((current) => !current);
                      state.setUploadMenuOpen(false);
                      state.setMentionsMenuOpen(false);
                      state.setActionsMenuOpen(false);
                    }}
                    aria-label={`Audience: ${state.selectedAudience.label}`}
                    aria-expanded={state.audienceMenuOpen}
                  >
                    <span>{state.selectedAudience.label}</span><ChevronDown size={13} aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="update-toolbar-right">
                <button
                  type="button"
                  className="chatgpt-mic-btn"
                  aria-label="Voice input"
                  title="Voice input"
                >
                  <Mic size={18} strokeWidth={2} />
                </button>

                {hasContent ? (
                  <button
                    type="button"
                    className="chatgpt-voice-wave-btn chatgpt-send-btn"
                    onClick={state.handleSendUpdate}
                    aria-label="Submit update"
                    title="Submit update"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <SendHorizontal size={15} style={{ marginLeft: "1px" }} aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="chatgpt-voice-wave-btn"
                    aria-label="Voice Mode"
                    title="Voice Mode"
                  >
                    <AudioLines size={18} strokeWidth={2.2} aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {lightbox ? (
        <div
          className="project-gallery-viewer is-fullscreen lightbox-overlay-modal"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
        >
          {/* Top Right Controls (Close) */}
          <div className="lightbox-top-bar" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="project-viewer-control-btn"
              onClick={closeLightbox}
              aria-label="Close image viewer"
              title="Close (Esc)"
            >
              <X size={20} />
            </button>
          </div>

          {/* Center Viewer Viewport */}
          <div className="lightbox-main-viewport" onClick={(e) => e.stopPropagation()}>
            {lightbox.images.length > 1 ? (
              <button
                type="button"
                className="lightbox-nav-btn lightbox-nav-btn--prev"
                onClick={handlePrevImage}
                aria-label="Previous image"
                title="Previous image (Left arrow)"
              >
                <ChevronLeft size={26} strokeWidth={2.2} />
              </button>
            ) : null}

            <div className="lightbox-image-frame">
              <Image
                key={`${lightbox.currentIndex}-${lightbox.images[lightbox.currentIndex]}`}
                src={lightbox.images[lightbox.currentIndex]}
                alt={`Preview image ${lightbox.currentIndex + 1}`}
                fill
                unoptimized
                className="project-viewer-img"
                sizes="100vw"
              />
            </div>

            {lightbox.images.length > 1 ? (
              <button
                type="button"
                className="lightbox-nav-btn lightbox-nav-btn--next"
                onClick={handleNextImage}
                aria-label="Next image"
                title="Next image (Right arrow)"
              >
                <ChevronRight size={26} strokeWidth={2.2} />
              </button>
            ) : null}
          </div>

          {/* Bottom Bar: Title Badge & Thumbnail Rail */}
          <div className="lightbox-bottom-bar" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-counter-pill">
              <span>
                {lightbox.authorName ? `${lightbox.authorName} • ` : ""}
                Image {lightbox.currentIndex + 1} of {lightbox.images.length}
              </span>
            </div>

            {lightbox.images.length > 1 ? (
              <div className="lightbox-thumb-strip" aria-label="Other images in gallery">
                {lightbox.images.map((imgUrl, idx) => (
                  <button
                    key={`${idx}-${imgUrl}`}
                    type="button"
                    className={`lightbox-thumb-item ${idx === lightbox.currentIndex ? "is-selected" : ""}`}
                    onClick={() => setLightbox((prev) => (prev ? { ...prev, currentIndex: idx } : null))}
                    aria-label={`Switch to image ${idx + 1}`}
                  >
                    <Image src={imgUrl} alt="" width={56} height={40} className="lightbox-thumb-img" unoptimized />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
