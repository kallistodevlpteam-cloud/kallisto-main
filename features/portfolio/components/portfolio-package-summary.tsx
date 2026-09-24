"use client";

import { useEffect, useRef, useState } from "react";
import { EyeOff, MoreVertical, Pencil, Send, X } from "lucide-react";
import styles from "./portfolio.module.css";

export interface PackageTierItem {
  id: string;
  label: string;
  rate: string;
  badgeClass?: string;
}

const DEFAULT_PACKAGE_TIERS: PackageTierItem[] = [
  { id: "basic", label: "BASIC", rate: "₹2.5L+", badgeClass: styles.packageTierLabelBasic },
  { id: "advanced", label: "ADVANCED", rate: "₹5L+", badgeClass: styles.packageTierLabelAdvanced },
  { id: "luxury", label: "LUXURY", rate: "₹15L+", badgeClass: styles.packageTierLabelLuxury },
];

export interface PortfolioPackageSummaryProps {
  onViewPlans: () => void;
  onSendEnquiry?: () => void;
  onHide?: () => void;
  onEdit?: () => void;
  isOwner?: boolean;
  initialTitle?: string;
  initialSubtitle?: string;
  initialTiers?: PackageTierItem[];
  onSave?: (data: { title: string; subtitle: string; tiers: PackageTierItem[] }) => void;
}

