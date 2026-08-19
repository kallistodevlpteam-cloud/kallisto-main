"use client";

import {
  Archive,
  Eye,
  File,
  FileArchive,
  FileText,
  History,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Star,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { KeyboardEvent, MouseEvent, useEffect, useRef, useState } from "react";

import {
  ProjectDocument,
  ProjectDocumentFolder,
  ProjectDocumentStatus,
} from "@/types/domain/project-document";
import {
  ImageFileIcon,
  PdfFileIcon,
  SpreadsheetFileIcon,
} from "@/components/drive/icons";

import { DriveViewMode } from "./drive-query-state";
import styles from "./project-documents-workspace.module.css";

const statusLabels: Record<ProjectDocumentStatus, string> = {
  draft: "Draft",
  in_review: "In Review",
  approved: "Approved",
  changes_requested: "Changes Requested",
  rejected: "Rejected",
  archived: "Archived",
  superseded: "Superseded",
};

export function formatFileSize(sizeBytes: number): string {
  if (sizeBytes < 1024 * 1024) return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDocumentDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

/**
 * Determines whether a document should display the "New" badge.
 *
 * Priority:
 *  1. `isUnreadByCurrentUser` — if the field is explicitly set (true or false),
 *     that value governs. Explicit `false` suppresses the badge even if the
 *     file was recently updated.
 *  2. `isNew` — same priority behaviour as above, consulted only when
 *     `isUnreadByCurrentUser` is undefined.
 *  3. 48-hour timestamp fallback — used only when both explicit fields are
 *     absent. Rejects invalid and future timestamps.
 *
 * `now` is injectable for deterministic unit tests.
 */
export function isDocumentNew(
  document: ProjectDocument,
  now: number = Date.now(),
): boolean {
  if (document.isUnreadByCurrentUser !== undefined) {
    return document.isUnreadByCurrentUser;
  }

  if (document.isNew !== undefined) {
    return document.isNew;
  }

  const updatedAt = new Date(document.updatedAt).getTime();
  if (!Number.isFinite(updatedAt)) return false;

  const age = now - updatedAt;
  const fortyEightHours = 48 * 60 * 60 * 1000;
  return age >= 0 && age <= fortyEightHours;
}

export function DocumentStatusBadge({
  status,
  size = "default",
}: {
  status: ProjectDocumentStatus;
  size?: "default" | "compact";
}) {
  return (
    <span
      className={`${styles.statusBadge} ${size === "compact" ? styles.statusBadgeCompact : ""} ${styles[`status_${status}`]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

type FileKind = "pdf" | "image" | "spreadsheet" | "archive" | "drawing" | "document" | "file";

function getFileKind(extension: string): FileKind {
  if (extension === "pdf") return "pdf";
  if (["png", "jpg", "jpeg", "webp"].includes(extension)) return "image";
  if (["xlsx", "xls", "csv"].includes(extension)) return "spreadsheet";
  if (extension === "zip") return "archive";
  if (extension === "dwg") return "drawing";
  if (["doc", "docx"].includes(extension)) return "document";
  return "file";
}

function FileTypeIcon({ extension, size = 19 }: { extension: string; size?: number }) {
  const glyphSize = size >= 24 ? "preview" : "compact";
  const fileKind = getFileKind(extension);

  if (fileKind === "image") {
    return (
      <span
        className={`${styles.fileTypeGlyph} ${styles.fileTypeGlyphImage}`}
        data-size={glyphSize}
        aria-hidden="true"
      >
        <ImageFileIcon size={size} />
      </span>
    );
  }

  if (fileKind === "pdf") {
    return <PdfFileIcon size={size} aria-hidden="true" />;
  }

  if (fileKind === "spreadsheet") {
    return <SpreadsheetFileIcon size={size} aria-hidden="true" />;
  }

  const typeLabel = fileKind === "drawing" ? "DWG" : null;
  const Icon =
    fileKind === "archive" ? FileArchive : fileKind === "document" ? FileText : File;

  return (
    <span className={styles.fileTypeGlyph} data-size={glyphSize} aria-hidden="true">
      <Icon size={size} strokeWidth={1.75} />
      {typeLabel ? <small>{typeLabel}</small> : null}
    </span>
  );
}

function Avatar({ name, avatarUrl }: { name: string; avatarUrl?: string }) {
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span className={styles.avatar} aria-hidden="true">
      {avatarUrl ? (
        <Image src={avatarUrl} alt="" width={24} height={24} unoptimized />
      ) : (
        initials
      )}
    </span>
  );
}

interface DocumentActionsMenuProps {
  document: ProjectDocument;
  open: boolean;
  canStar: boolean;
  onToggle: () => void;
  onClose: () => void;
  onPreview: () => void;
  onStar: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
}

function DocumentActionsMenu({
  document,
  open,
  canStar,
  onToggle,
  onClose,
  onPreview,
  onStar,
  onArchive,
  onDelete,
}: DocumentActionsMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: globalThis.PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  const stop = (event: MouseEvent) => event.stopPropagation();
  return (
    <div ref={menuRef} className={styles.actionsMenuWrap} onClick={stop}>
      <button
        type="button"
        className={styles.moreButton}
        aria-label={`Actions for ${document.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={onToggle}
      >
        <MoreHorizontal size={18} strokeWidth={1.75} aria-hidden="true" />
      </button>
      {open ? (
        <div className={styles.actionsMenu} role="menu">
          <button type="button" role="menuitem" onClick={onPreview}>
            <Eye size={15} strokeWidth={1.75} aria-hidden="true" /> Preview / Open
          </button>
          <button type="button" role="menuitem" onClick={onPreview}>
            <History size={15} strokeWidth={1.75} aria-hidden="true" /> View version history
          </button>
          {canStar ? (
            <button type="button" role="menuitem" onClick={onStar}>
              <Star
                size={15}
                strokeWidth={1.75}
                fill={document.isStarred ? "currentColor" : "none"}
                aria-hidden="true"
              />
              {document.isStarred ? "Unstar" : "Star"}
            </button>
          ) : null}
          {onArchive ? (
            <button type="button" role="menuitem" onClick={onArchive}>
              <Archive size={15} strokeWidth={1.75} aria-hidden="true" />
              {document.status === "archived" ? "Unarchive" : "Archive"}
            </button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              role="menuitem"
              className={styles.deleteMenuItem}
              onClick={onDelete}
            >
              <Trash2 size={15} strokeWidth={1.75} aria-hidden="true" />
              {document.isInBin ? "Restore from Bin" : "Delete"}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function DocumentPreviewDuotone({ extension }: { extension: string }) {
  const fileKind = getFileKind(extension);
  const ext = extension.toUpperCase();

  let accentColor = "#64748b";
  let tintColor = "#f1f5f9";
  let label = ext;

  if (fileKind === "pdf") {
    accentColor = "#e11d48";
    tintColor = "#ffe4e6";
    label = "PDF";
  } else if (fileKind === "drawing") {
    accentColor = "#2563eb";
    tintColor = "#dbeafe";
    label = "DWG";
  } else if (fileKind === "spreadsheet") {
    accentColor = "#059669";
    tintColor = "#d1fae5";
    label = "XLS";
  } else if (fileKind === "document") {
    accentColor = "#7c3aed";
    tintColor = "#ede9fe";
    label = "DOC";
  } else if (fileKind === "image") {
    accentColor = "#0284c7";
    tintColor = "#e0f2fe";
    label = ext;
  } else if (fileKind === "archive") {
    accentColor = "#475569";
    tintColor = "#e2e8f0";
    label = "ZIP";
  }

  return (
    <div className={styles.previewIllustration} aria-hidden="true">
      <svg
        width="44"
        height="50"
        viewBox="0 0 44 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Document base */}
        <path
          d="M6 3C4.34315 3 3 4.34315 3 6V44C3 45.6569 4.34315 47 6 47H38C39.6569 47 41 45.6569 41 44V15L29 3H6Z"
          fill="#ffffff"
          stroke="#e2e8f0"
          strokeWidth="1.5"
        />
        {/* Folded corner */}
        <path
          d="M29 3V12C29 13.6569 30.3431 15 32 15H41"
          fill={tintColor}
          stroke="#cbd5e1"
          strokeWidth="1.5"
        />
        {/* Decorative content lines */}
        <rect x="9" y="19" width="16" height="2.5" rx="1.25" fill={accentColor} opacity="0.4" />
        <rect x="9" y="24" width="22" height="2.5" rx="1.25" fill={accentColor} opacity="0.2" />
        <rect x="9" y="29" width="18" height="2.5" rx="1.25" fill={accentColor} opacity="0.2" />
        {/* Extension Pill */}
        <rect x="8" y="34.5" width="24" height="9" rx="3" fill={accentColor} />
        <text
          x="20"
          y="40"
          fill="#ffffff"
          fontSize="6.5"
          fontWeight="700"
          fontFamily="system-ui, -apple-system, sans-serif"
          textAnchor="middle"
          dominantBaseline="middle"
          letterSpacing="0.04em"
        >
          {label}
        </text>
      </svg>
    </div>
  );
}

interface DriveCollectionProps {
  documents: ProjectDocument[];
  folders: ProjectDocumentFolder[];
  viewMode: DriveViewMode;
  selectedDocumentIds: string[];
  canStar: boolean;
  onOpenDocument: (document: ProjectDocument) => void;
  onToggleStar: (document: ProjectDocument) => void;
  onArchiveDocument?: (document: ProjectDocument) => void;
  onDeleteDocument?: (document: ProjectDocument) => void;
}

export function DriveCollection({
  documents,
  folders,
  viewMode,
  selectedDocumentIds,
  canStar,
  onOpenDocument,
  onToggleStar,
  onArchiveDocument,
  onDeleteDocument,
}: DriveCollectionProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const folderNames = new Map(folders.map((folder) => [folder.id, folder.name]));

  const handleKeyDown = (
    event: KeyboardEvent<HTMLElement>,
    document: ProjectDocument,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpenDocument(document);
    }
  };

  const renderActions = (document: ProjectDocument) => (
    <DocumentActionsMenu
      document={document}
      open={openMenuId === document.id}
      canStar={canStar}
      onToggle={() =>
        setOpenMenuId((current) => (current === document.id ? null : document.id))
      }
      onClose={() => setOpenMenuId(null)}
      onPreview={() => {
        setOpenMenuId(null);
        onOpenDocument(document);
      }}
      onStar={() => {
        setOpenMenuId(null);
        onToggleStar(document);
      }}
      onArchive={
        onArchiveDocument
          ? () => {
              setOpenMenuId(null);
              onArchiveDocument(document);
            }
          : undefined
      }
      onDelete={
        onDeleteDocument
          ? () => {
              setOpenMenuId(null);
              onDeleteDocument(document);
            }
          : undefined
      }
    />
  );

  if (viewMode === "grid") {
    return (
      <div className={styles.documentGrid} aria-label="Documents in grid view">
        {documents.map((document) => {
          const selected = selectedDocumentIds.includes(document.id);
          const isMenuOpen = openMenuId === document.id;
          const imageFile = ["png", "jpg", "jpeg", "webp"].includes(document.extension);
          const fileKind = getFileKind(document.extension);
          const isNew = isDocumentNew(document);
          return (
            <article
              key={document.id}
              role="button"
              tabIndex={0}
              aria-pressed={selected}
              className={`${styles.documentCard} ${selected ? styles.documentCardSelected : ""} ${isMenuOpen ? styles.documentCardOpen : ""}`}
              onClick={() => onOpenDocument(document)}
              onKeyDown={(event) => handleKeyDown(event, document)}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardTitleRow}>
                  <h3>{document.name}</h3>
                  <DocumentStatusBadge status={document.status} size="compact" />
                </div>
                <div className={styles.cardMetaRow}>
                  <span>{folderNames.get(document.folderId ?? "") ?? "Unfiled"}</span>
                  <span className={styles.metaDot}>•</span>
                  <span>{formatFileSize(document.sizeBytes)}</span>
                  {isNew ? <span className={styles.newBadgeInline}>New</span> : null}
                </div>
              </div>
              <div className={styles.cardOverflowActions}>{renderActions(document)}</div>
              <div
                className={`${styles.cardPreview} ${styles[`preview_${fileKind}`] ?? ""}`}
                data-file-kind={fileKind}
              >
                {imageFile && document.thumbnailUrl ? (
                  <Image
                    src={document.thumbnailUrl}
                    alt={`Preview of ${document.name}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 320px"
                    unoptimized
                  />
                ) : (
                  <DocumentPreviewDuotone extension={document.extension} />
                )}
              </div>
              <footer className={styles.cardFooter}>
                <time dateTime={document.updatedAt}>
                  {formatDocumentDate(document.updatedAt)}
                </time>
                <span className={styles.contributor}>
                  <Avatar name={document.owner.name} avatarUrl={document.owner.avatarUrl} />
                  <span>{document.owner.name}</span>
                </span>
              </footer>
            </article>
          );
        })}
      </div>
    );
  }

  // ── List view ──────────────────────────────────────────────────────────────
  // Uses a semantic <colgroup> so column widths are set on <col> elements,
  // which is the correct mechanism for table-layout: fixed tables.
  // minmax() and fr units are Grid-only and must not appear in width values.
  return (
    <>
      <div className={styles.documentTableScroll}>
        <table className={styles.documentTable}>
          <colgroup>
            <col className={styles.fileColumn} />
            <col className={styles.disciplineColumn} />
            <col className={styles.statusColumn} />
            <col className={styles.revisionColumn} />
            <col className={styles.updatedColumn} />
            <col className={styles.updatedByColumn} />
            <col className={styles.actionsColumn} />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">File</th>
              <th scope="col">Discipline</th>
              <th scope="col">Status</th>
              <th scope="col">Revision</th>
              <th scope="col">Updated</th>
              <th scope="col">Updated by</th>
              <th scope="col">
                <span className={styles.visuallyHidden}>Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {documents.map((document) => {
              const selected = selectedDocumentIds.includes(document.id);
              const isNew = isDocumentNew(document);
              return (
                <tr
                  key={document.id}
                  tabIndex={0}
                  aria-selected={selected}
                  className={`${selected ? styles.documentRowSelected : ""} ${openMenuId === document.id ? styles.documentRowOpen : ""}`.trim() || undefined}
                  onClick={() => onOpenDocument(document)}
                  onKeyDown={(event) => handleKeyDown(event, document)}
                >
                  <td>
                    <div className={styles.fileCell}>
                      <span
                        className={`${styles.fileIcon} ${styles[`fileIcon_${document.extension}`] ?? ""}`}
                      >
                        <FileTypeIcon extension={document.extension} />
                      </span>
                      <span className={styles.fileNameBlock}>
                        <span className={styles.fileNameLine}>
                          <strong title={document.name}>{document.name}</strong>
                          {isNew ? (
                            <span className={styles.newBadge}>New</span>
                          ) : null}
                        </span>
                        <span>{formatFileSize(document.sizeBytes)}</span>
                      </span>
                    </div>
                  </td>
                  <td>{folderNames.get(document.folderId ?? "") ?? "Unfiled"}</td>
                  <td>
                    <DocumentStatusBadge status={document.status} />
                  </td>
                  <td>R{String(document.version).padStart(2, "0")}</td>
                  <td>
                    <time dateTime={document.updatedAt}>
                      {formatDocumentDate(document.updatedAt)}
                    </time>
                  </td>
                  <td>
                    <span className={styles.contributor}>
                      <Avatar
                        name={document.owner.name}
                        avatarUrl={document.owner.avatarUrl}
                      />
                      <span>{document.owner.name}</span>
                    </span>
                  </td>
                  <td>{renderActions(document)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div
        className={styles.mobileDocumentList}
        aria-label="Documents in compact list view"
      >
        {documents.map((document) => (
          <article
            key={document.id}
            role="button"
            tabIndex={0}
            aria-pressed={selectedDocumentIds.includes(document.id)}
            className={styles.mobileDocumentCard}
            onClick={() => onOpenDocument(document)}
            onKeyDown={(event) => handleKeyDown(event, document)}
          >
            <span
              className={`${styles.fileIcon} ${styles[`fileIcon_${document.extension}`] ?? ""}`}
            >
              <FileTypeIcon extension={document.extension} />
            </span>
            <div className={styles.mobileDocumentBody}>
              <strong title={document.name}>{document.name}</strong>
              <span>
                {folderNames.get(document.folderId ?? "") ?? "Unfiled"} · R
                {String(document.version).padStart(2, "0")}
              </span>
              <div>
                <DocumentStatusBadge status={document.status} />
                <span>{formatDocumentDate(document.updatedAt)}</span>
              </div>
            </div>
            {renderActions(document)}
          </article>
        ))}
      </div>
    </>
  );
}

export interface DrivePaginationModel {
  page: number;
  pageSize: number;
  pageCount: number;
  totalItems: number;
  startItem: number;
  endItem: number;
}

interface DrivePaginationProps {
  model: DrivePaginationModel;
  onPageChange: (page: number) => void;
}

function getPageNumbers(
  currentPage: number,
  pageCount: number,
): Array<number | "..."> {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }
  const pages: Array<number | "..."> = [];
  pages.push(1);

  if (currentPage > 3) {
    pages.push("...");
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(pageCount - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    if (!pages.includes(i)) pages.push(i);
  }

  if (currentPage < pageCount - 2) {
    pages.push("...");
  }

  if (!pages.includes(pageCount)) {
    pages.push(pageCount);
  }

  return pages;
}

export function DrivePagination({ model, onPageChange }: DrivePaginationProps) {
  const { page, pageCount, totalItems, startItem, endItem } = model;
  const pageNumbers = getPageNumbers(page, pageCount);

  return (
    <nav className={styles.pagination} aria-label="Document pages">
      <p>
        Showing {startItem}–{endItem} of {totalItems} files
      </p>
      {pageCount > 1 ? (
        <div className={styles.paginationControls}>
          <button
            type="button"
            disabled={page <= 1}
            aria-label="Previous page"
            onClick={() => {
              if (page > 1) onPageChange(page - 1);
            }}
          >
            <ChevronLeft size={14} strokeWidth={1.75} aria-hidden="true" />
          </button>
          {pageNumbers.map((item, idx) => {
            if (item === "...") {
              return (
                <span key={`ellipsis-${idx}`} className={styles.paginationEllipsis}>
                  …
                </span>
              );
            }
            return (
              <button
                key={item}
                type="button"
                aria-current={item === page ? "page" : undefined}
                aria-label={`Page ${item}`}
                onClick={() => onPageChange(item)}
              >
                {item}
              </button>
            );
          })}
          <button
            type="button"
            disabled={page >= pageCount}
            aria-label="Next page"
            onClick={() => {
              if (page < pageCount) onPageChange(page + 1);
            }}
          >
            <ChevronRight size={14} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </nav>
  );
}
