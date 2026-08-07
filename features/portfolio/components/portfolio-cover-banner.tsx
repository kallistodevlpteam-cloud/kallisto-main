"use client";

import { useRef } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import type { PortfolioProfile } from "@/features/portfolio/types/portfolio.types";
import { PortfolioProfileActions } from "./portfolio-profile-actions";
import styles from "./portfolio.module.css";

interface PortfolioCoverBannerProps {
  isOwner: boolean;
  profile: PortfolioProfile;
  coverImageUrl?: string;
  onCoverSelected: (file: File) => void;
  onEdit: () => void;
}

export function PortfolioCoverBanner({
  isOwner,
  profile,
  coverImageUrl,
  onCoverSelected,
  onEdit,
}: PortfolioCoverBannerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeBannerUrl =
    coverImageUrl || profile.coverImageUrl || "/assets/hero-architecture-banner.webp";

  return (
    <div className={styles.coverBannerContainer}>
      <div className={styles.coverBanner} aria-label="Portfolio cover">
        {activeBannerUrl ? (
          <Image
            src={activeBannerUrl}
            alt="Architecture portfolio cover banner"
            fill
            priority
            unoptimized={activeBannerUrl.startsWith("blob:")}
            className={styles.coverImage}
            sizes="(max-width: 640px) 100vw, (max-width: 1160px) 90vw, 1120px"
          />
        ) : null}

        <div className={styles.bannerActionsOverlay}>
          <PortfolioProfileActions
            isOwner={isOwner}
            profile={profile}
            onEdit={onEdit}
          />
        </div>

        {isOwner ? (
          <input
            className={styles.visuallyHiddenInput}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            aria-label="Select portfolio cover image"
            ref={fileInputRef}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                onCoverSelected(file);
              }
              event.target.value = "";
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
