"use client";

import {
  AlertCircle,
  CheckCircle2,
  Database,
  FileText,
  Folder,
  History,
  Upload,
  X,
} from "lucide-react";
import { DragEvent, FormEvent, ReactNode, useEffect, useRef, useState } from "react";

import {
  ProjectDocument,
  ProjectDocumentFolder,
  ProjectDocumentUploadProgress,
  ProjectDocumentUploadResult,
} from "@/types/domain/project-document";

import {
  DocumentStatusBadge,
  formatDocumentDate,
  formatFileSize,
} from "./drive-collection";
import styles from "./project-documents-workspace.module.css";

function useEscape(onClose: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, onClose]);
}

function DialogFrame({
  title,
  description,
  children,
  onClose,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
}) {
  useEscape(onClose);
  return (
    <div className={styles.dialogBackdrop} role="presentation" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="drive-dialog-title"
        className={styles.dialog}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className={styles.dialogHeader}>
          <div>
            <h2 id="drive-dialog-title">{title}</h2>
            {description ? <p>{description}</p> : null}
          </div>
          <button type="button" aria-label={`Close ${title}`} onClick={onClose}>
            <X size={18} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

interface NewFolderDialogProps {
  parentName: string;
  existingNames: string[];
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
}

export function NewFolderDialog({
  parentName,
  existingNames,
  onClose,
  onCreate,
}: NewFolderDialogProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => inputRef.current?.focus(), []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Enter a folder name.");
      return;
    }
    if (existingNames.some((candidate) => candidate.toLocaleLowerCase() === trimmedName.toLocaleLowerCase())) {
      setError("A folder with this name already exists here.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onCreate(trimmedName);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The folder could not be created.");
      setSaving(false);
    }
  };

  return (
    <DialogFrame
      title="New folder"
      description={`Create inside ${parentName}.`}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className={styles.dialogBody}>
        <label className={styles.fieldLabel}>
          Folder name
          <input
            ref={inputRef}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError("");
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "new-folder-error" : undefined}
            placeholder="e.g. Material approvals"
          />
        </label>
        {error ? <p id="new-folder-error" className={styles.fieldError}>{error}</p> : null}
        <footer className={styles.dialogFooter}>
          <button type="button" className={styles.secondaryButton} onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className={styles.primaryButton} disabled={saving}>
            <Folder size={18} strokeWidth={1.75} aria-hidden="true" />
            {saving ? "Creating..." : "Create folder"}
          </button>
        </footer>
      </form>
    </DialogFrame>
  );
}

interface UploadFilesDialogProps {
  folderName: string;
  onClose: () => void;
  onUpload: (
    files: File[],
    onProgress: (progress: ProjectDocumentUploadProgress) => void,
  ) => Promise<ProjectDocumentUploadResult>;
}

