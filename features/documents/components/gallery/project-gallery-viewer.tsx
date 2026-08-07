"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import type { GalleryImage } from "./project-thumbnail-rail";

export interface ProjectGalleryViewerProps {
  image: GalleryImage;
}

export function ProjectGalleryViewer({ image }: ProjectGalleryViewerProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 1));
  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
    if (isFullscreen) {
      setZoomLevel(1);
    }
  };

  return (
    <div className={`project-gallery-viewer ${isFullscreen ? "is-fullscreen" : ""}`}>
      {/* Neutral Background Frame */}
      <div className="project-viewer-frame">
        <Image
          key={image.id}
          src={image.src}
          alt={image.alt}
          fill
          unoptimized
          loading="eager"
          className="project-viewer-img"
          style={{ transform: `scale(${zoomLevel})` }}
          sizes="(max-width: 1080px) 100vw, (max-width: 1400px) 800px, 1200px"
        />

        {/* Top-Right Compact Controls (Zoom In, Zoom Out, Fullscreen) */}
        <div className="project-viewer-controls" aria-label="Gallery controls">
          <button
            type="button"
            className="project-viewer-control-btn"
            onClick={handleZoomIn}
            title="Zoom In"
            aria-label="Zoom In"
            disabled={zoomLevel >= 2}
          >
            <ZoomIn size={15} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            className="project-viewer-control-btn"
            onClick={handleZoomOut}
            title="Zoom Out"
            aria-label="Zoom Out"
            disabled={zoomLevel <= 1}
          >
            <ZoomOut size={15} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            className="project-viewer-control-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            <Maximize2 size={15} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </div>
  );
}
