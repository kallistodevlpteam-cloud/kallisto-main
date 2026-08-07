"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./notification-popover.module.css";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  unread: boolean;
  type: "featured" | "standard";
  badgeText?: string;
  badgeStyle?: "approve" | "hub" | "audit";
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-featured-1",
    title: "Introducing BOQ Versioning 2.0 →",
    description:
      "Describe what you want to manage. An AI workspace agent tracks revision history, compares line items, and requests client approvals directly.",
    timestamp: "about 2 hours ago",
    unread: true,
    type: "featured",
  },
  {
    id: "notif-1",
    title: "Client Approval Received",
    description: "Nisha Menon approved Concept Phase deliverables for Residence 24.",
    timestamp: "30 minutes ago",
    unread: true,
    type: "standard",
    badgeText: "APPROVE v2.0",
    badgeStyle: "approve",
  },
  {
    id: "notif-2",
    title: "Introducing Feasibility Hub v2",
    description:
      "Our revolutionary site inspection model preserves spatial survey evidence across 90+ site parameters.",
    timestamp: "about 2 hours ago",
    unread: true,
    type: "standard",
    badgeText: "HUB v2.0",
    badgeStyle: "hub",
  },
  {
    id: "notif-3",
    title: "Warranty & Snag List Audit Due",
    description: "Post-handover warranty inspection scheduled for Skyline Corporate HQ Suite.",
    timestamp: "yesterday",
    unread: false,
    type: "standard",
    badgeText: "AUDIT v1.0",
    badgeStyle: "audit",
  },
];

interface NotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPopover({ isOpen, onClose }: NotificationPopoverProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(".topbar-icon-btn")) return;
      if (containerRef.current && !containerRef.current.contains(target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside, { passive: true });
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleItemClick = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const featuredItem = notifications.find((n) => n.type === "featured");
  const standardItems = notifications.filter((n) => n.type === "standard");

  return (
    <div
      ref={containerRef}
      className={styles.popoverContainer}
      role="dialog"
      aria-label="Notifications"
    >
      <div className={styles.popoverBody}>
        {/* Featured Card */}
        {featuredItem && (
          <div
            className={styles.featuredCard}
            onClick={() => handleItemClick(featuredItem.id)}
          >
            <div className={styles.featuredHeader}>
              <h4 className={styles.featuredTitle}>{featuredItem.title}</h4>
              <p className={styles.featuredDesc}>{featuredItem.description}</p>
            </div>

            {/* Featured Gradient Banner */}
            <div className={styles.featuredBanner}>
              <span className={styles.bannerBrandLabel}>Kallisto Practice</span>
              <span className={styles.bannerTitle}>Introducing BOQ Versioning 2.0</span>
            </div>

            <span className={styles.timestampText}>{featuredItem.timestamp}</span>
          </div>
        )}

        {/* Divider */}
        {featuredItem && standardItems.length > 0 && <div className={styles.cardDivider} />}

        {/* Standard Items */}
        {standardItems.map((item, index) => (
          <React.Fragment key={item.id}>
            <div
              className={`${styles.notificationCard}${item.unread ? ` ${styles.unread}` : ""}`}
              onClick={() => handleItemClick(item.id)}
            >
              <div className={styles.notificationContent}>
                <h4 className={styles.notificationTitle}>{item.title}</h4>
                <p className={styles.notificationDesc}>{item.description}</p>
                <span className={styles.timestampText}>{item.timestamp}</span>
              </div>

              {/* Right Thumbnail Badge */}
              {item.badgeText && (
                <div
                  className={`${styles.thumbnailBadge} ${
                    item.badgeStyle ? styles[item.badgeStyle] : ""
                  }`}
                >
                  <span className={styles.thumbnailText}>{item.badgeText}</span>
                </div>
              )}

              {item.unread && <span className={styles.unreadDot} />}
            </div>

            {/* Divider between list items */}
            {index < standardItems.length - 1 && <div className={styles.cardDivider} />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