export function UploadFilesDialog({ folderName, onClose, onUpload }: UploadFilesDialogProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<Record<string, ProjectDocumentUploadProgress>>({});
  const [uploading, setUploading] = useState(false);
  const [complete, setComplete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: File[]) => {
    setFiles((current) => {
      const keys = new Set(current.map((file) => `${file.name}:${file.size}`));
      return [...current, ...incoming.filter((file) => !keys.has(`${file.name}:${file.size}`))];
    });
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    addFiles(Array.from(event.dataTransfer.files));
  };

  const handleUpload = async () => {
    if (!files.length) return;
    setUploading(true);
    const result = await onUpload(files, (item) => {
      setProgress((current) => ({ ...current, [item.fileName]: item }));
    });
    setUploading(false);
    setComplete(result.uploaded.length > 0 && result.failures.length === 0);
  };

  return (
    <DialogFrame
      title="Upload files"
      description={`Files will be uploaded to ${folderName}. Maximum 25 MB per file.`}
      onClose={uploading ? () => undefined : onClose}
    >
      <div className={styles.dialogBody}>
        <div
          className={styles.uploadDropzone}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
        >
          <Upload size={24} strokeWidth={1.75} aria-hidden="true" />
          <strong>Drop files here</strong>
          <span>or choose files from your device</span>
          <button type="button" className={styles.secondaryButton} onClick={() => inputRef.current?.click()}>
            Choose files
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            hidden
            onChange={(event) => addFiles(Array.from(event.target.files ?? []))}
          />
        </div>

        {files.length ? (
          <ul className={styles.uploadList} aria-label="Files selected for upload">
            {files.map((file) => {
              const item = progress[file.name];
              return (
                <li key={`${file.name}:${file.size}`}>
                  <FileText size={18} strokeWidth={1.75} aria-hidden="true" />
                  <span className={styles.uploadFileName}>
                    <strong>{file.name}</strong>
                    <span>{formatFileSize(file.size)}</span>
                  </span>
                  {item ? (
                    <span className={`${styles.uploadState} ${styles[`upload_${item.state}`]}`}>
                      {item.state === "complete" ? <CheckCircle2 size={16} strokeWidth={1.75} /> : null}
                      {item.state === "failed" ? <AlertCircle size={16} strokeWidth={1.75} /> : null}
                      {item.state === "failed" ? item.error : `${item.progress}%`}
                    </span>
                  ) : (
                    <button
                      type="button"
                      aria-label={`Remove ${file.name}`}
                      className={styles.removeUploadButton}
                      onClick={() => setFiles((current) => current.filter((candidate) => candidate !== file))}
                    >
                      <X size={18} strokeWidth={1.75} />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        ) : null}

        {complete ? <p className={styles.uploadSuccess}>All files were confirmed by the document repository.</p> : null}
        <footer className={styles.dialogFooter}>
          <button type="button" className={styles.secondaryButton} onClick={onClose} disabled={uploading}>
            {complete ? "Close" : "Cancel"}
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            disabled={!files.length || uploading || complete}
            onClick={handleUpload}
          >
            <Upload size={18} strokeWidth={1.75} aria-hidden="true" />
            {uploading ? "Uploading..." : "Upload files"}
          </button>
        </footer>
      </div>
    </DialogFrame>
  );
}

interface DocumentPreviewDrawerProps {
  document: ProjectDocument;
  folder?: ProjectDocumentFolder;
  onClose: () => void;
}

export function DocumentPreviewDrawer({ document, folder, onClose }: DocumentPreviewDrawerProps) {
  useEscape(onClose);
  return (
    <div className={styles.drawerLayer} role="presentation" onMouseDown={onClose}>
      <aside
        className={styles.previewDrawer}
        role="dialog"
        aria-modal="true"
        aria-label={`Document details for ${document.name}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className={styles.drawerHeader}>
          <div>
            <span>Document details</span>
            <strong title={document.name}>{document.name}</strong>
          </div>
          <button type="button" aria-label="Close document details" onClick={onClose}>
            <X size={18} strokeWidth={1.75} />
          </button>
        </header>
        <div className={styles.drawerBody}>
          <div className={styles.drawerPreview}>
            <FileText size={34} strokeWidth={1.75} aria-hidden="true" />
            <span>{document.extension.toUpperCase()} preview</span>
          </div>
          <div className={styles.drawerTitleBlock}>
            <h2>{document.name}</h2>
            <DocumentStatusBadge status={document.status} />
          </div>
          {document.status === "approved" ? (
            <p className={styles.lockedNotice}>
              Approved documents are locked. Create a new revision to make changes.
            </p>
          ) : null}
          <section className={styles.drawerSection}>
            <h3>Metadata</h3>
            <dl className={styles.metadataList}>
              <div><dt>Folder</dt><dd>{folder?.name ?? "Unfiled"}</dd></div>
              <div><dt>Discipline</dt><dd>{folder?.name ?? "Unfiled"}</dd></div>
              <div><dt>Status</dt><dd>{document.status.replaceAll("_", " ")}</dd></div>
              <div><dt>Revision</dt><dd>R{String(document.version).padStart(2, "0")}</dd></div>
              <div><dt>Size</dt><dd>{formatFileSize(document.sizeBytes)}</dd></div>
              <div><dt>Uploaded by</dt><dd>{document.owner.name}</dd></div>
              <div><dt>Updated by</dt><dd>{document.owner.name}</dd></div>
              <div><dt>Created</dt><dd>{formatDocumentDate(document.createdAt)}</dd></div>
              <div><dt>Updated</dt><dd>{formatDocumentDate(document.updatedAt)}</dd></div>
            </dl>
          </section>
          <section className={styles.drawerSection}>
            <h3><History size={16} strokeWidth={1.75} aria-hidden="true" /> Version history</h3>
            <ol className={styles.versionList}>
              {document.versions.map((version) => (
                <li key={version.version}>
                  <span>R{String(version.version).padStart(2, "0")}</span>
                  <div>
                    <strong>{version.createdBy}</strong>
                    <time dateTime={version.createdAt}>{formatDocumentDate(version.createdAt)}</time>
                  </div>
                  <span>{formatFileSize(version.sizeBytes)}</span>
                </li>
              ))}
            </ol>
          </section>
          <section className={styles.drawerSection}>
            <h3>Recent activity</h3>
            <ol className={styles.activityList}>
              {document.recentActivity.map((activity) => (
                <li key={activity.id}>
                  <span className={styles.activityMarker} aria-hidden="true" />
                  <div>
                    <strong>{activity.action}</strong>
                    <span>{activity.actorName} · {formatDocumentDate(activity.createdAt)}</span>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </aside>
    </div>
  );
}

export function StorageDialog({ usedBytes, onClose }: { usedBytes: number; onClose: () => void }) {
  const limitBytes = 10 * 1024 * 1024 * 1024;
  const percent = Math.min(100, Math.round((usedBytes / limitBytes) * 100));
  return (
    <DialogFrame title="Drive storage" description="Project document storage usage." onClose={onClose}>
      <div className={styles.dialogBody}>
        <div className={styles.storageSummary}>
          <Database size={24} strokeWidth={1.75} aria-hidden="true" />
          <div><strong>{formatFileSize(usedBytes)} used</strong><span>of 10 GB available</span></div>
        </div>
        <div className={styles.storageTrack} aria-label={`${percent}% of storage used`}>
          <span style={{ width: `${percent}%` }} />
        </div>
        <footer className={styles.dialogFooter}>
          <button type="button" className={styles.primaryButton} onClick={onClose}>Done</button>
        </footer>
      </div>
    </DialogFrame>
  );
}
