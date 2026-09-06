"use client";

import { AlertTriangle, FolderOpen, RefreshCw, WifiOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  projectDocumentRepository,
  ProjectDocumentRepository,
} from "@/services/repositories/project-document-repository";
import {
  ProjectDocument,
  ProjectDocumentFolder,
  ProjectDocumentWorkspaceData,
} from "@/types/domain/project-document";

import {
  DriveCollection,
  DrivePagination,
  DrivePaginationModel,
} from "./drive-collection";
import {
  DocumentPreviewDrawer,
  StorageDialog,
} from "./drive-dialogs";
import { DocumentsTitleRowActions } from "@/features/documents/components/documents-title-row-actions";
import { useDriveQueryState } from "./drive-query-state";
import { DriveSidebar } from "./drive-sidebar";
import { DriveToolbar } from "./drive-toolbar";
import {
  calculateAnchorPage,
  useResponsiveDrivePageSize,
} from "./use-responsive-drive-page-size";
import styles from "./project-documents-workspace.module.css";
interface ProjectDocumentsWorkspaceProps {
  projectId: string;
  projectCode: string;
  canViewDocuments?: boolean;
  canStarDocuments?: boolean;
  hideHeaderTitleRow?: boolean;
  repository?: ProjectDocumentRepository;
}

const primaryFolderIds = [
  "drawings",
  "documents",
  "approvals",
  "contracts",
  "site-reports",
  "renderings",
];

function matchesModifiedRange(updatedAt: string, range: string): boolean {
  if (range === "all") return true;
  const elapsed = Date.now() - new Date(updatedAt).getTime();
  const day = 24 * 60 * 60 * 1000;
  if (range === "today") return elapsed <= day;
  if (range === "week") return elapsed <= 7 * day;
  if (range === "month") return elapsed <= 30 * day;
  return elapsed > 30 * day;
}

