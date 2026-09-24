"use client";

import Image from "next/image";
import { Camera } from "lucide-react";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { LocationDuotoneIcon } from "@/components/layout/sidebar-icons";
import type { PortfolioProfile } from "@/features/portfolio/types/portfolio.types";
import styles from "./portfolio.module.css";

interface PortfolioProfileHeaderProps {
  isOwner?: boolean;
  profile: PortfolioProfile;
  onProfileChange?: (profile: PortfolioProfile) => void;
  isEditingExternal?: boolean;
  onCloseEditingExternal?: () => void;
  onCameraClick?: () => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function PortfolioProfileHeader({
  profile,
  onCameraClick,
}: PortfolioProfileHeaderProps) {
  const initials = getInitials(profile.name);
  const visibleSkills = profile.skills.slice(0, 3);
  const remainingSkillCount = Math.max(profile.skills.length - visibleSkills.length, 0);

  return (
    <section className={styles.profileSection} aria-labelledby="portfolio-name">
      <div className={styles.profileHeaderLayout}>
        <div className={styles.avatarSquircleFrame}>
          <div className={styles.avatarSquircle}>
            {profile.avatarUrl &&
            !profile.avatarUrl.includes("profile_avatar.png") &&
            !profile.avatarUrl.includes("default") ? (
              <Image
                className={styles.avatarImage}
                src={profile.avatarUrl}
                alt={`${profile.name} profile`}
                fill
                priority
                sizes="112px"
              />
            ) : (
              <span className={styles.avatarInitials}>{initials}</span>
            )}
          </div>
          <button
            className={styles.avatarCameraBadge}
            type="button"
            title="Upload photo"
            aria-label="Upload photo"
            onClick={onCameraClick}
          >
            <Camera size={15} aria-hidden="true" />
          </button>
        </div>

        <div className={styles.profileIdentityGroup}>
          <div className={styles.profileIdentity}>
            <div className={styles.nameLine}>
              <h1 className={styles.profileName} id="portfolio-name">
                {profile.name}
              </h1>
              {profile.verified ? (
                <VerifiedBadge size={19} title="Kallisto Verified Practice" />
              ) : null}
            </div>

            <p className={styles.profession}>{profile.profession}</p>

            <div className={styles.locationWebsiteLine}>
              <span className={styles.locationItem}>
                <LocationDuotoneIcon size={15} className={styles.locationIcon} />
                <span>{profile.location}</span>
              </span>
            </div>

            <div className={styles.skillList} aria-label="Skills">
              {visibleSkills.map((skill) => (
                <span className={styles.skillTag} key={skill}>
                  {skill}
                </span>
              ))}
              {remainingSkillCount > 0 ? (
                <span className={styles.skillMoreTag}>
                  +{remainingSkillCount} more
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
