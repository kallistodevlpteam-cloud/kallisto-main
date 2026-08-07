"use client";

import React, { useState } from "react";
import { MapPin, AlertCircle } from "lucide-react";
import { ServiceAreaDialog } from "./components/dialogs/service-area-dialog";
import styles from "./home-workspace.module.css";

export interface HomeHeaderProps {
  userName?: string;
  attentionCount?: number;
  serviceArea?: string;
  onServiceAreaChange?: (newArea: string) => void;
}

export function HomeHeader({
  userName = "Arjun",
  attentionCount = 5,
  serviceArea,
  onServiceAreaChange,
}: HomeHeaderProps) {
  const [currentServiceArea, setCurrentServiceArea] = useState(serviceArea || "Kochi, Kerala");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  return (
    <div className={styles.headerAreaContainer}>
      <div className={styles.headerTopRow}>
        <div className={styles.greetingGroup}>
          <h1 className={styles.mainGreeting}>
            {greetingPrefix}, {userName}
          </h1>
          <div className={styles.greetingMetaSubRow}>
            <span className={styles.metaDate}>{formattedDate}</span>
            {attentionCount > 0 && (
              <span className={styles.attentionCountBadge}>
                <AlertCircle size={14} />
                <span>{attentionCount} items need attention</span>
              </span>
            )}
            <div className={styles.serviceAreaControlInline}>
              <MapPin size={15} className={styles.locationPinIcon} />
              <span>
                Service area: <strong className={styles.serviceAreaText}>{currentServiceArea}</strong>
              </span>
              <button
                type="button"
                className={styles.changeAreaBtnInline}
                onClick={() => setIsDialogOpen(true)}
              >
                Change
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
