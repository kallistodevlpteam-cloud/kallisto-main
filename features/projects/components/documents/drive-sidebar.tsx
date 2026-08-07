"use client";

import {
  Archive,
  Folder,
  FolderOpen,
  HardDrive,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { ProjectDocumentFolder } from "@/types/domain/project-document";

import styles from "./project-documents-workspace.module.css";

interface DriveSidebarProps {
  folders: ProjectDocumentFolder[];
  selectedFolderId: string;
  searchValue: string;
  isOpen: boolean;
  onSearchChange: (value: string) => void;
  onSelectFolder: (folderId: string) => void;
  onStorage: () => void;
  onClose: () => void;
}

const primaryFolderIds = ["drawings", "approvals", "contracts", "site-reports"];

export function DriveSidebar({
  folders,
  selectedFolderId,
  searchValue,
  isOpen,
  onSearchChange,
  onSelectFolder,
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
      label: folderMap.get(id)?.name ?? (id === "site-reports" ? "Site Reports" : id.charAt(0).toUpperCase() + id.slice(1)),
      count: folderMap.get(id)?.count ?? 0,
    })),
    { id: "more", label: "More Folders", count: moreCount },
  ];

  return (
    <>
      {isOpen ? (
        <button
          type="button"
          aria-label="Close folder navigation"
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
        <label className={styles.sidebarSearch}>
          <Search size={18} strokeWidth={1.75} aria-hidden="true" className={styles.searchIcon} />
          <span className={styles.visuallyHidden}>Search documents</span>
          <input
            type="search"
            value={searchValue}
            placeholder="Search here..."
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>

        <div className={styles.sidebarSection}>
          <p className={styles.sidebarLabel}>FOLDERS</p>
          <nav aria-label="Project folders" className={styles.sidebarNavigation}>
            {navigation.map((folder) => {
              const selected = selectedFolderId === folder.id;
              const Icon = selected ? FolderOpen : Folder;
              return (
                <button
                  key={folder.id}
                  type="button"
                  className={selected ? styles.sidebarItemActive : styles.sidebarItem}
                  aria-current={selected ? "page" : undefined}
                  onClick={() => onSelectFolder(folder.id)}
                >
                  <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
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
              <Archive size={18} strokeWidth={1.75} aria-hidden="true" />
              <span>Archive</span>
            </button>
            <button
              type="button"
              className={selectedFolderId === "bin" ? styles.sidebarItemActive : styles.sidebarItem}
              aria-current={selectedFolderId === "bin" ? "page" : undefined}
              onClick={() => onSelectFolder("bin")}
            >
              <Trash2 size={18} strokeWidth={1.75} aria-hidden="true" />
              <span>Bin</span>
            </button>
            <button type="button" className={styles.sidebarItem} onClick={onStorage}>
              <HardDrive size={18} strokeWidth={1.75} aria-hidden="true" />
              <span>Storage</span>
            </button>
          </nav>
        </div>
      </aside>
    </>
  );
}
