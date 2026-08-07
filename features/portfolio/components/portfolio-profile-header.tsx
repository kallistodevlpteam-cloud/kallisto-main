"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import {
  Camera,
  Check,
  Globe2,
  MapPin,
} from "lucide-react";
import type { PortfolioProfile } from "@/features/portfolio/types/portfolio.types";
import styles from "./portfolio.module.css";

interface PortfolioProfileHeaderProps {
  isOwner: boolean;
  profile: PortfolioProfile;
  onProfileChange: (profile: PortfolioProfile) => void;
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
  onProfileChange,
  isEditingExternal,
  onCloseEditingExternal,
  onCameraClick,
}: PortfolioProfileHeaderProps) {
  const [internalEditing, setInternalEditing] = useState(false);
  const [draft, setDraft] = useState(profile);
  const [skillsInput, setSkillsInput] = useState(profile.skills.join(", "));

  const editing = isEditingExternal ?? internalEditing;
  const setEditing = (val: boolean) => {
    setInternalEditing(val);
    if (!val && onCloseEditingExternal) {
      onCloseEditingExternal();
    }
  };

  const saveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onProfileChange({
      ...draft,
      skills: skillsInput
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
        .slice(0, 6),
    });
    setEditing(false);
  };

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
                <span className={styles.verifiedBadge}>
                  <span className={styles.verifiedCheckIconWrap}>
                    <Check size={10} strokeWidth={3} aria-hidden="true" />
                  </span>
                  Verified
                </span>
              ) : null}
            </div>

            <p className={styles.profession}>{profile.profession}</p>

            <div className={styles.locationWebsiteLine}>
              <span className={styles.locationItem}>
                <MapPin size={14} aria-hidden="true" />
                {profile.location}
              </span>
              <a
                className={styles.websiteItem}
                href={profile.websiteUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Globe2 size={14} aria-hidden="true" />
                {profile.websiteLabel}
              </a>
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

      {editing ? (
        <form className={styles.profileEditor} onSubmit={saveProfile}>
          <div className={styles.editorHeading}>
            <div>
              <h2>Edit portfolio profile</h2>
              <p>Keep the summary concise and focused on your professional work.</p>
            </div>
            <button
              className={styles.textButton}
              type="button"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </div>
          <div className={styles.editorGrid}>
            <label>
              <span>Name</span>
              <input
                value={draft.name}
                onChange={(event) =>
                  setDraft({ ...draft, name: event.target.value })
                }
                required
              />
            </label>
            <label>
              <span>Profession / Tagline</span>
              <input
                value={draft.profession}
                onChange={(event) =>
                  setDraft({ ...draft, profession: event.target.value })
                }
                required
              />
            </label>
            <label>
              <span>Location</span>
              <input
                value={draft.location}
                onChange={(event) =>
                  setDraft({ ...draft, location: event.target.value })
                }
                required
              />
            </label>
            <label>
              <span>Website</span>
              <input
                value={draft.websiteLabel}
                onChange={(event) =>
                  setDraft({ ...draft, websiteLabel: event.target.value })
                }
                required
              />
            </label>
            <label className={styles.editorWideField}>
              <span>Professional bio</span>
              <textarea
                value={draft.bio}
                maxLength={180}
                rows={2}
                onChange={(event) =>
                  setDraft({ ...draft, bio: event.target.value })
                }
                required
              />
            </label>
            <label className={styles.editorWideField}>
              <span>Skills, comma separated</span>
              <input
                value={skillsInput}
                onChange={(event) => setSkillsInput(event.target.value)}
              />
            </label>
          </div>
          <div className={styles.editorActions}>
            <button className={styles.primaryButton} type="submit">
              Save profile
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
