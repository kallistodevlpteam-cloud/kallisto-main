"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, RefreshCw } from "lucide-react";
import {
  ProjectUpdate,
  ProjectUpdateCursor,
  CreateProjectUpdateInput,
} from "@/types/domain/project-update";
import { mockProjectUpdateRepository } from "@/services/repositories/mock-project-update-repository";
import { projectUpdatePublishingService, ProjectUpdateActor } from "@/services/project-update-publishing-service";
import {
  ProjectUpdateComposer,
  ProjectUpdateComposerRef,
} from "./project-update-composer";
import { ProjectUpdatePost } from "./project-update-post";
import styles from "../projects.module.css";

interface ProjectUpdatesFeedProps {
  projectId: string;
  composerRef?: React.RefObject<ProjectUpdateComposerRef | null>;
}

export function ProjectUpdatesFeed({ projectId, composerRef }: ProjectUpdatesFeedProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL State
  const initialTypeFilter = searchParams.get("updateType") || "all";
  const initialSort = (searchParams.get("sort") as "latest" | "oldest") || "latest";

  const [typeFilter, setTypeFilter] = useState<string>(initialTypeFilter);
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">(initialSort);

  // Feed Data State
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [nextCursor, setNextCursor] = useState<ProjectUpdateCursor | undefined>(undefined);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);



  // Sync state to URL search parameters
  const updateUrlParams = (filterVal: string, sortVal: "latest" | "oldest") => {
    const params = new URLSearchParams(searchParams.toString());
    if (filterVal === "all") {
      params.delete("updateType");
    } else {
      params.set("updateType", filterVal);
    }

    if (sortVal === "latest") {
      params.delete("sort");
    } else {
      params.set("sort", sortVal);
    }

    const query = params.toString() ? `?${params.toString()}` : "";
    router.push(`/projects/${projectId}${query}`, { scroll: false });
  };

  // Load feed items
  const fetchUpdates = useCallback(
    async (reset = true, currentCursor?: ProjectUpdateCursor) => {
      try {
        const page = await mockProjectUpdateRepository.list({
          projectId,
          typeFilter,
          sort: sortOrder,
          cursor: reset ? undefined : currentCursor,
          limit: 10,
        });

        if (reset) {
          setUpdates(page.items);
        } else {
          setUpdates((prev) => [...prev, ...page.items]);
        }

        setNextCursor(page.nextCursor);
        setHasMore(page.hasMore);
      } catch (err) {
        console.error("Failed to load project updates:", err);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [projectId, typeFilter, sortOrder]
  );

  useEffect(() => {
    let isMounted = true;
    mockProjectUpdateRepository
      .list({
        projectId,
        typeFilter,
        sort: sortOrder,
        limit: 10,
      })
      .then((page) => {
        if (isMounted) {
          setUpdates(page.items);
          setNextCursor(page.nextCursor);
          setHasMore(page.hasMore);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load project updates:", err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [projectId, typeFilter, sortOrder]);

  const handleFilterChange = (filterVal: string) => {
    setTypeFilter(filterVal);
    updateUrlParams(filterVal, sortOrder);
  };

  const handleSortToggle = () => {
    const newSort = sortOrder === "latest" ? "oldest" : "latest";
    setSortOrder(newSort);
    updateUrlParams(typeFilter, newSort);
  };

  const handleCreateUpdate = async (input: CreateProjectUpdateInput) => {
    const actor: ProjectUpdateActor = {
      userId: input.authorId || "usr-arjun",
      workspaceId: "ws-default",
      role: input.authorRole || "Project Manager",
      name: input.authorName || "Arjun Menon",
      avatarUrl: input.authorAvatar,
    };
    const result = await projectUpdatePublishingService.createAndPublish({
      update: input,
      actor,
    });
    setUpdates((prev) => [result.update, ...prev]);
  };

  const handleAcknowledge = async (updateId: string) => {
    try {
      const updated = await mockProjectUpdateRepository.acknowledge(updateId);
      setUpdates((prev) => prev.map((u) => (u.id === updateId ? updated : u)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (updateId: string) => {
    try {
      const updated = await mockProjectUpdateRepository.save(updateId);
      setUpdates((prev) => prev.map((u) => (u.id === updateId ? updated : u)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePin = async (updateId: string) => {
    try {
      await mockProjectUpdateRepository.togglePin(updateId);
      // Re-fetch to ensure pinned ordering applies cleanly
      fetchUpdates(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddReply = async (updateId: string, text: string) => {
    try {
      const result = await mockProjectUpdateRepository.createReply({
        updateId,
        authorId: "usr-arjun",
        authorName: "Arjun Menon",
        authorRole: "Project Manager",
        authorAvatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        body: text,
      });

      setUpdates((prev) => prev.map((u) => (u.id === updateId ? result.update : u)));
    } catch (err) {
      console.error(err);
    }
  };

  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setFilterDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filterTabs = [
    { label: "All updates", value: "all" },
    { label: "Milestones", value: "milestone" },
    { label: "Tasks", value: "task" },
    { label: "Documents", value: "document" },
    { label: "Approvals", value: "approval" },
    { label: "Site", value: "site" },
    { label: "Finance", value: "finance" },
  ];

  return (
    <div className={styles.projectUpdatesFeed}>
      {/* 1. Feed Sub-Toolbar & Single Dropdown Filter */}
      <div className={styles.feedSubToolbar}>
        <div className={styles.filterDropdownContainer} ref={filterDropdownRef}>
          <button
            type="button"
            className={`${styles.feedFilterChip} ${
              typeFilter !== "all" ? styles.feedFilterChipActive : ""
            }`}
            onClick={() => setFilterDropdownOpen((prev) => !prev)}
            aria-haspopup="true"
            aria-expanded={filterDropdownOpen}
          >
            <span>{filterTabs.find((t) => t.value === typeFilter)?.label || "All updates"}</span>
            <ChevronDown size={13} />
          </button>

          {filterDropdownOpen && (
            <div className={styles.filterDropdownContent} role="menu">
              {filterTabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  role="menuitem"
                  className={`${styles.filterDropdownItem} ${
                    typeFilter === tab.value ? styles.filterDropdownItemActive : ""
                  }`}
                  onClick={() => {
                    handleFilterChange(tab.value);
                    setFilterDropdownOpen(false);
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.feedSortControl}>
          <button
            type="button"
            className={styles.feedSortBtn}
            onClick={handleSortToggle}
            title="Toggle sort order"
          >
            <span>Sort: {sortOrder === "latest" ? "Latest" : "Oldest"}</span>
            <ChevronDown size={13} />
          </button>
        </div>
      </div>

      {/* 2. Continuous Feed Stream Surface (Composer + Stream Posts) */}
      <div className={styles.projectUpdatesStream}>
        <ProjectUpdateComposer
          ref={composerRef}
          projectId={projectId}
          onCreateUpdate={handleCreateUpdate}
        />
        {isLoading ? (
          <div className={styles.feedSkeletonContainer}>
            <div className={styles.feedSkeletonCard} />
            <div className={styles.feedSkeletonCard} />
            <div className={styles.feedSkeletonCard} />
          </div>
        ) : updates.length === 0 ? (
          <div className={styles.feedEmptyState}>
            <h4 className={styles.feedEmptyTitle}>No project updates yet</h4>
            <p className={styles.feedEmptyText}>
              Share the first milestone, document, decision or site report update with the project team.
            </p>
          </div>
        ) : (
          updates.map((update) => (
            <ProjectUpdatePost
              key={update.id}
              update={update}
              onAcknowledge={handleAcknowledge}
              onSave={handleSave}
              onTogglePin={handleTogglePin}
              onAddReply={handleAddReply}
            />
          ))
        )}
      </div>

      {/* 4. Cursor Pagination Load More */}
      {hasMore && !isLoading && (
        <div className={styles.feedLoadMoreContainer}>
          <button
            type="button"
            className={styles.feedLoadMoreBtn}
            onClick={() => fetchUpdates(false, nextCursor)}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Loading more...</span>
              </>
            ) : (
              <span>Load older updates</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
