"use client";

import React, { useState } from "react";
import { ServiceAreaDialog } from "./components/dialogs/service-area-dialog";
import { MapPinDuotoneIcon } from "@/components/layout/sidebar-icons";
import styles from "./home-workspace.module.css";

export interface HomeHeaderProps {
  userName?: string;
  attentionCount?: number;
  serviceArea?: string;
  onServiceAreaChange?: (newArea: string) => void;
  isServiceAvailable?: boolean;
  onServiceAvailabilityChange?: (available: boolean) => void;
}

export function HomeHeader({
  userName = "Arjun",
  attentionCount = 5,
  serviceArea,
  onServiceAreaChange,
  isServiceAvailable = true,
  onServiceAvailabilityChange,
}: HomeHeaderProps) {
  const [currentServiceArea, setCurrentServiceArea] = useState(serviceArea || "Kochi, Kerala");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAvailable, setIsAvailable] = useState(isServiceAvailable);

  // Dynamic Time-of-day greeting
  const hour = new Date().getHours();
  let greetingPrefix = "Good morning";
  if (hour >= 12 && hour < 17) greetingPrefix = "Good afternoon";
  else if (hour >= 17) greetingPrefix = "Good evening";

  // Dynamic Date string formatting (e.g. Tuesday, July 21)
  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const handleSaveArea = (newArea: string) => {
    setCurrentServiceArea(newArea);
    if (onServiceAreaChange) {
      onServiceAreaChange(newArea);
    }
  };

  const handleToggleAvailability = () => {
    const nextState = !isAvailable;
    setIsAvailable(nextState);
    if (onServiceAvailabilityChange) {
      onServiceAvailabilityChange(nextState);
    }
  };

  return (
    <div className={styles.headerAreaContainer}>
      <div className={styles.headerTopRow}>
        <div className={styles.greetingGroup}>
          <h1 className={styles.mainGreeting}>
            {greetingPrefix}, {userName}
          </h1>
          <div className={styles.greetingMetaSubRow}>
            {/* Left: Clickable Location / Service Area */}
            <button
              type="button"
              className={styles.serviceAreaClickableBtn}
              onClick={() => setIsDialogOpen(true)}
              aria-label={`Change service area, currently ${currentServiceArea}`}
            >
              <MapPinDuotoneIcon size={16} className={styles.locationPinIcon} />
              <span>
                Service area: <strong className={styles.serviceAreaText}>{currentServiceArea}</strong>
              </span>
            </button>

            {/* Right: Availability Toggle */}
            <div className={styles.availabilityToggleWrapper}>
              <span className={styles.availabilityLabel}>
                <span
                  className={`${styles.availabilityStatusDot} ${
                    isAvailable ? styles.statusDotActive : styles.statusDotInactive
                  }`}
                />
                <span>{isAvailable ? "Available for service" : "Service paused"}</span>
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={isAvailable}
                aria-label="Toggle service availability"
                className={`${styles.availabilitySwitch} ${
                  isAvailable ? styles.switchActive : ""
                }`}
                onClick={handleToggleAvailability}
              >
                <span className={styles.switchThumb} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <ServiceAreaDialog
        isOpen={isDialogOpen}
        currentServiceArea={currentServiceArea}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveArea}
      />
    </div>
  );
}
