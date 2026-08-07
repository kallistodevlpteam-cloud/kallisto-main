"use client";

import React from "react";
import styles from "./badge.module.css";

export type BadgeVariant =
  | "default"
  | "secondary"
  | "outline"
  | "success"
  | "warning"
  | "destructive"
  | "info";

export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "content"> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  dot?: boolean;
  children?: React.ReactNode;
}

export function Badge({
  variant = "default",
  size = "md",
  icon,
  dot = false,
  children,
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      className={`${styles.badge} ${styles[`variant_${variant}`]} ${styles[`size_${size}`]} ${className}`}
      {...props}
    >
      {dot && <span className={styles.dot} />}
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </span>
  );
}
