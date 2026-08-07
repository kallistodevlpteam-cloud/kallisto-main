"use client";

import { Check, Copy, Laptop, Monitor } from "lucide-react";
import { useState } from "react";
import { KallistoBrand } from "./kallisto-brand";

export function MobileScreenGuard() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mobile-screen-guard" role="alert" aria-live="polite">
      <div className="mobile-guard-card">
        <div className="guard-brand">
          <KallistoBrand />
        </div>
        <div className="guard-illustration">
          <div className="device-icon-wrap">
            <Monitor size={34} strokeWidth={1.75} />
            <span className="laptop-badge">
              <Laptop size={14} />
            </span>
          </div>
        </div>
        <h2>Desktop &amp; iPad Workspace</h2>
        <p>
          Kallisto is designed for Desktop and iPad screens to provide the full studio workspace experience.
        </p>
        <p className="guard-instruction">
          Please open this application on a desktop, laptop, or iPad device.
        </p>
        <div className="guard-actions">
          <button className="guard-copy-btn" type="button" onClick={handleCopy}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? "Link copied!" : "Copy link for desktop"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
