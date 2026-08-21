"use client";

import React, { useRef } from "react";
import {
  DocumentsDuotoneIcon,
  DrawingsDuotoneIcon,
  PlusDuotoneIcon,
  PortfolioDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import { StudioSource, StudioSourceType } from "../../types/studio-source";

export interface ComposerAttachmentMenuProps {
  attachments: StudioSource[];
  onAddAttachment: (source: StudioSource) => void;
  onRemoveAttachment: (sourceId: string) => void;
}

export function ComposerAttachmentMenu({
  attachments,
  onAddAttachment,
  onRemoveAttachment,
}: ComposerAttachmentMenuProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let sourceType: StudioSourceType = "document";
      if (file.type.startsWith("image/")) {
        sourceType = "image";
      } else if (file.name.endsWith(".dwg") || file.name.endsWith(".dxf") || file.name.includes("plan")) {
        sourceType = "drawing";
      }

      const newSource: StudioSource = {
        id: `src-${Date.now()}-${i}`,
        type: sourceType,
        name: file.name,
        mimeType: file.type,
        size: file.size,
        status: "ready",
      };
      onAddAttachment(newSource);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        title="Add attachment"
        aria-label="Add attachment"
        style={{
          display: "grid",
          placeItems: "center",
          width: "28px",
          height: "28px",
          border: "none",
          borderRadius: "50%",
          background: "transparent",
          color: "#475569",
          cursor: "pointer",
          padding: 0,
          transition: "color 0.15s ease, background-color 0.15s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.05)")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
      >
        <PlusDuotoneIcon size={18} />
      </button>

      {attachments.map((source) => (
        <span
          key={source.id}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            height: "26px",
            padding: "0 8px",
            border: "none",
            borderRadius: "6px",
            background: "#f7f7f5",
            color: "#0f172a",
            fontSize: "11.5px",
            fontWeight: 500,
          }}
        >
          {source.type === "image" ? (
            <PortfolioDuotoneIcon size={13} style={{ color: "#0284c7" }} />
          ) : source.type === "drawing" ? (
            <DrawingsDuotoneIcon size={13} style={{ color: "#059669" }} />
          ) : (
            <DocumentsDuotoneIcon size={13} style={{ color: "#e11d48" }} />
          )}
          <span style={{ maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {source.name}
          </span>
          <button
            type="button"
            onClick={() => onRemoveAttachment(source.id)}
            style={{ border: "none", background: "none", color: "#94a3b8", cursor: "pointer", padding: "0 2px" }}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}
