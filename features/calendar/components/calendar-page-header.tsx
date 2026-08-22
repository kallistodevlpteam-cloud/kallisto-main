"use client";

import React, { useState, useRef, useEffect } from "react";
import { Plus, ChevronDown, CheckSquare, Flag, Search } from "lucide-react";
import { CalendarDuotoneIcon } from "@/components/layout/sidebar-icons";
import { CalendarTabId } from "../hooks/use-calendar-query-state";
import styles from "./calendar-page-header.module.css";

interface CalendarPageHeaderProps {
  activeTab: CalendarTabId;
  selectedDate: string;
  onTabChange: (tab: CalendarTabId) => void;
  onOpenAddModal: (creationType: "schedule_event" | "add_task" | "add_milestone") => void;
}

export function CalendarPageHeader({
  activeTab,
  selectedDate,
  onTabChange,
  onOpenAddModal,
}: CalendarPageHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectCreation = (type: "schedule_event" | "add_task" | "add_milestone") => {
    setDropdownOpen(false);
    onOpenAddModal(type);
  };

  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${selectedDate}T12:00:00`));

  return (
    <div className={styles.headerContainer}>
      {/* Top Header Bar */}
      <div className={styles.topHeader}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>Schedule</h1>
          <div className={styles.subDateRow}>
            <CalendarDuotoneIcon size={15} className={styles.subDateIcon} />
            <span>{formattedDate}</span>
          </div>
        </div>

        <div className={styles.centerSearch}>
          <div className={styles.searchInputWrap}>
            <Search size={14} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search schedule..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.headerRightActions}>
          {/* View Switcher Pills */}
          <div className={styles.viewSwitcherGroup} role="tablist">
            <button
              type="button"
              className={`${styles.viewSwitcherBtn} ${activeTab === "today" ? styles.viewSwitcherBtnActive : ""}`}
              onClick={() => onTabChange("today")}
            >
              Day
            </button>
            <button
              type="button"
              className={`${styles.viewSwitcherBtn} ${activeTab === "calendar" ? styles.viewSwitcherBtnActive : ""}`}
              onClick={() => onTabChange("calendar")}
            >
              Calendar
            </button>
            <button
              type="button"
              className={`${styles.viewSwitcherBtn} ${activeTab === "gantt" ? styles.viewSwitcherBtnActive : ""}`}
              onClick={() => onTabChange("gantt")}
            >
              Gantt
            </button>
          </div>

          <div className={styles.actionGroup} ref={dropdownRef}>
            <button
              type="button"
              className={styles.addMilestoneBtn}
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <Plus size={15} />
              <span>Add Milestone</span>
            </button>

            {dropdownOpen && (
              <div className={styles.dropdownMenu} role="menu">
                <button
                  type="button"
                  className={styles.dropdownItem}
                  role="menuitem"
                  onClick={() => handleSelectCreation("add_milestone")}
                >
                  <Flag size={16} className={styles.itemIconMilestone} />
                  <div className={styles.itemText}>
                    <span className={styles.itemTitle}>Add milestone</span>
                    <span className={styles.itemDesc}>Key phase sign-off or target</span>
                  </div>
                </button>

                <button
                  type="button"
                  className={styles.dropdownItem}
                  role="menuitem"
                  onClick={() => handleSelectCreation("schedule_event")}
                >
                  <CalendarDuotoneIcon size={16} className={styles.itemIconEvent} />
                  <div className={styles.itemText}>
                    <span className={styles.itemTitle}>Schedule event</span>
                    <span className={styles.itemDesc}>Site visit, meeting, or appointment</span>
                  </div>
                </button>

                <button
                  type="button"
                  className={styles.dropdownItem}
                  role="menuitem"
                  onClick={() => handleSelectCreation("add_task")}
                >
                  <CheckSquare size={16} className={styles.itemIconTask} />
                  <div className={styles.itemText}>
                    <span className={styles.itemTitle}>Add task</span>
                    <span className={styles.itemDesc}>Project task or deliverable</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
