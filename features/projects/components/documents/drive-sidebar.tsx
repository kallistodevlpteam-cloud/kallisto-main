"use client";

import { X } from "lucide-react";

import {
  AllDocumentsDuotoneIcon,
  SharedWithMeDuotoneIcon,
  StarredDuotoneIcon,
  DrawingsSectionDuotoneIcon,
  DocumentsSectionDuotoneIcon,
  ApprovalsSectionDuotoneIcon,
  ContractsSectionDuotoneIcon,
  SiteReportsSectionDuotoneIcon,
  RenderingsSectionDuotoneIcon,
  MoreFoldersSectionDuotoneIcon,
  ArchiveSystemDuotoneIcon,
  BinSystemDuotoneIcon,
} from "@/components/layout/sidebar-icons";

import { ProjectDocumentFolder } from "@/types/domain/project-document";
import { DriveScope } from "./drive-query-state";

import styles from "./project-documents-workspace.module.css";

interface DriveSidebarProps {
  folders: ProjectDocumentFolder[];
  selectedFolderId: string;
  scope?: DriveScope;
  counts?: Partial<Record<DriveScope, number>>;
  searchValue?: string;
  isOpen: boolean;
  onSearchChange?: (value: string) => void;
  onSelectFolder: (folderId: string) => void;
  onSelectScope?: (scope: DriveScope) => void;
  onStorage?: () => void;
  onClose: () => void;
}

const primaryFolderIds = [
  "drawings",
  "documents",
  "approvals",
  "contracts",
  "site-reports",
  "renderings",
];

const SECTION_ICON_MAP: Record<string, React.ComponentType<{ size?: number | string; className?: string }>> = {
  drawings: DrawingsSectionDuotoneIcon,
  documents: DocumentsSectionDuotoneIcon,
  approvals: ApprovalsSectionDuotoneIcon,
  contracts: ContractsSectionDuotoneIcon,
  "site-reports": SiteReportsSectionDuotoneIcon,
  renderings: RenderingsSectionDuotoneIcon,
  more: MoreFoldersSectionDuotoneIcon,
};

