"use client";

import React, { useEffect, useRef, useState } from "react";
import { AlertCircle, Check, Pencil, Plus, Trash2, X } from "lucide-react";
import type { PricingCardItem } from "./portfolio-pricing";
import styles from "./edit-package-modal.module.css";

export interface EditPackageModalProps {
  isOpen: boolean;
  packageItem: PricingCardItem | null;
  onClose: () => void;
  onSave: (updatedPackage: PricingCardItem) => void;
}

function EditPackageFormDialog({
  packageItem,
  onClose,
  onSave,
}: {
  packageItem: PricingCardItem;
  onClose: () => void;
  onSave: (updatedPackage: PricingCardItem) => void;
}) {
  const [title, setTitle] = useState(packageItem.title);
  const [price, setPrice] = useState(packageItem.price);
  const [priceUnit, setPriceUnit] = useState(packageItem.priceUnit || "");
  const [subLabel, setSubLabel] = useState(packageItem.subLabel);
  const [description, setDescription] = useState(packageItem.description);
  const [deliverables, setDeliverables] = useState<string[]>(
    packageItem.deliverables,
  );
  const [duration, setDuration] = useState(packageItem.duration);
  const [revisionText, setRevisionText] = useState(packageItem.revisionText);
  const [newDeliverableInput, setNewDeliverableInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const titleInputRef = useRef<HTMLInputElement>(null);

  // Close on Escape key and autofocus title input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const timer = setTimeout(() => {
      titleInputRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
    };
  }, [onClose]);

  const handleAddDeliverable = () => {
    if (!newDeliverableInput.trim()) return;
    setDeliverables((prev) => [...prev, newDeliverableInput.trim()]);
    setNewDeliverableInput("");
  };

  const handleRemoveDeliverable = (index: number) => {
    setDeliverables((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeliverableChange = (index: number, val: string) => {
    setDeliverables((prev) => {
      const updated = [...prev];
      updated[index] = val;
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Please enter a package title.");
      titleInputRef.current?.focus();
      return;
    }

    if (!price.trim()) {
      setError("Please enter a package price or rate.");
      return;
    }

    const updatedPackage: PricingCardItem = {
      ...packageItem,
      title: title.trim(),
      price: price.trim(),
      priceUnit: priceUnit.trim() || undefined,
      subLabel: subLabel.trim(),
      description: description.trim(),
      deliverables: deliverables.filter((d) => d.trim().length > 0),
      duration: duration.trim(),
      revisionText: revisionText.trim(),
    };

    onSave(updatedPackage);
    onClose();
  };

  return (
    <div
      className={styles.modalOverlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-package-modal-title"
    >
      <div
        className={styles.modalDialog}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.iconBadge}>
              <Pencil size={20} />
            </div>
            <div>
              <h2 id="edit-package-modal-title" className={styles.modalTitle}>
                Edit Package Details
              </h2>
              <p className={styles.modalSubtitle}>
                Update deliverables, pricing, and scope for &ldquo;{packageItem.title}&rdquo;
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.modalScrollBody}>
            {error && (
              <div className={styles.errorBanner} role="alert">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Package Title */}
            <div className={styles.formGroup}>
              <label htmlFor="package-title" className={styles.fieldLabel}>
                Package Title <span className={styles.requiredStar}>*</span>
              </label>
              <input
                ref={titleInputRef}
                id="package-title"
                type="text"
                className={styles.textInput}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError(null);
                }}
              />
            </div>

            {/* Price & Unit & Sub-label */}
            <div className={styles.formGrid2}>
              <div className={styles.formGroup}>
                <label htmlFor="package-price" className={styles.fieldLabel}>
                  Rate / Price <span className={styles.requiredStar}>*</span>
                </label>
                <div className={styles.priceInputRow}>
                  <span className={styles.currencyPrefix}>₹</span>
                  <input
                    id="package-price"
                    type="text"
                    className={styles.textInput}
                    placeholder="e.g. 2,50,000"
                    value={price}
                    onChange={(e) => {
                      setPrice(e.target.value);
                      if (error) setError(null);
                    }}
                  />
                  <input
                    id="package-price-unit"
                    type="text"
                    className={`${styles.textInput} ${styles.unitInput}`}
                    placeholder="/ sq.ft"
                    value={priceUnit}
                    onChange={(e) => setPriceUnit(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="package-sublabel" className={styles.fieldLabel}>
                  Price Subtext / Starting Range
                </label>
                <input
                  id="package-sublabel"
                  type="text"
                  className={styles.textInput}
                  placeholder="e.g. Starting from ₹2.5L+"
                  value={subLabel}
                  onChange={(e) => setSubLabel(e.target.value)}
                />
              </div>
            </div>

            {/* Description */}
            <div className={styles.formGroup}>
              <label htmlFor="package-description" className={styles.fieldLabel}>
                Package Description
              </label>
              <textarea
                id="package-description"
                rows={3}
                className={styles.textareaInput}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Deliverables / Scope of Work */}
            <div className={styles.formGroup}>
              <label className={styles.fieldLabel}>Deliverables &amp; Scope</label>
              <div className={styles.deliverablesList}>
                {deliverables.map((item, index) => (
                  <div key={index} className={styles.deliverableItem}>
                    <input
                      type="text"
                      className={styles.textInput}
                      value={item}
                      onChange={(e) =>
                        handleDeliverableChange(index, e.target.value)
                      }
                    />
                    <button
                      type="button"
                      className={styles.deleteItemBtn}
                      onClick={() => handleRemoveDeliverable(index)}
                      aria-label={`Remove deliverable ${index + 1}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>

              <div className={styles.addDeliverableBox}>
                <input
                  type="text"
                  className={styles.textInput}
                  placeholder="Add a new deliverable item..."
                  value={newDeliverableInput}
                  onChange={(e) => setNewDeliverableInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddDeliverable();
                    }
                  }}
                />
                <button
                  type="button"
                  className={styles.addDeliverableBtn}
                  onClick={handleAddDeliverable}
                >
                  <Plus size={15} />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Timeline & Revisions */}
            <div className={styles.formGrid2}>
              <div className={styles.formGroup}>
                <label htmlFor="package-duration" className={styles.fieldLabel}>
                  Estimated Timeline
                </label>
                <input
                  id="package-duration"
                  type="text"
                  className={styles.textInput}
                  placeholder="e.g. 4 to 5 weeks"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="package-revision" className={styles.fieldLabel}>
                  Revisions / Warranty
                </label>
                <input
                  id="package-revision"
                  type="text"
                  className={styles.textInput}
                  placeholder="e.g. 2 revision cycles included"
                  value={revisionText}
                  onChange={(e) => setRevisionText(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
            >
              <Check size={16} />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function EditPackageModal({
  isOpen,
  packageItem,
  onClose,
  onSave,
}: EditPackageModalProps) {
  if (!isOpen || !packageItem) return null;

  return (
    <EditPackageFormDialog
      key={packageItem.id}
      packageItem={packageItem}
      onClose={onClose}
      onSave={onSave}
    />
  );
}
