"use client";

import React, { useState } from "react";
import {
  Bell,
  Settings,
  Check,
  ChevronRight,
  UserPlus,
  Users,
  Calendar,
  CheckCircle2,
  FileText,
  Folder,
  AlertCircle,
  HelpCircle,
  SlidersHorizontal,
  Clock,
} from "lucide-react";
import styles from "../styles/partner-notifications.module.css";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  subtext: string;
  timestamp: string;
  section: "action_required" | "recent_updates" | "projects_system";
  category: "requests" | "assignments" | "schedule" | "projects" | "system";
  actionRequiredTag?: boolean;
  iconBg: string;
  iconColor: string;
  iconType: "userPlus" | "users" | "calendar" | "check" | "fileText" | "folder" | "settings" | "info";
  unread: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  // SECTION 1: Action Required (3 items)
  {
    id: "notif-act-1",
    title: "New labor request",
    description: "Site 3 - Residential project needs 5 masons for today (Sep 18, 2026).",
    subtext: "Requested by Priya Construction",
    timestamp: "2h ago",
    section: "action_required",
    category: "requests",
    actionRequiredTag: true,
    iconBg: "#fce7f3",
    iconColor: "#db2777",
    iconType: "userPlus",
    unread: true,
  },
  {
    id: "notif-act-2",
    title: "Labor not available",
    description: "Ravi Kumar (Mason) is unavailable for today's assignment.",
    subtext: "Assigned to Site 2 - Commercial Project",
    timestamp: "4h ago",
    section: "action_required",
    category: "assignments",
    actionRequiredTag: true,
    iconBg: "#f1f5f9",
    iconColor: "#475569",
    iconType: "users",
    unread: true,
  },
  {
    id: "notif-act-3",
    title: "Schedule change",
    description: "The work schedule for 3 laborers has been updated for Site 1.",
    subtext: "Check the new timings in the schedule section.",
    timestamp: "5h ago",
    section: "action_required",
    category: "schedule",
    actionRequiredTag: true,
    iconBg: "#fff7ed",
    iconColor: "#ea580c",
    iconType: "calendar",
    unread: true,
  },

  // SECTION 2: Recent Updates (3 items)
  {
    id: "notif-rec-1",
    title: "Assignment confirmed",
    description: "5 laborers have been assigned to Site 2 - Commercial Project.",
    subtext: "Assigned by Priya Construction",
    timestamp: "1h ago",
    section: "recent_updates",
    category: "assignments",
    iconBg: "#dcfce7",
    iconColor: "#16a34a",
    iconType: "check",
    unread: false,
  },
  {
    id: "notif-rec-2",
    title: "New labor request",
    description: "Site 1 - Residential project needs 3 carpenters for tomorrow (Sep 19, 2026).",
    subtext: "Requested by Arun Builders",
    timestamp: "3h ago",
    section: "recent_updates",
    category: "requests",
    iconBg: "#f3e8ff",
    iconColor: "#9333ea",
    iconType: "fileText",
    unread: false,
  },
  {
    id: "notif-rec-3",
    title: "Work completed",
    description: "The assigned work for 2 laborers at Site 1 has been marked as completed.",
    subtext: "Updated by Site Supervisor",
    timestamp: "6h ago",
    section: "recent_updates",
    category: "schedule",
    iconBg: "#ccfbf1",
    iconColor: "#0d9488",
    iconType: "calendar",
    unread: false,
  },

  // SECTION 3: Projects & System (3 items)
  {
    id: "notif-sys-1",
    title: "Project update",
    description: 'New project "Villa Construction" has been added.',
    subtext: "View project details for more information.",
    timestamp: "1d ago",
    section: "projects_system",
    category: "projects",
    iconBg: "#f3e8ff",
    iconColor: "#9333ea",
    iconType: "folder",
    unread: false,
  },
  {
    id: "notif-sys-2",
    title: "System notification",
    description: "Your profile documents are due for verification.",
    subtext: "Please upload the required documents.",
    timestamp: "1d ago",
    section: "projects_system",
    category: "system",
    iconBg: "#f1f5f9",
    iconColor: "#475569",
    iconType: "settings",
    unread: false,
  },
  {
    id: "notif-sys-3",
    title: "Important update",
    description: "The labor rate has been updated for all categories.",
    subtext: "Check the latest rates in the settings.",
    timestamp: "2d ago",
    section: "projects_system",
    category: "system",
    iconBg: "#f1f5f9",
    iconColor: "#475569",
    iconType: "info",
    unread: false,
  },
];

