"use client";

import { Check, ChevronDown } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import styles from "./theme-select.module.css";

export interface ThemeSelectOption<T extends string = string> {
  value: T;
  label: string;
  sublabel?: string;
  badge?: string;
  disabled?: boolean;
}

export interface ThemeSelectProps<T extends string = string> {
  value: T;
  options: Array<ThemeSelectOption<T>>;
  onChange: (value: T) => void;
  ariaLabel?: string;
  id?: string;
  className?: string;
  size?: "sm" | "md";
  variant?: "pill" | "subtle" | "bordered";
  align?: "left" | "right";
  fullWidth?: boolean;
}

export function ThemeSelect<T extends string = string>({
  value,
  options,
  onChange,
  ariaLabel = "Select option",
  id,
  className = "",
  size = "md",
  variant = "bordered",
  align,
  fullWidth = false,
}: ThemeSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) ?? options[0];

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const variantClass = variant === "pill" ? styles.triggerPill : "";
  const sizeClass = size === "sm" ? styles.triggerSm : "";
  const effectiveAlign = align ?? (variant === "pill" ? "right" : "left");
  const alignClass = effectiveAlign === "left" ? styles.alignLeft : styles.alignRight;
  const fullWidthClass = fullWidth ? styles.fullWidth : "";

  return (
    <div ref={containerRef} className={`${styles.selectWrapper} ${fullWidthClass} ${className}`}>
      {/* Hidden native select for accessibility/tests fallback */}
      <select
        id={id}
        className="sr-only"
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        className={`${styles.triggerButton} ${variantClass} ${sizeClass}`}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className={styles.triggerLabel}>{selectedOption ? selectedOption.label : value}</span>
        <ChevronDown
          size={13}
          className={`${styles.triggerChevron} ${isOpen ? styles.triggerChevronOpen : ""}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className={`${styles.dropdownPopover} ${alignClass}`} role="listbox" tabIndex={-1}>
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={option.disabled}
                className={`${styles.optionItem} ${
                  isSelected ? styles.optionItemSelected : ""
                }`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                <div className={styles.optionContent}>
                  <span className={styles.optionLabel}>{option.label}</span>
                  {option.sublabel && (
                    <span className={styles.optionSublabel}>{option.sublabel}</span>
                  )}
                </div>
                {isSelected && (
                  <Check size={13} className={styles.optionCheck} aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
