"use client";

import { Bookmark, Check } from "lucide-react";
import { useState } from "react";
import { basicsProviderRepository } from "../repositories/basics-repositories";
import styles from "./basics-workspace.module.css";

export function SaveProviderButton({
  providerId,
  variant = "default",
}: {
  providerId: string;
  variant?: "default" | "icon";
}) {
  const [saved, setSaved] = useState(false);

  if (variant === "icon") {
    return (
      <button
        type="button"
        className={`${styles.profileIconActionButton} ${saved ? styles.profileIconActionButtonActive : ""}`}
        aria-pressed={saved}
        aria-label={saved ? "Remove from shortlist" : "Add to shortlist"}
        title={saved ? "Remove from shortlist" : "Add to shortlist"}
        onClick={() => {
          void basicsProviderRepository.saveProvider(providerId).then(() => {
            setSaved((current) => !current);
          });
        }}
      >
        <Bookmark size={13} strokeWidth={2.2} fill={saved ? "currentColor" : "none"} aria-hidden="true" />
      </button>
    );
  }

  return (
    <button
      type="button"
      className={styles.secondaryButton}
      aria-pressed={saved}
      onClick={() => {
        void basicsProviderRepository.saveProvider(providerId).then(() => {
          setSaved((current) => !current);
        });
      }}
    >
      {saved ? <Check size={13} aria-hidden="true" /> : <Bookmark size={13} aria-hidden="true" />}
      {saved ? "Saved" : "Save"}
    </button>
  );
}