function getFolderTitle(folderId: string, scope: string, folders: ProjectDocumentFolder[]): string {
  if (scope === "starred" && folderId === "all") return "Starred";
  if (scope === "shared" && folderId === "all") return "Shared with me";
  if (folderId === "all") return "All Documents";
  if (folderId === "more") return "More Folders";
  if (folderId === "archive") return "Archive";
  if (folderId === "bin") return "Bin";
  if (folderId === "drawings") return "Drawings";
  if (folderId === "documents") return "Documents";
  if (folderId === "approvals") return "Approvals";
  if (folderId === "contracts") return "Contracts";
  if (folderId === "site-reports") return "Site Reports";
  if (folderId === "renderings") return "Renderings";

  const found = folders.find((folder) => folder.id === folderId);
  if (found?.name) return found.name;

  return folderId
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getEmptyStateContent(
  searchQuery: string,
  hasActiveFilters: boolean,
  selectedFolderId: string,
): { heading: string; body: string } {
  if (searchQuery) {
    return {
      heading: "No search results",
      body: `No files match "${searchQuery}".`,
    };
  }
  if (hasActiveFilters) {
    return {
      heading: "No documents match these filters",
      body: "No documents match the selected filters.",
    };
  }
  if (selectedFolderId === "all") {
    return {
      heading: "No project files yet",
      body: "No project files have been published yet. Files shared through project updates will appear here.",
    };
  }
  return {
    heading: "This folder is empty",
    body: "This folder does not contain any published project files.",
  };
}

export function ProjectDocumentsWorkspace({
  projectId,
  projectCode,
  canViewDocuments = true,
  canStarDocuments,
  hideHeaderTitleRow = false,
  repository = projectDocumentRepository,
}: ProjectDocumentsWorkspaceProps) {
  const { query, updateQuery, setFilters } = useDriveQueryState();
  const [workspaceData, setWorkspaceData] = useState<ProjectDocumentWorkspaceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [searchInput, setSearchInput] = useState(query.searchQuery);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [storageOpen, setStorageOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<ProjectDocument | null>(null);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [announcement, setAnnouncement] = useState("");

  // ── Render-phase sync: keep searchInput aligned with external query changes ──
  const [prevSearchQuery, setPrevSearchQuery] = useState(query.searchQuery);
  if (query.searchQuery !== prevSearchQuery) {
    setPrevSearchQuery(query.searchQuery);
    setSearchInput(query.searchQuery);
  }

  // ── Width-only responsive page size via matchMedia ──────────────────────────
  const { pageSize } = useResponsiveDrivePageSize(query.viewMode);

  // Track the previous page size with state so we can detect breakpoint changes
  // during the current render cycle. Using state (not ref) avoids the
  // react-hooks/refs rule that forbids reading or writing refs during render.
  const [previousPageSize, setPreviousPageSize] = useState(pageSize);
  const pageSizeChanged = previousPageSize !== pageSize;
  if (pageSizeChanged) {
    setPreviousPageSize(pageSize);
  }

  const loadDocuments = async () => {
    if (!canViewDocuments) return;
    setIsLoading(true);
    setHasError(false);
    try {
      setWorkspaceData(await repository.listProjectDocuments(projectId));
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    if (!canViewDocuments) return;
    repository
      .listProjectDocuments(projectId)
      .then((data) => {
        if (!cancelled) {
          setWorkspaceData(data);
          setHasError(false);
        }
      })
      .catch(() => {
        if (!cancelled) setHasError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId, canViewDocuments, repository]);

  useEffect(() => {
    const syncConnection = () => setIsOnline(window.navigator.onLine);
    syncConnection();
    window.addEventListener("online", syncConnection);
    window.addEventListener("offline", syncConnection);
    return () => {
      window.removeEventListener("online", syncConnection);
      window.removeEventListener("offline", syncConnection);
    };
  }, []);

  // Debounced search update
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (searchInput !== query.searchQuery) {
        updateQuery({ searchQuery: searchInput }, { resetPage: true });
      }
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [searchInput, query.searchQuery, updateQuery]);

  const documents = useMemo(() => workspaceData?.documents ?? [], [workspaceData]);
  const folders = useMemo(() => workspaceData?.folders ?? [], [workspaceData]);
  const folderNames = useMemo(
    () => new Map(folders.map((folder) => [folder.id, folder.name])),
    [folders],
  );

  const typeOptions = useMemo(
    () =>
      Array.from(new Set(documents.map((document) => document.extension)))
        .sort()
        .map((extension) => ({ value: extension, label: extension.toUpperCase() })),
    [documents],
  );
  const peopleOptions = useMemo(() => {
    const owners = new Map<string, string>();
    documents.forEach((document) => {
      owners.set(document.owner.id, document.owner.name);
      document.sharedWith.forEach((person) => owners.set(person.id, person.name));
    });
    return Array.from(owners, ([value, label]) => ({ value, label })).sort((a, b) =>
      a.label.localeCompare(b.label),
    );
  }, [documents]);
  const sourceOptions = [
    { value: "team", label: "Project team" },
    { value: "client", label: "Client" },
    { value: "field", label: "Field team" },
    { value: "system", label: "System" },
  ];

  const filteredDocuments = useMemo(() => {
    const search = query.searchQuery.trim().toLocaleLowerCase();
    const result = documents.filter((document) => {
      if (query.selectedFolderId === "archive") {
        if (document.status !== "archived") return false;
      } else if (query.selectedFolderId === "bin") {
        if (!document.isInBin) return false;
      } else {
        if (document.status === "archived" || document.isInBin) return false;
        if (
          query.selectedFolderId === "more" &&
          (document.folderId === null || primaryFolderIds.includes(document.folderId))
        )
          return false;
        if (
          !["all", "more"].includes(query.selectedFolderId) &&
          document.folderId !== query.selectedFolderId
        )
          return false;
      }
      if (query.scope === "shared" && document.sharedWith.length === 0) return false;
      if (query.scope === "starred" && !document.isStarred) return false;
      if (
        search &&
        ![
          document.name,
          document.owner.name,
          folderNames.get(document.folderId ?? "") ?? "",
        ].some((value) => value.toLocaleLowerCase().includes(search))
      )
        return false;
      if (query.filters.types.length && !query.filters.types.includes(document.extension))
        return false;
      if (
        query.filters.people.length &&
        !query.filters.people.some(
          (personId) =>
            document.owner.id === personId ||
            document.sharedWith.some((person) => person.id === personId),
        )
      )
        return false;
      if (!matchesModifiedRange(document.updatedAt, query.filters.modifiedRange)) return false;
      if (query.filters.sources.length && !query.filters.sources.includes(document.source))
        return false;
      return true;
    });

    return result.sort((a, b) => {
      if (query.sort === "updated-desc") return Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
      if (query.sort === "updated-asc") return Date.parse(a.updatedAt) - Date.parse(b.updatedAt);
      if (query.sort === "name-asc") return a.name.localeCompare(b.name);
      if (query.sort === "name-desc") return b.name.localeCompare(a.name);
      if (query.sort === "size-desc") return b.sizeBytes - a.sizeBytes;
      return a.sizeBytes - b.sizeBytes;
    });
  }, [documents, folderNames, query]);

  // ── Deterministic single pagination calculation ─────────────────────────────
  const totalItems = filteredDocuments.length;
  const pageCount = totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize);
  const safePage = pageCount === 0 ? 1 : Math.min(Math.max(query.page, 1), pageCount);

  // Breakpoint transition: calculate the anchored page immediately (synchronous)
  // so the document slice is correct in this render without waiting for an effect.
  const breakpointPage = pageSizeChanged
    ? calculateAnchorPage({
        currentPage: safePage,
        previousPageSize,
        nextPageSize: pageSize,
        totalItems,
      })
    : safePage;

  const renderPage = Math.min(Math.max(breakpointPage, 1), Math.max(pageCount, 1));

  const startIndex = (renderPage - 1) * pageSize;
  const visibleDocuments = filteredDocuments.slice(startIndex, startIndex + pageSize);

  const paginationModel: DrivePaginationModel = {
    page: renderPage,
    pageSize,
    pageCount,
    totalItems,
    startItem: totalItems === 0 ? 0 : startIndex + 1,
    endItem: Math.min(totalItems, startIndex + pageSize),
  };

  // Persist corrected page to URL via replace (no browser-history entry).
  useEffect(() => {
    if (pageSizeChanged && renderPage !== query.page) {
      updateQuery({ page: renderPage }, { replace: true });
    } else if (!pageSizeChanged && query.page !== safePage && pageCount > 0) {
      updateQuery({ page: safePage }, { replace: true });
    }
  }, [pageSizeChanged, renderPage, safePage, query.page, pageCount, updateQuery]);

  // canStar is the only remaining capability gate: starring is a personal organisational action.
  const canStar =
    (canStarDocuments ?? true) && repository.capabilities.starDocuments;
  const selectedFolderTitle = getFolderTitle(query.selectedFolderId, query.scope, folders);

  const hasActiveFilters =
    query.filters.types.length > 0 ||
    query.filters.people.length > 0 ||
    query.filters.sources.length > 0 ||
    query.filters.modifiedRange !== "all";

  const openDocument = (document: ProjectDocument) => {
    setSelectedDocument(document);
    setSelectedDocumentIds([document.id]);
  };

  const toggleStar = async (document: ProjectDocument) => {
    if (!repository.setDocumentStarred) return;
    try {
      await repository.setDocumentStarred(projectId, document.id, !document.isStarred);
      setAnnouncement(
        `${document.isStarred ? "Removed" : "Added"} ${document.name} ${document.isStarred ? "from" : "to"} starred documents.`,
      );
      setWorkspaceData(await repository.listProjectDocuments(projectId));
    } catch {
      setAnnouncement(`${document.name} could not be updated.`);
    }
  };

  const toggleArchive = async (document: ProjectDocument) => {
    if (!repository.setDocumentArchived) return;
    const isArchived = document.status === "archived";
    try {
      await repository.setDocumentArchived(projectId, document.id, !isArchived);
      setAnnouncement(
        `${isArchived ? "Restored" : "Archived"} ${document.name}.`,
      );
      setWorkspaceData(await repository.listProjectDocuments(projectId));
    } catch {
      setAnnouncement(`${document.name} could not be updated.`);
    }
  };

  const toggleBin = async (document: ProjectDocument) => {
    if (!repository.setDocumentInBin) return;
    const isInBin = !!document.isInBin;
    try {
      await repository.setDocumentInBin(projectId, document.id, !isInBin);
      setAnnouncement(
        `${isInBin ? "Restored" : "Moved"} ${document.name} ${isInBin ? "from" : "to"} bin.`,
      );
      setWorkspaceData(await repository.listProjectDocuments(projectId));
    } catch {
      setAnnouncement(`${document.name} could not be updated.`);
    }
  };

  if (!canViewDocuments) {
    return (
      <section
        className={styles.documentsState}
        aria-labelledby="documents-permission-title"
      >
        <AlertTriangle size={25} strokeWidth={1.75} aria-hidden="true" />
        <h1 id="documents-permission-title">Document access restricted</h1>
        <p>
          You do not have permission to view documents for project {projectCode}.
        </p>
      </section>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.documentsLoading} aria-label="Loading project documents">
        <div className={styles.loadingHeader} />
        <div className={styles.loadingTabs} />
        <div className={styles.loadingWorkspace}>
          <div />
          <div />
        </div>
      </div>
    );
  }

  if (hasError || !workspaceData) {
    return (
      <section
        className={styles.documentsState}
        aria-labelledby="documents-error-title"
      >
        <AlertTriangle size={25} aria-hidden="true" />
        <h1 id="documents-error-title">Documents could not be loaded</h1>
        <p>The document repository did not return this project&apos;s workspace.</p>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => void loadDocuments()}
        >
          <RefreshCw size={18} strokeWidth={1.75} aria-hidden="true" /> Retry
        </button>
      </section>
    );
  }

  const emptyState = getEmptyStateContent(
    query.searchQuery,
    hasActiveFilters,
    query.selectedFolderId,
  );

  return (
    <section
      className={styles.documentsWorkspace}
      aria-label="Project documents workspace"
    >
      <p className={styles.visuallyHidden}>Project files published through updates</p>

      {!hideHeaderTitleRow ? (
        <header className={styles.compactDriveHeader}>
          <div className={styles.compactTitleRow}>
            <h1>Docs</h1>
            <DocumentsTitleRowActions />
          </div>
        </header>
      ) : (
        <div className={styles.compactTitleRow} style={{ display: "contents" }}>
          <h1 className="sr-only">Documents</h1>
        </div>
      )}

      {!isOnline ? (
        <div className={styles.offlineBanner} role="status">
          <WifiOff size={18} strokeWidth={1.75} aria-hidden="true" /> You are offline.
          Document changes are unavailable until the connection returns.
        </div>
      ) : null}

      <div className={styles.driveWorkspace}>
        <DriveSidebar
          folders={folders}
          selectedFolderId={query.selectedFolderId}
          scope={query.scope}
          counts={{
            all: documents.length,
            shared: documents.filter((d) => (d.sharedWith?.length ?? 0) > 0).length,
            starred: documents.filter((d) => d.isStarred).length,
          }}
          searchValue={searchInput}
          isOpen={sidebarOpen}
          onSearchChange={setSearchInput}
          onSelectScope={(scope) => {
            updateQuery({ scope, selectedFolderId: "all" }, { resetPage: true, replace: false });
            setSidebarOpen(false);
          }}
          onSelectFolder={(selectedFolderId) => {
            updateQuery({ selectedFolderId, scope: "all" }, { resetPage: true, replace: false });
            setSidebarOpen(false);
          }}
          onStorage={() => {
            setStorageOpen(true);
            setSidebarOpen(false);
          }}
          onClose={() => setSidebarOpen(false)}
        />

        <main className={styles.driveContent}>
          <DriveToolbar
            folderTitle={selectedFolderTitle}
            fileCount={totalItems}
            lastUpdatedAt={workspaceData.lastUpdatedAt}
            filters={query.filters}
            typeOptions={typeOptions}
            peopleOptions={peopleOptions}
            sourceOptions={sourceOptions}
            sort={query.sort}
            viewMode={query.viewMode}
            onFiltersChange={setFilters}
            onSortChange={(sort) => updateQuery({ sort }, { resetPage: true })}
            onViewChange={(viewMode) => updateQuery({ viewMode }, { resetPage: true })}
            onOpenSidebar={() => setSidebarOpen(true)}
          />

          <div className={styles.collectionViewport} data-drive-collection-viewport>
            {visibleDocuments.length ? (
              <DriveCollection
                documents={visibleDocuments}
                folders={folders}
                viewMode={query.viewMode}
                selectedDocumentIds={selectedDocumentIds}
                canStar={canStar}
                onOpenDocument={openDocument}
                onToggleStar={(document) => void toggleStar(document)}
                onArchiveDocument={(document) => void toggleArchive(document)}
                onDeleteDocument={(document) => void toggleBin(document)}
              />
            ) : (
              <div className={styles.emptyState}>
                <FolderOpen size={28} strokeWidth={1.75} aria-hidden="true" />
                <h3>{emptyState.heading}</h3>
                <p>{emptyState.body}</p>
              </div>
            )}
          </div>

          <DrivePagination
            model={paginationModel}
            onPageChange={(page) => updateQuery({ page }, { replace: false })}
          />
        </main>
      </div>

      {selectedDocument ? (
        <DocumentPreviewDrawer
          document={selectedDocument}
          folder={folders.find((folder) => folder.id === selectedDocument.folderId)}
          onClose={() => {
            setSelectedDocument(null);
            setSelectedDocumentIds([]);
          }}
        />
      ) : null}

      {storageOpen ? (
        <StorageDialog
          usedBytes={documents.reduce(
            (total, document) => total + document.sizeBytes,
            0,
          )}
          onClose={() => setStorageOpen(false)}
        />
      ) : null}

      <p className={styles.actionAnnouncement} aria-live="polite">
        {announcement}
      </p>
    </section>
  );
}
