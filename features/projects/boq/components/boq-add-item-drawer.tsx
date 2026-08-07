"use client";

import { X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { AddBoqItemInput } from "@/types/domain/project-boq";
import { parseBoqInput } from "../services/project-boq-calculations";
import styles from "./project-boq-workspace.module.css";

interface BoqAddItemDrawerProps {
  sections: Array<{ id: string; label: string }>;
  initialSectionId: string;
  onCancel: () => void;
  onSave: (input: AddBoqItemInput) => Promise<void>;
}

export function BoqAddItemDrawer({
  sections,
  initialSectionId,
  onCancel,
  onSave,
}: BoqAddItemDrawerProps) {
  const [sectionId, setSectionId] = useState(initialSectionId);
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("");
  const [quantity, setQuantity] = useState("");
  const [rate, setRate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !saving) {
        onCancel();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel, saving]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    if (!code.trim() || !description.trim() || !unit.trim()) {
      setError("Section, code, description and unit are required.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await onSave({
        sectionId,
        code: code.trim(),
        description: description.trim(),
        unit: unit.trim(),
        quantity: parseBoqInput(quantity),
        rate: parseBoqInput(rate),
      });
      onCancel();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "The item could not be added."
      );
      setSaving(false);
    }
  }

  return (
    <>
      <div
        className={styles.drawerBackdrop}
        onClick={() => {
          if (!saving) {
            onCancel();
          }
        }}
      />
      <div
        className={styles.drawerContainer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="boq-add-item-title"
      >
        <header className={styles.drawerHeader}>
          <div>
            <h3 id="boq-add-item-title">Add BOQ Item</h3>
            <p>New items are added to the current draft only.</p>
          </div>
          <button
            type="button"
            className={styles.rowIconButton}
            aria-label="Close add item form"
            disabled={saving}
            onClick={onCancel}
          >
            <X size={15} aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={submit} className={styles.drawerForm}>
          <div className={styles.drawerBody}>
            <label className={styles.drawerField}>
              <span>Section</span>
              <select
                value={sectionId}
                onChange={(event) => setSectionId(event.target.value)}
              >
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.label}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.drawerField}>
              <span>Code</span>
              <input
                ref={firstInputRef}
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="e.g. A.03"
              />
            </label>

            <label className={styles.drawerField}>
              <span>Description</span>
              <textarea
                rows={3}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe the measured work item"
              />
            </label>

            <label className={styles.drawerField}>
              <span>Unit</span>
              <input
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
                placeholder="e.g. m², m³, kg, nos"
              />
            </label>

            <div className={styles.drawerFieldGrid}>
              <label className={styles.drawerField}>
                <span>Quantity</span>
                <input
                  inputMode="decimal"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  placeholder="Optional"
                />
              </label>

              <label className={styles.drawerField}>
                <span>Rate (₹)</span>
                <input
                  inputMode="decimal"
                  value={rate}
                  onChange={(event) => setRate(event.target.value)}
                  placeholder="Optional"
                />
              </label>
            </div>
          </div>

          <footer className={styles.drawerFooter}>
            {error && (
              <span className={styles.drawerErrorAlert} role="alert">
                {error}
              </span>
            )}
            <div className={styles.drawerFooterActions}>
              <button
                type="button"
                className={styles.secondaryButton}
                disabled={saving}
                onClick={onCancel}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={saving}
              >
                {saving ? "Saving…" : "Add Item"}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </>
  );
}
