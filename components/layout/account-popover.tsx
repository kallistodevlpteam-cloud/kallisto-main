"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ChevronLeft,
  LogOut,
  Check,
  Plus,
} from "lucide-react";
import styles from "./account-popover.module.css";
import { DeveloperConsoleHook } from "../../developer-console/hooks/useDeveloperConsole";

interface AccountPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  consoleState: DeveloperConsoleHook;
  onOpenDevConsole: () => void;
  initialView?: "main" | "switcher";
}

interface Workspace {
  id: string;
  name: string;
  category: string;
  location: string;
  teamSize: number;
}

const WORKSPACES: Workspace[] = [
  {
    id: "ws-1",
    name: "Arjun Architects",
    category: "Architecture & Interiors",
    location: "Kochi",
    teamSize: 8,
  },
  {
    id: "ws-2",
    name: "Kochi Design Studio",
    category: "Interior Design",
    location: "Kochi",
    teamSize: 3,
  },
  {
    id: "ws-3",
    name: "Kallisto Partners Kochi",
    category: "Contracting & Construction",
    location: "Kochi",
    teamSize: 12,
  },
];

export function AccountPopover({
  isOpen,
  onClose,
  consoleState,
  onOpenDevConsole,
  initialView = "main",
}: AccountPopoverProps) {
  const [currentView, setCurrentView] = useState<"main" | "switcher">(initialView);
  const [prevInitialView, setPrevInitialView] = useState<"main" | "switcher">(initialView);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("ws-1");
  const [expandedSection, setExpandedSection] = useState<"preferences" | "support" | null>(null);
  const router = useRouter();

  const handleNavigate = (tab: string, sub?: string) => {
    onClose();
    let path = `/settings/${tab}`;
    
    if (tab === "profile") {
      path = "/settings/business-profile";
    }
    
    if (sub) {
      let subParam = sub;
      if (sub === "language") subParam = "region";
      path = `${path}?sub=${subParam}`;
    }
    
    router.push(path);
  };

  const toggleSection = (section: "preferences" | "support") => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  const cardRef = useRef<HTMLDivElement>(null);

  // Sync state with prop if it changes while component is mounted
  if (initialView !== prevInitialView) {
    setPrevInitialView(initialView);
    setCurrentView(initialView);
  }

  // Click outside and key listeners
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(".topbar-avatar-btn") || target?.closest(".workspace-selector-card")) return;
      if (cardRef.current && !cardRef.current.contains(target as Node)) {
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


  const handleWorkspaceSelect = (id: string) => {
    setSelectedWorkspaceId(id);
    setCurrentView("main");
  };



  // Check Developer Readiness eligibility
  const showDevConsoleLink =
    consoleState.isConsoleAllowed &&
    consoleState.activeUser &&
    ["developer", "super_admin", "qa"].includes(consoleState.activeUser.role) &&
    consoleState.activeEnvironment !== "production";

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div
        ref={cardRef}
        className={styles.popoverCard}
        role="dialog"
        aria-modal="true"
        aria-label="Workspace and Account Menu"
      >
        {/* Central scrollable container */}
        <div className={styles.centralScrollArea}>
          {currentView === "main" ? (
            <>
              {/* Group 1: Workspace settings & Team */}
              <div className={styles.menuGroup}>
                <button type="button" className={styles.menuRow} onClick={() => handleNavigate("workspace")}>
                  <span className={styles.menuLabel}>Workspace settings</span>
                </button>
                <button type="button" className={styles.menuRow} onClick={() => handleNavigate("team")}>
                  <span className={styles.menuLabel}>Team and permissions</span>
                </button>
              </div>

              <div className={styles.menuDivider} />

              {/* Group 2: Business profile & Services */}
              <div className={styles.menuGroup}>
                <button type="button" className={styles.menuRow} onClick={() => handleNavigate("profile")}>
                  <span className={styles.menuLabel}>Business profile</span>
                </button>
                <button type="button" className={styles.menuRow} onClick={() => handleNavigate("services")}>
                  <span className={styles.menuLabel}>Services and portfolio</span>
                </button>
              </div>

              <div className={styles.menuDivider} />

              {/* Group 3: Billing & Preferences */}
              <div className={styles.menuGroup}>
                <button type="button" className={styles.menuRow} onClick={() => handleNavigate("billing")}>
                  <span className={styles.menuLabel}>Billing and payouts</span>
                </button>
                <button
                  type="button"
                  className={styles.menuRow}
                  onClick={() => toggleSection("preferences")}
                  aria-expanded={expandedSection === "preferences"}
                >
                  <span className={styles.menuLabel}>Preferences</span>
                  <ChevronRight
                    size={13}
                    className={`${styles.chevronIcon} ${expandedSection === "preferences" ? styles.expanded : ""}`}
                  />
                </button>

                {/* Preferences Accordion Panel */}
                <div className={`${styles.accordionPanel} ${expandedSection === "preferences" ? styles.open : ""}`}>
                  <div className={styles.accordionContent}>
                    <button type="button" className={styles.subMenuRow} onClick={() => handleNavigate("preferences", "notifications")}>
                      <span className={styles.subMenuLabel}>Notifications</span>
                    </button>
                    <button type="button" className={styles.subMenuRow} onClick={() => handleNavigate("preferences", "appearance")}>
                      <span className={styles.subMenuLabel}>Appearance</span>
                    </button>
                    <button type="button" className={styles.subMenuRow} onClick={() => handleNavigate("preferences", "language")}>
                      <span className={styles.subMenuLabel}>Language and region</span>
                    </button>
                    <button type="button" className={styles.subMenuRow} onClick={() => handleNavigate("preferences", "security")}>
                      <span className={styles.subMenuLabel}>Security and login</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.menuDivider} />

              {/* Group 4: Help and support */}
              <div className={styles.menuGroup}>
                <button
                  type="button"
                  className={styles.menuRow}
                  onClick={() => toggleSection("support")}
                  aria-expanded={expandedSection === "support"}
                >
                  <span className={styles.menuLabel}>Help and support</span>
                  <ChevronRight
                    size={13}
                    className={`${styles.chevronIcon} ${expandedSection === "support" ? styles.expanded : ""}`}
                  />
                </button>

                {/* Help & Support Accordion Panel */}
                <div className={`${styles.accordionPanel} ${expandedSection === "support" ? styles.open : ""}`}>
                  <div className={styles.accordionContent}>
                    <button type="button" className={styles.subMenuRow} onClick={() => handleNavigate("help", "centre")}>
                      <span className={styles.subMenuLabel}>Help centre</span>
                    </button>
                    <button type="button" className={styles.subMenuRow} onClick={() => handleNavigate("help", "support")}>
                      <span className={styles.subMenuLabel}>Contact Kallisto support</span>
                    </button>
                    <button type="button" className={styles.subMenuRow} onClick={() => handleNavigate("help", "report")}>
                      <span className={styles.subMenuLabel}>Report an issue</span>
                    </button>
                    <button type="button" className={styles.subMenuRow} onClick={() => handleNavigate("help", "privacy")}>
                      <span className={styles.subMenuLabel}>Privacy and terms</span>
                    </button>
                  </div>
                </div>

                {showDevConsoleLink && (
                  <>
                    <div className={styles.menuDivider} />
                    <button
                      type="button"
                      className={styles.menuRow}
                      onClick={() => {
                        onClose();
                        onOpenDevConsole();
                      }}
                    >
                      <span className={styles.menuLabel} style={{ color: "#d97706", fontWeight: 600 }}>
                        Developer Readiness Console
                      </span>
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            /* Workspace Switcher view */
            <div className={styles.switcherContainer}>
              <div className={styles.switcherHeader}>
                <button
                  type="button"
                  className={styles.backBtn}
                  onClick={() => setCurrentView("main")}
                  aria-label="Back to main menu"
                >
                  <ChevronLeft size={14} />
                </button>
                <h5 className={styles.switcherTitle}>Switch Workspace</h5>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {WORKSPACES.map((ws) => {
                  const isActive = ws.id === selectedWorkspaceId;
                  return (
                    <button
                      key={ws.id}
                      type="button"
                      className={`${styles.workspaceOptionCard}${isActive ? ` ${styles.active}` : ""}`}
                      onClick={() => handleWorkspaceSelect(ws.id)}
                    >
                      <div className={styles.workspaceOptionLeft}>
                        <div className={styles.workspaceIconBox}>
                          {ws.name
                            .split(" ")
                            .map((word) => word[0])
                            .join("")}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
                          <span style={{ fontSize: "12px", fontWeight: 600, color: "#0f172a" }}>
                            {ws.name}
                          </span>
                          <span style={{ fontSize: "10.5px", color: "#64748b" }}>
                            {ws.category} • {ws.location}
                          </span>
                        </div>
                      </div>
                      {isActive && <Check size={14} style={{ color: "#2563eb" }} />}
                    </button>
                  );
                })}
              </div>

              <button type="button" className={styles.createWorkspaceBtn}>
                <Plus size={13} />
                <span>Create new workspace</span>
              </button>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <footer className={styles.popoverFooter}>
          <button
            type="button"
            className={styles.signOutRow}
            onClick={() => {
              onClose();
              alert("Signing out...");
            }}
          >
            <LogOut size={14} className={styles.signOutIcon} />
            <span>Sign out</span>
          </button>
        </footer>
      </div>
    </>
  );
}
