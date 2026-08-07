"use client";

import React, { useRef } from "react";
import { FileText, Image as ImageIcon, Plus } from "lucide-react";
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
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          border: "none",
          background: "none",
          color: "#475569",
          cursor: "pointer",
          padding: "2px",
        }}
      >
        <Plus size={18} strokeWidth={1.8} />
      </button>

      {attachments.map((source) => (
        <span
          key={source.id}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            height: "26px",
            padding: "0 8px",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            background: "#f8fafc",
            color: "#0f172a",
            fontSize: "11.5px",
            fontWeight: 500,
          }}
        >
          {source.type === "image" ? <ImageIcon size={12} /> : <FileText size={12} />}
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
