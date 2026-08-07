"use client";

import { Check, X } from "lucide-react";
import React, { useEffect, useRef } from "react";
import styles from "./project-boq-workspace.module.css";

interface BoqInlineCellEditorProps {
  itemCode: string;
  field: "quantity" | "rate";
  value: string;
  error: string | null;
  saving: boolean;
  onChange: (value: string) => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
}

export function BoqInlineCellEditor({
  itemCode,
  field,
  value,
  error,
  saving,
  onChange,
  onSave,
  onCancel,
}: BoqInlineCellEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  return (
    <div className={styles.cellEditorWrapper}>
      <div className={styles.cellEditor}>
        <input
          ref={inputRef}
          inputMode="decimal"
          aria-label={`Edit ${field} for ${itemCode}`}
          value={value}
          disabled={saving}
          aria-invalid={Boolean(error)}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void onSave();
            }
            if (event.key === "Escape") {
              event.preventDefault();
              onCancel();
            }
          }}
        />
        <button
          type="button"
          aria-label={`Save ${field} for ${itemCode}`}
          disabled={saving}
          onClick={() => void onSave()}
        >
          <Check size={13} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={`Cancel ${field} edit for ${itemCode}`}
          disabled={saving}
          onClick={onCancel}
        >
          <X size={13} aria-hidden="true" />
        </button>
      </div>
      {error && <span className={styles.cellEditError}>{error}</span>}
    </div>
  );
}
