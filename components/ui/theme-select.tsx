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
  name?: string;
  className?: string;
  size?: "sm" | "md" | "form";
  variant?: "pill" | "subtle" | "bordered" | "formField";
  align?: "left" | "right";
  fullWidth?: boolean;
  icon?: React.ReactNode;
  placeholder?: string;
  hasError?: boolean;
  disabled?: boolean;
}

export function ThemeSelect<T extends string = string>({
  value,
  options,
  onChange,
  ariaLabel,
  id,
  name,
  className = "",
  size = "md",
  variant = "bordered",
  align,
  fullWidth = false,
  icon,
  placeholder,
  hasError = false,
  disabled = false,
}: ThemeSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

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

  const isFormField = variant === "formField" || size === "form";
  const variantClass = isFormField
    ? styles.triggerFormField
    : variant === "pill"
    ? styles.triggerPill
    : "";
  const sizeClass = size === "sm" ? styles.triggerSm : "";
  const effectiveAlign = align ?? (variant === "pill" ? "right" : "left");
  const alignClass = effectiveAlign === "left" ? styles.alignLeft : styles.alignRight;
  const fullWidthClass = fullWidth || isFormField ? styles.fullWidth : "";
  const errorClass = hasError ? styles.triggerError : "";
  const disabledClass = disabled ? styles.triggerDisabled : "";

  return (
    <div
      ref={containerRef}
      className={`${styles.selectWrapper} ${fullWidthClass} ${className}`}
    >
      {/* Hidden native select for HTML forms, accessibility & testing */}
      <select
        id={id}
        name={name}
        className="sr-only"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        id={id ? `${id}-button` : undefined}
        className={`${styles.triggerButton} ${variantClass} ${sizeClass} ${errorClass} ${disabledClass} ${
          isOpen ? styles.triggerOpen : ""
        }`}
        aria-label={!id ? ariaLabel : undefined}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-invalid={hasError}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
      >
        <div className={styles.triggerLeft}>
          {icon && <span className={styles.triggerIcon}>{icon}</span>}
          <span
            className={`${styles.triggerLabel} ${
              !selectedOption && placeholder ? styles.triggerPlaceholder : ""
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder || value || "Select..."}
          </span>
        </div>
        <ChevronDown
          size={14}
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
                  <Check size={14} className={styles.optionCheck} aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
