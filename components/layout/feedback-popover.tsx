"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./feedback-popover.module.css";
import { CheckCircle2, Image as ImageIcon } from "lucide-react";

interface FeedbackPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackPopover({ isOpen, onClose }: FeedbackPopoverProps) {
  const [feedbackText, setFeedbackText] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(".feedback-pill")) {
        return;
      }
      if (containerRef.current && !containerRef.current.contains(target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside, { passive: true });
      document.addEventListener("keydown", handleKeyDown);
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchstart", handleClickOutside);
        document.removeEventListener("keydown", handleKeyDown);
        clearTimeout(timer);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      filesArray.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            setUploadedImages((prev) => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFeedbackText("");
      setUploadedImages([]);
      onClose();
    }, 1800);
  };

  return (
    <div
      ref={containerRef}
      className={styles.popoverContainer}
      role="dialog"
      aria-label="Submit Feedback"
    >
      {isSubmitted ? (
        <div className={styles.successMessage}>
          <CheckCircle2 size={24} className="text-emerald-600" style={{ color: "#10b981" }} />
          <h4 className={styles.successTitle}>Thank you for your feedback!</h4>
          <p className={styles.successSub}>We read every submission carefully.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className={styles.textareaWrap}>
            <textarea
              ref={textareaRef}
              className={styles.textarea}
              placeholder="Type your feedback here..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={4}
            />
          </div>

          {uploadedImages.length > 0 && (
            <div className={styles.imagePreviewsContainer}>
              {uploadedImages.map((imgSrc, index) => (
                <div key={index} className={styles.previewThumbWrapper}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imgSrc} alt="Preview" className={styles.previewThumb} />
                  <button
                    type="button"
                    className={styles.removeImageBtn}
                    onClick={() => handleRemoveImage(index)}
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className={styles.popoverFooter}>
            <div className={styles.footerLeft}>
              <p className={styles.disclaimerText}>
                We don&apos;t respond to submissions, but we read all of them carefully
              </p>
            </div>
            <div className={styles.footerRight}>
              <label
                htmlFor="feedback-image-upload"
                className={styles.attachBtn}
                title="Attach screenshots"
              >
                <ImageIcon size={15} />
              </label>
              <input
                id="feedback-image-upload"
                type="file"
                accept="image/*"
                multiple
                className={styles.hiddenInput}
                onChange={handleImageUpload}
              />
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={!feedbackText.trim()}
              >
                Submit
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
