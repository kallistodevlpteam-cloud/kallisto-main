"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Compass,
  Plus,
  ArrowRight,
  ClipboardCheck,
  Sparkles,
} from "lucide-react";
import styles from "../home-workspace.module.css";

export function HomeQuickActions() {
  return (
    <div className={styles.homeQuickActionsContainer}>
      <div className={styles.homeActionBtnRow}>
        <Link href="/boq/new" className={styles.homePrimaryActionBtn}>
          <FileSpreadsheet size={15} />
          <span>Create BOQ</span>
        </Link>
        <Link href="/tools?tool=ai-plan" className={styles.homeSecondaryActionBtn}>
          <Compass size={15} />
          <span>Generate AI Plan</span>
        </Link>
      </div>
      <div className={styles.homeActionSubLinksRow}>
        <Link href="/documents?filter=approvals" className={styles.homeSubActionLink}>
          <ClipboardCheck size={13} />
          <span>Review Approvals Queue</span>
        </Link>
      </div>
    </div>
  );
}