export function PortfolioPackageSummary({
  onViewPlans,
  onSendEnquiry,
  onHide,
  onEdit,
  isOwner = true,
  initialTitle = "Design packages starting from ₹2.5 Lakhs",
  initialSubtitle = "Tailored solution for every scale of project.",
  initialTiers,
  onSave,
}: PortfolioPackageSummaryProps) {
  const [title, setTitle] = useState(initialTitle);
  const [subtitle, setSubtitle] = useState(initialSubtitle);
  const [tiers, setTiers] = useState<PackageTierItem[]>(
    initialTiers || DEFAULT_PACKAGE_TIERS,
  );

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [internalHidden, setInternalHidden] = useState(false);

  const [editTitle, setEditTitle] = useState(title);
  const [editSubtitle, setEditSubtitle] = useState(subtitle);
  const [editBasicRate, setEditBasicRate] = useState(tiers[0]?.rate || "₹2.5L+");
  const [editAdvancedRate, setEditAdvancedRate] = useState(tiers[1]?.rate || "₹5L+");
  const [editLuxuryRate, setEditLuxuryRate] = useState(tiers[2]?.rate || "₹15L+");

  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const handleOpenEdit = () => {
    setIsMenuOpen(false);
    setEditTitle(title);
    setEditSubtitle(subtitle);
    setEditBasicRate(tiers[0]?.rate || "₹2.5L+");
    setEditAdvancedRate(tiers[1]?.rate || "₹5L+");
    setEditLuxuryRate(tiers[2]?.rate || "₹15L+");
    setIsEditModalOpen(true);
    onEdit?.();
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedTiers: PackageTierItem[] = [
      { id: "basic", label: "BASIC", rate: editBasicRate.trim() || "₹2.5L+", badgeClass: styles.packageTierLabelBasic },
      { id: "advanced", label: "ADVANCED", rate: editAdvancedRate.trim() || "₹5L+", badgeClass: styles.packageTierLabelAdvanced },
      { id: "luxury", label: "LUXURY", rate: editLuxuryRate.trim() || "₹15L+", badgeClass: styles.packageTierLabelLuxury },
    ];
    setTitle(editTitle.trim() || "Design packages starting from ₹2.5 Lakhs");
    setSubtitle(editSubtitle.trim() || "Tailored solution for every scale of project.");
    setTiers(updatedTiers);
    setIsEditModalOpen(false);
    onSave?.({
      title: editTitle.trim(),
      subtitle: editSubtitle.trim(),
      tiers: updatedTiers,
    });
  };

  const handleHide = () => {
    setIsMenuOpen(false);
    setInternalHidden(true);
    onHide?.();
  };

  if (internalHidden && !onHide) {
    return null;
  }

  return (
    <>
      <aside
        className={styles.packageSummary}
        aria-labelledby="portfolio-package-summary-title"
      >
        <div className={styles.packageSummaryInner}>
          <div className={styles.packageSummaryUpper}>
            <div className={styles.packageSummaryHeader}>
              <div className={styles.packageSummaryHeaderTopRow}>
                <h2 id="portfolio-package-summary-title">{title}</h2>
                {isOwner && (
                  <div className={styles.packageSummaryMenuWrapper} ref={menuRef}>
                    <button
                      className={styles.packageSummaryMenuTrigger}
                      type="button"
                      onClick={() => setIsMenuOpen((prev) => !prev)}
                      aria-label="Package card options"
                      aria-expanded={isMenuOpen}
                      aria-haspopup="menu"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {isMenuOpen && (
                      <div className={styles.packageSummaryDropdown} role="menu">
                        <button
                          type="button"
                          className={styles.packageSummaryDropdownItem}
                          role="menuitem"
                          onClick={handleOpenEdit}
                        >
                          <Pencil size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          className={`${styles.packageSummaryDropdownItem} ${styles.packageSummaryDropdownItemDanger}`}
                          role="menuitem"
                          onClick={handleHide}
                        >
                          <EyeOff size={13} />
                          <span>Hide</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <p>{subtitle}</p>
            </div>

            <div className={styles.packageTiersRow}>
              {tiers.map((tier, index) => (
                <div className={styles.packageTierWrapper} key={tier.id}>
                  {index > 0 ? <div className={styles.tierDivider} aria-hidden="true" /> : null}
                  <div className={styles.packageTierCol}>
                    <div className={`${styles.packageTierPill} ${tier.badgeClass}`}>
                      <span>{tier.label}</span>
                    </div>
                    <strong className={styles.packageTierPrice}>{tier.rate}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.packageActionsRow}>
            <button
              className={styles.sendEnquiryButton}
              type="button"
              onClick={onSendEnquiry ?? onViewPlans}
            >
              <Send size={13} />
              <span>Send Enquiry</span>
            </button>

            <button
              className={styles.viewPlansButton}
              type="button"
              onClick={onViewPlans}
            >
              <span>View Plans</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Edit Package Summary Modal */}
      {isEditModalOpen && (
        <div
          className={styles.summaryModalOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsEditModalOpen(false);
          }}
        >
          <div
            className={styles.summaryModalDialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="summary-modal-title"
          >
            <div className={styles.summaryModalHeader}>
              <div>
                <h3 id="summary-modal-title" className={styles.summaryModalTitle}>
                  Edit Package Summary
                </h3>
                <p className={styles.summaryModalSubtitle}>
                  Update the headline, subtitle, and tier rates displayed on your profile.
                </p>
              </div>
              <button
                type="button"
                className={styles.summaryModalClose}
                onClick={() => setIsEditModalOpen(false)}
                aria-label="Close edit modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className={styles.summaryModalForm}>
              <div className={styles.summaryFormField}>
                <label htmlFor="summary-edit-title" className={styles.summaryFormLabel}>
                  Headline Title
                </label>
                <input
                  id="summary-edit-title"
                  type="text"
                  className={styles.summaryFormInput}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Design packages starting from ₹2.5 Lakhs"
                  required
                />
              </div>

              <div className={styles.summaryFormField}>
                <label htmlFor="summary-edit-subtitle" className={styles.summaryFormLabel}>
                  Subtitle
                </label>
                <input
                  id="summary-edit-subtitle"
                  type="text"
                  className={styles.summaryFormInput}
                  value={editSubtitle}
                  onChange={(e) => setEditSubtitle(e.target.value)}
                  placeholder="Tailored solution for every scale of project."
                  required
                />
              </div>

              <div className={styles.summaryTiersGroup}>
                <label className={styles.summaryFormLabel}>Starting Rates by Tier</label>
                <div className={styles.summaryTiersRow}>
                  <div className={styles.summaryTierCol}>
                    <span className={`${styles.packageTierPill} ${styles.packageTierLabelBasic}`}>
                      BASIC
                    </span>
                    <input
                      type="text"
                      className={styles.summaryTierInput}
                      value={editBasicRate}
                      onChange={(e) => setEditBasicRate(e.target.value)}
                      placeholder="₹2.5L+"
                      aria-label="Basic tier rate"
                      required
                    />
                  </div>
                  <div className={styles.summaryTierCol}>
                    <span className={`${styles.packageTierPill} ${styles.packageTierLabelAdvanced}`}>
                      ADVANCED
                    </span>
                    <input
                      type="text"
                      className={styles.summaryTierInput}
                      value={editAdvancedRate}
                      onChange={(e) => setEditAdvancedRate(e.target.value)}
                      placeholder="₹5L+"
                      aria-label="Advanced tier rate"
                      required
                    />
                  </div>
                  <div className={styles.summaryTierCol}>
                    <span className={`${styles.packageTierPill} ${styles.packageTierLabelLuxury}`}>
                      LUXURY
                    </span>
                    <input
                      type="text"
                      className={styles.summaryTierInput}
                      value={editLuxuryRate}
                      onChange={(e) => setEditLuxuryRate(e.target.value)}
                      placeholder="₹15L+"
                      aria-label="Luxury tier rate"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className={styles.summaryModalActions}>
                <button
                  type="button"
                  className={styles.summaryBtnCancel}
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.summaryBtnSave}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