export function PartnerNotificationsWorkspace() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    INITIAL_NOTIFICATIONS
  );
  const [activeCategory, setActiveCategory] = useState<
    | "all"
    | "action_required"
    | "recent_updates"
    | "projects_system"
    | "requests"
    | "assignments"
    | "schedule"
    | "projects"
    | "system"
  >("all");
  const [unreadOnly, setUnreadOnly] = useState(false);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  // Filter list by category & unread toggle
  const filteredList = notifications.filter((item) => {
    if (unreadOnly && !item.unread) return false;
    if (activeCategory === "all") return true;
    if (activeCategory === "action_required") return item.section === "action_required";
    if (activeCategory === "recent_updates") return item.section === "recent_updates";
    if (activeCategory === "projects_system") return item.section === "projects_system";
    return item.category === activeCategory;
  });

  const actionRequiredItems = filteredList.filter((n) => n.section === "action_required");
  const recentUpdatesItems = filteredList.filter((n) => n.section === "recent_updates");
  const projectsSystemItems = filteredList.filter((n) => n.section === "projects_system");

  const counts = {
    all: notifications.length,
    requests: notifications.filter((n) => n.category === "requests").length,
    assignments: notifications.filter((n) => n.category === "assignments").length,
    schedule: notifications.filter((n) => n.category === "schedule").length,
    projects: notifications.filter((n) => n.category === "projects").length,
    system: notifications.filter((n) => n.category === "system").length,
    actionRequired: notifications.filter((n) => n.section === "action_required").length,
    recentUpdates: notifications.filter((n) => n.section === "recent_updates").length,
    projectsSystem: notifications.filter((n) => n.section === "projects_system").length,
  };

  const renderIcon = (type: NotificationItem["iconType"], color: string) => {
    switch (type) {
      case "userPlus":
        return <UserPlus size={18} style={{ color }} />;
      case "users":
        return <Users size={18} style={{ color }} />;
      case "calendar":
        return <Calendar size={18} style={{ color }} />;
      case "check":
        return <CheckCircle2 size={18} style={{ color }} />;
      case "fileText":
        return <FileText size={18} style={{ color }} />;
      case "folder":
        return <Folder size={18} style={{ color }} />;
      case "settings":
        return <Settings size={18} style={{ color }} />;
      case "info":
        return <AlertCircle size={18} style={{ color }} />;
      default:
        return <Bell size={18} style={{ color }} />;
    }
  };

  return (
    <div className={styles.workspace}>
      {/* 1. Page Header */}
      <header className={styles.pageHeader}>
        <div className={styles.headerTitleWrap}>
          <h1 className={styles.pageTitle}>Notifications</h1>
          <p className={styles.pageSubtitle}>
            Stay updated on labor requests, assignments, schedules and project activities.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.iconSettingsBtn}
            aria-label="Notification settings"
            title="Notification settings"
          >
            <Settings size={16} />
          </button>
          <button
            type="button"
            className={styles.markAllReadBtn}
            onClick={handleMarkAllRead}
          >
            <Check size={16} />
            <span>Mark all as read</span>
          </button>
        </div>
      </header>

      {/* 2. Top Category Underline Tab Bar (Matching Mockup) */}
      <div className={styles.categoryTabsBar}>
        <button
          type="button"
          className={`${styles.tabUnderlineItem} ${
            activeCategory === "all" ? styles.tabUnderlineItemActive : ""
          }`}
          onClick={() => setActiveCategory("all")}
        >
          <Bell size={15} />
          <span>All</span>
          <span className={styles.tabCountBadge}>{counts.all}</span>
        </button>

        <button
          type="button"
          className={`${styles.tabUnderlineItem} ${
            activeCategory === "action_required" ? styles.tabUnderlineItemActive : ""
          }`}
          onClick={() => setActiveCategory("action_required")}
        >
          <AlertCircle size={15} />
          <span>Action Required</span>
          <span className={styles.tabCountBadge}>{counts.actionRequired}</span>
        </button>

        <button
          type="button"
          className={`${styles.tabUnderlineItem} ${
            activeCategory === "recent_updates" ? styles.tabUnderlineItemActive : ""
          }`}
          onClick={() => setActiveCategory("recent_updates")}
        >
          <Clock size={15} />
          <span>Recent Updates</span>
          <span className={styles.tabCountBadge}>{counts.recentUpdates}</span>
        </button>

        <button
          type="button"
          className={`${styles.tabUnderlineItem} ${
            activeCategory === "projects_system" ? styles.tabUnderlineItemActive : ""
          }`}
          onClick={() => setActiveCategory("projects_system")}
        >
          <Folder size={15} />
          <span>Projects & System</span>
          <span className={styles.tabCountBadge}>{counts.projectsSystem}</span>
        </button>
      </div>

      {/* 3. Main Two-Column Layout */}
      <div className={styles.mainGrid}>
        {/* Left Main Column */}
        <div className={styles.leftColumn}>
          {/* Group 1: Action Required */}
          {actionRequiredItems.length > 0 && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeaderAction}>
                <div className={styles.sectionTitleWrap}>
                  <span className={styles.dotAction} />
                  <span className={styles.sectionTitleTextAction}>Action Required</span>
                </div>
                <span className={styles.sectionHeaderCountAction}>
                  {actionRequiredItems.length}
                </span>
              </div>

              {actionRequiredItems.map((item) => (
                <div
                  key={item.id}
                  className={`${styles.itemRow} ${
                    item.unread ? styles.itemRowUnread : ""
                  }`}
                  onClick={() => handleToggleRead(item.id)}
                >
                  <div
                    className={styles.itemIconBox}
                    style={{ backgroundColor: item.iconBg }}
                  >
                    {renderIcon(item.iconType, item.iconColor)}
                  </div>

                  <div className={styles.itemMainContent}>
                    <div className={styles.itemTitleWrap}>
                      <h4 className={styles.itemTitle}>{item.title}</h4>
                      {item.unread && (
                        <span
                          className={styles.unreadDot}
                          aria-label="Unread notification"
                          title="Unread"
                        />
                      )}
                    </div>
                    <p className={styles.itemDescription}>{item.description}</p>
                    <span className={styles.itemSubtext}>{item.subtext}</span>
                  </div>

                  <div className={styles.itemRightMeta}>
                    <div className={styles.timeAndArrow}>
                      <span className={styles.timestampText}>{item.timestamp}</span>
                      <ChevronRight size={15} className={styles.chevronIcon} />
                    </div>
                    {item.actionRequiredTag && (
                      <span className={styles.actionRequiredTag}>Action Required</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Group 2: Recent Updates */}
          {recentUpdatesItems.length > 0 && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeaderRecent}>
                <div className={styles.sectionTitleWrap}>
                  <span className={styles.dotRecent} />
                  <span className={styles.sectionTitleTextRecent}>Recent Updates</span>
                </div>
                <span className={styles.sectionHeaderCountRecent}>
                  {recentUpdatesItems.length}
                </span>
              </div>

              {recentUpdatesItems.map((item) => (
                <div
                  key={item.id}
                  className={`${styles.itemRow} ${
                    item.unread ? styles.itemRowUnread : ""
                  }`}
                  onClick={() => handleToggleRead(item.id)}
                >
                  <div
                    className={styles.itemIconBox}
                    style={{ backgroundColor: item.iconBg }}
                  >
                    {renderIcon(item.iconType, item.iconColor)}
                  </div>

                  <div className={styles.itemMainContent}>
                    <div className={styles.itemTitleWrap}>
                      <h4 className={styles.itemTitle}>{item.title}</h4>
                      {item.unread && (
                        <span
                          className={styles.unreadDot}
                          aria-label="Unread notification"
                          title="Unread"
                        />
                      )}
                    </div>
                    <p className={styles.itemDescription}>{item.description}</p>
                    <span className={styles.itemSubtext}>{item.subtext}</span>
                  </div>

                  <div className={styles.itemRightMeta}>
                    <div className={styles.timeAndArrow}>
                      <span className={styles.timestampText}>{item.timestamp}</span>
                      <ChevronRight size={15} className={styles.chevronIcon} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Group 3: Projects & System */}
          {projectsSystemItems.length > 0 && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeaderSystem}>
                <div className={styles.sectionTitleWrap}>
                  <span className={styles.dotSystem} />
                  <span className={styles.sectionTitleTextSystem}>Projects & System</span>
                </div>
                <span className={styles.sectionHeaderCountSystem}>
                  {projectsSystemItems.length}
                </span>
              </div>

              {projectsSystemItems.map((item) => (
                <div
                  key={item.id}
                  className={`${styles.itemRow} ${
                    item.unread ? styles.itemRowUnread : ""
                  }`}
                  onClick={() => handleToggleRead(item.id)}
                >
                  <div
                    className={styles.itemIconBox}
                    style={{ backgroundColor: item.iconBg }}
                  >
                    {renderIcon(item.iconType, item.iconColor)}
                  </div>

                  <div className={styles.itemMainContent}>
                    <div className={styles.itemTitleWrap}>
                      <h4 className={styles.itemTitle}>{item.title}</h4>
                      {item.unread && (
                        <span
                          className={styles.unreadDot}
                          aria-label="Unread notification"
                          title="Unread"
                        />
                      )}
                    </div>
                    <p className={styles.itemDescription}>{item.description}</p>
                    <span className={styles.itemSubtext}>{item.subtext}</span>
                  </div>

                  <div className={styles.itemRightMeta}>
                    <div className={styles.timeAndArrow}>
                      <span className={styles.timestampText}>{item.timestamp}</span>
                      <ChevronRight size={15} className={styles.chevronIcon} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredList.length === 0 && (
            <div className={styles.allCaughtUpCard}>
              <div className={styles.caughtUpIconWrap}>
                <Bell size={24} />
              </div>
              <h3 className={styles.caughtUpHeading}>All caught up!</h3>
              <p className={styles.caughtUpSubtext}>
                You&apos;re all set. No new notifications at the moment.
              </p>
            </div>
          )}
        </div>

        {/* Right Sidebar Column */}
        <div className={styles.rightColumn}>
          {/* Card 1: Notification Summary */}
          <div className={styles.sidePanelCard}>
            <h3 className={styles.sidePanelTitle}>Notification Summary</h3>

            <div
              className={styles.summaryTopBanner}
              onClick={() => setActiveCategory("all")}
              role="button"
              tabIndex={0}
            >
              <div className={styles.summaryTopBannerLeft}>
                <div className={styles.bellCircle}>
                  <Bell size={18} />
                </div>
                <div>
                  <span className={styles.summaryTotalNum}>{counts.all}</span>
                  <div className={styles.summaryTotalLbl}>Total Notifications</div>
                </div>
              </div>
              <ChevronRight size={16} style={{ color: "#64748b" }} />
            </div>

            <div className={styles.summaryRowsList}>
              <div className={styles.summaryRowItem}>
                <div className={styles.summaryRowLeft}>
                  <span className={styles.dotAction} />
                  <span>Action Required</span>
                </div>
                <span className={styles.summaryVal}>{counts.actionRequired}</span>
              </div>

              <div className={styles.summaryRowItem}>
                <div className={styles.summaryRowLeft}>
                  <span className={styles.dotRecent} />
                  <span>Recent Updates</span>
                </div>
                <span className={styles.summaryVal}>{counts.recentUpdates}</span>
              </div>

              <div className={styles.summaryRowItem}>
                <div className={styles.summaryRowLeft}>
                  <span className={styles.dotSystem} />
                  <span>Projects & System</span>
                </div>
                <span className={styles.summaryVal}>{counts.projectsSystem}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Quick Filters */}
          <div className={styles.sidePanelCard}>
            <h3 className={styles.sidePanelTitle}>Quick Filters</h3>

            <div className={styles.toggleRow}>
              <div className={styles.toggleLabelWrap}>
                <SlidersHorizontal size={15} style={{ color: "#64748b" }} />
                <span>Unread Only</span>
              </div>

              <label className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  checked={unreadOnly}
                  onChange={(e) => setUnreadOnly(e.target.checked)}
                />
                <span className={styles.slider} />
              </label>
            </div>

            <div className={styles.quickFiltersList}>
              <button
                type="button"
                className={styles.quickFilterBtn}
                onClick={() => setActiveCategory("requests")}
              >
                <div className={styles.quickFilterLeft}>
                  <Users size={15} style={{ color: "#64748b" }} />
                  <span>Requests</span>
                </div>
                <ChevronRight size={14} style={{ color: "#cbd5e1" }} />
              </button>

              <button
                type="button"
                className={styles.quickFilterBtn}
                onClick={() => setActiveCategory("assignments")}
              >
                <div className={styles.quickFilterLeft}>
                  <Users size={15} style={{ color: "#64748b" }} />
                  <span>Assignments</span>
                </div>
                <ChevronRight size={14} style={{ color: "#cbd5e1" }} />
              </button>

              <button
                type="button"
                className={styles.quickFilterBtn}
                onClick={() => setActiveCategory("schedule")}
              >
                <div className={styles.quickFilterLeft}>
                  <Calendar size={15} style={{ color: "#64748b" }} />
                  <span>Schedule</span>
                </div>
                <ChevronRight size={14} style={{ color: "#cbd5e1" }} />
              </button>

              <button
                type="button"
                className={styles.quickFilterBtn}
                onClick={() => setActiveCategory("projects")}
              >
                <div className={styles.quickFilterLeft}>
                  <Folder size={15} style={{ color: "#64748b" }} />
                  <span>Projects</span>
                </div>
                <ChevronRight size={14} style={{ color: "#cbd5e1" }} />
              </button>

              <button
                type="button"
                className={styles.quickFilterBtn}
                onClick={() => setActiveCategory("system")}
              >
                <div className={styles.quickFilterLeft}>
                  <Settings size={15} style={{ color: "#64748b" }} />
                  <span>System</span>
                </div>
                <ChevronRight size={14} style={{ color: "#cbd5e1" }} />
              </button>
            </div>
          </div>

          {/* Card 3: All caught up! Illustration Card */}
          <div className={styles.allCaughtUpCard}>
            <div className={styles.caughtUpIconWrap}>
              <Bell size={24} />
            </div>
            <h4 className={styles.caughtUpHeading}>All caught up!</h4>
            <p className={styles.caughtUpSubtext}>
              You&apos;re all set. No new notifications at the moment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