export function DriveSidebar({
  folders,
  selectedFolderId,
  scope = "all",
  counts,
  searchValue = "",
  isOpen,
  onSearchChange,
  onSelectFolder,
  onSelectScope,
  onStorage,
  onClose,
}: DriveSidebarProps) {
  const folderMap = new Map(folders.map((folder) => [folder.id, folder]));
  const moreCount = folders
    .filter((folder) => !primaryFolderIds.includes(folder.id))
    .reduce((total, folder) => total + folder.count, 0);

  const navigation = [
    ...primaryFolderIds.map((id) => ({
      id,
      label:
        folderMap.get(id)?.name ??
        (id === "site-reports"
          ? "Site Reports"
          : id === "renderings"
          ? "Renderings"
          : id === "documents"
          ? "Documents"
          : id.charAt(0).toUpperCase() + id.slice(1)),
      count: folderMap.get(id)?.count ?? 0,
      icon: SECTION_ICON_MAP[id] || MoreFoldersSectionDuotoneIcon,
    })),
    { id: "more", label: "More Folders", count: moreCount, icon: SECTION_ICON_MAP.more },
  ];

  const handleScopeClick = (targetScope: DriveScope) => {
    if (onSelectScope) {
      onSelectScope(targetScope);
    } else {
      onSelectFolder("all");
    }
  };

  return (
    <>
      {isOpen ? (
        <div
          role="presentation"
          aria-hidden="true"
          className={styles.sidebarScrim}
          onClick={onClose}
        />
      ) : null}
      <aside
        className={`${styles.driveSidebar} ${isOpen ? styles.driveSidebarOpen : ""}`}
        aria-label="Drive folders and system locations"
      >
        <div className={styles.sidebarMobileHeader}>
          <strong>Drive navigation</strong>
          <button type="button" aria-label="Close folder navigation" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.sidebarSection}>
          <nav aria-label="Document scopes" className={styles.sidebarNavigation}>
            <button
              type="button"
              className={scope === "all" && selectedFolderId === "all" ? styles.sidebarItemActive : styles.sidebarItem}
              aria-current={scope === "all" && selectedFolderId === "all" ? "page" : undefined}
              onClick={() => handleScopeClick("all")}
            >
              <AllDocumentsDuotoneIcon size={17} className={scope === "all" && selectedFolderId === "all" ? styles.sectionIconActive : styles.sectionIcon} aria-hidden="true" />
              <span>All Documents</span>
              {counts?.all !== undefined ? <span className={styles.folderCountBadge}>{counts.all}</span> : null}
            </button>
            <button
              type="button"
              className={scope === "shared" && selectedFolderId === "all" ? styles.sidebarItemActive : styles.sidebarItem}
              aria-current={scope === "shared" && selectedFolderId === "all" ? "page" : undefined}
              onClick={() => handleScopeClick("shared")}
            >
              <SharedWithMeDuotoneIcon size={17} className={scope === "shared" && selectedFolderId === "all" ? styles.sectionIconActive : styles.sectionIcon} aria-hidden="true" />
              <span>Shared with me</span>
              {counts?.shared !== undefined ? <span className={styles.folderCountBadge}>{counts.shared}</span> : null}
            </button>
            <button
              type="button"
              className={scope === "starred" && selectedFolderId === "all" ? styles.sidebarItemActive : styles.sidebarItem}
              aria-current={scope === "starred" && selectedFolderId === "all" ? "page" : undefined}
              onClick={() => handleScopeClick("starred")}
            >
              <StarredDuotoneIcon size={17} className={scope === "starred" && selectedFolderId === "all" ? styles.sectionIconActive : styles.sectionIcon} aria-hidden="true" />
              <span>Starred</span>
              {counts?.starred !== undefined ? <span className={styles.folderCountBadge}>{counts.starred}</span> : null}
            </button>
          </nav>
        </div>

        <div className={styles.sidebarSection}>
          <p className={styles.sidebarLabel}>SECTIONS</p>
          <nav aria-label="Project folders" className={styles.sidebarNavigation}>
            {navigation.map((folder) => {
              const selected = scope === "all" && selectedFolderId === folder.id;
              const Icon = folder.icon;
              return (
                <button
                  key={folder.id}
                  type="button"
                  className={selected ? styles.sidebarItemActive : styles.sidebarItem}
                  aria-current={selected ? "page" : undefined}
                  onClick={() => onSelectFolder(folder.id)}
                >
                  <Icon size={17} className={selected ? styles.sectionIconActive : styles.sectionIcon} aria-hidden="true" />
                  <span>{folder.label}</span>
                  <span className={styles.folderCountBadge}>{folder.count}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className={styles.sidebarSection}>
          <p className={styles.sidebarLabel}>SYSTEM</p>
          <nav aria-label="System folders" className={styles.sidebarNavigation}>
            <button
              type="button"
              className={selectedFolderId === "archive" ? styles.sidebarItemActive : styles.sidebarItem}
              aria-current={selectedFolderId === "archive" ? "page" : undefined}
              onClick={() => onSelectFolder("archive")}
            >
              <ArchiveSystemDuotoneIcon size={17} className={selectedFolderId === "archive" ? styles.sectionIconActive : styles.sectionIcon} aria-hidden="true" />
              <span>Archive</span>
            </button>
            <button
              type="button"
              className={selectedFolderId === "bin" ? styles.sidebarItemActive : styles.sidebarItem}
              aria-current={selectedFolderId === "bin" ? "page" : undefined}
              onClick={() => onSelectFolder("bin")}
            >
              <BinSystemDuotoneIcon size={17} className={selectedFolderId === "bin" ? styles.sectionIconActive : styles.sectionIcon} aria-hidden="true" />
              <span>Bin</span>
            </button>
          </nav>
        </div>
      </aside>
    </>
  );
}

