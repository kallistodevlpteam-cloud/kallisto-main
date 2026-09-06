"use client";

import { useEffect, useRef, useState } from "react";
import {
  Archive,
  Camera,
  Copy,
  Ellipsis,
  Eye,
  Pencil,
  Share2,
} from "lucide-react";
import type { PortfolioProfile } from "@/features/portfolio/types/portfolio.types";
import styles from "./portfolio.module.css";

interface PortfolioProfileActionsProps {
  isOwner: boolean;
  profile: PortfolioProfile;
  onEdit: () => void;
  onUploadCover?: () => void;
  shareOnly?: boolean;
}

export function PortfolioProfileActions({
  isOwner,
  profile,
  onEdit,
  onUploadCover,
  shareOnly = false,
}: PortfolioProfileActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareLabel, setShareLabel] = useState("Share");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const closeMenu = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, [menuOpen]);

  const sharePortfolio = async () => {
    const shareData = {
      title: `${profile.name} portfolio`,
      text: `View ${profile.name}'s architecture and construction portfolio.`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareLabel("Link copied");
        window.setTimeout(() => setShareLabel("Share"), 1800);
      }
    } catch {
      setShareLabel("Share");
    }
  };

  return (
    <div className={styles.bannerActionsPillGroup} aria-label="Portfolio actions">
      {isOwner && !shareOnly ? (
        <button
          className={styles.bannerActionButton}
          type="button"
          onClick={onEdit}
        >
          <Pencil size={14} aria-hidden="true" />
          <span>Edit Portfolio</span>
        </button>
      ) : null}

      <button
        className={styles.bannerIconButton}
        type="button"
        onClick={sharePortfolio}
        title={shareLabel}
        aria-label={shareLabel}
      >
        <Share2 size={15} aria-hidden="true" />
      </button>

      {isOwner && !shareOnly ? (
        <div className={styles.actionMenu} ref={menuRef}>
          <button
            className={styles.bannerIconButton}
            type="button"
            aria-label="More portfolio actions"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            onClick={() => setMenuOpen((current) => !current)}
          >
            <Ellipsis size={16} aria-hidden="true" />
          </button>
          {menuOpen ? (
            <div className={styles.actionMenuPanel} role="menu">
              {onUploadCover ? (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onUploadCover();
                  }}
                >
                  <Camera size={15} aria-hidden="true" />
                  Change cover image
                </button>
              ) : null}
              <button type="button" role="menuitem">
                <Eye size={15} aria-hidden="true" />
                Preview public profile
              </button>
              <button type="button" role="menuitem">
                <Copy size={15} aria-hidden="true" />
                Copy portfolio link
              </button>
              <button type="button" role="menuitem">
                <Archive size={15} aria-hidden="true" />
                Manage archived work
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
