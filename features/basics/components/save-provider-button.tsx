"use client";

import { Bookmark, Check } from "lucide-react";
import { useState } from "react";
import { basicsProviderRepository } from "../repositories/basics-repositories";
import styles from "./basics-workspace.module.css";

export function SaveProviderButton({ providerId }: { providerId: string }) {
  const [saved, setSaved] = useState(false);

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

