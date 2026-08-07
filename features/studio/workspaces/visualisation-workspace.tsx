"use client";

import Image from "next/image";
import React from "react";
import { StudioOutputVersion, StudioTask, VisualisationTaskConfiguration } from "@/types/domain/studio";
import styles from "./studio-workspace.module.css";

export interface VisualisationWorkspaceProps {
  task: StudioTask;
  version: StudioOutputVersion;
  readOnly?: boolean;
}

export function VisualisationWorkspace({ task, version, readOnly }: VisualisationWorkspaceProps) {
  const config = version.configurationSnapshot as VisualisationTaskConfiguration;

  return (
    <div className={styles.editorContainer}>
      <div className={styles.paramsSummaryRow}>
        <div className={styles.paramItem}>
          <span className={styles.paramLabel}>Visual Type:</span>
          <span className={styles.paramVal}>{config.visualType || "Interior Render"}</span>
        </div>
        <div className={styles.paramItem}>
          <span className={styles.paramLabel}>Design Direction:</span>
          <span className={styles.paramVal}>{config.designDirection || "Modern Luxury"}</span>
        </div>
        <div className={styles.paramItem}>
          <span className={styles.paramLabel}>Aspect Ratio &amp; Quality:</span>
          <span className={styles.paramVal}>{config.aspectRatio || "16:9"} &bull; {config.outputQuality || "4K Render"}</span>
        </div>
      </div>

      <div className={styles.visualGrid}>
        <div className={styles.visCard}>
          <div className={styles.visImageWrap}>
            <Image
              src="/assets/studio/visualisations-flatlay.jpg"
              alt="Visualisation Render Option A"
              fill
              className={styles.visImg}
            />
            <span className={styles.visBadge}>Option A - Warm Tone</span>
          </div>
          <h5 className={styles.visTitle}>Living Room Main View Concept</h5>
          <p className={styles.visDesc}>Botticino Marble flooring with walnut wood panelling &amp; accent lighting.</p>
        </div>

        <div className={styles.visCard}>
          <div className={styles.visImageWrap}>
            <Image
              src="/assets/studio/proposals-flatlay.jpg"
              alt="Visualisation Render Option B"
              fill
              className={styles.visImg}
            />
            <span className={styles.visBadge}>Option B - Cool Tone</span>
          </div>
          <h5 className={styles.visTitle}>Material Palette Board</h5>
          <p className={styles.visDesc}>Statuario Quartzite counter top with brushed brass fixtures.</p>
        </div>
      </div>
    </div>
  );
}
