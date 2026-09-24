"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FolderPlus, Plus, Trash2, UploadCloud, X, AlertCircle } from "lucide-react";
import type {
  PortfolioCollection,
  PortfolioProject,
} from "@/features/portfolio/types/portfolio.types";
import styles from "./add-collection-modal.module.css";

interface SelectedImageItem {
  id: string;
  url: string;
  file?: File;
  name: string;
}

export interface AddCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCollection: (collection: PortfolioCollection) => void;
  availableProjects?: PortfolioProject[];
}

export function AddCollectionModal({
  isOpen,
  onClose,
  onAddCollection,
}: AddCollectionModalProps) {
  const [title, setTitle] = useState("");
  const [images, setImages] = useState<SelectedImageItem[]>([]);
  const [coverImageId, setCoverImageId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const resetForm = useCallback(() => {
    setTitle("");
    images.forEach((img) => {
      if (img.url.startsWith("blob:")) {
        URL.revokeObjectURL(img.url);
      }
    });
    setImages([]);
    setCoverImageId("");
    setError(null);
  }, [images]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  // Close on Escape key and autofocus title input
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const timer = setTimeout(() => {
      titleInputRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, handleClose]);

  // Clean up object URLs on component unmount
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.url.startsWith("blob:")) {
          URL.revokeObjectURL(img.url);
        }
      });
    };
  }, [images]);

  if (!isOpen) return null;

  const handleProcessFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    setError(null);
    const newItems: SelectedImageItem[] = [];

    Array.from(fileList).forEach((file) => {
      if (!file.type.startsWith("image/")) return;

      const url = URL.createObjectURL(file);
      const id = `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      newItems.push({
        id,
        url,
        file,
        name: file.name,
      });
    });

    if (newItems.length === 0) {
      setError("Please select valid image files (JPG, PNG, WebP).");
      return;
    }

    setImages((prev) => {
      const combined = [...prev, ...newItems];
      if (!coverImageId && combined.length > 0) {
        setCoverImageId(combined[0].id);
      }
      return combined;
    });
  };

  const handleRemoveImage = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setImages((prev) => {
      const itemToRemove = prev.find((item) => item.id === id);
      if (itemToRemove && itemToRemove.url.startsWith("blob:")) {
        URL.revokeObjectURL(itemToRemove.url);
      }
      const updated = prev.filter((item) => item.id !== id);

      if (coverImageId === id) {
        setCoverImageId(updated.length > 0 ? updated[0].id : "");
      }
      return updated;
    });
  };

  const handleSetCover = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCoverImageId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleProcessFiles(e.dataTransfer.files);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Please enter a collection title.");
      titleInputRef.current?.focus();
      return;
    }

    if (images.length === 0) {
      setError("Please add at least one image to the collection.");
      return;
    }

    const coverItem =
      images.find((img) => img.id === coverImageId) ?? images[0];

    const newCollection: PortfolioCollection = {
      id: `collection-${Date.now()}`,
      label: title.trim(),
      imageUrl: coverItem ? coverItem.url : undefined,
      images: images.map((img) => img.url),
      projectIds: [],
      hasGradientRing: true,
    };

    onAddCollection(newCollection);
    setTitle("");
    setImages([]);
    setCoverImageId("");
    setError(null);
    onClose();
  };

  return (
    <div
      className={styles.modalOverlay}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-collection-modal-title"
    >
      <div
        className={styles.modalDialog}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.iconBadge}>
              <FolderPlus size={20} />
            </div>
            <div>
              <h2 id="new-collection-modal-title" className={styles.modalTitle}>
                New Collection
              </h2>
              <p className={styles.modalSubtitle}>
                Add title and multiple images for your highlights
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            {error && (
              <div className={styles.errorMessage} role="alert">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Collection Title */}
            <div className={styles.formGroup}>
              <label htmlFor="collection-title-input" className={styles.label}>
                Collection Title <span className={styles.required}>*</span>
              </label>
              <input
                id="collection-title-input"
                ref={titleInputRef}
                type="text"
                className={styles.input}
                placeholder="e.g., Luxury Residential, Concept Sketches, 3D Renders"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError(null);
                }}
                maxLength={60}
              />
            </div>

            {/* Images Upload / Grid */}
            <div className={styles.formGroup}>
              <div className={styles.labelRow}>
                <span className={styles.label}>
                  Showcase Images <span className={styles.required}>*</span>
                </span>
                {images.length > 0 && (
                  <span className={styles.countBadge}>
                    {images.length} {images.length === 1 ? "image" : "images"} selected
                  </span>
                )}
              </div>

              {/* Initial Dropzone when no images uploaded */}
              {images.length === 0 ? (
                <div
                  className={`${styles.dropzone} ${
                    isDragging ? styles.dropzoneActive : ""
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      fileInputRef.current?.click();
                    }
                  }}
                  aria-label="Upload multiple images"
                >
                  <div className={styles.dropzoneIconWrapper}>
                    <UploadCloud size={24} />
                  </div>
                  <p className={styles.dropzoneText}>
                    Click or drag & drop images to upload
                  </p>
                  <p className={styles.dropzoneSubtext}>
                    Supports PNG, JPG, WebP. You can select multiple images.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    className={styles.visuallyHiddenInput}
                    onChange={(e) => {
                      handleProcessFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </div>
              ) : (
                <div className={styles.previewSection}>
                  <div className={styles.previewGrid}>
                    {images.map((item) => {
                      const isCover = item.id === coverImageId;

                      return (
                        <div
                          key={item.id}
                          className={`${styles.previewCard} ${
                            isCover ? styles.previewCardCover : ""
                          }`}
                          onClick={(e) => handleSetCover(item.id, e)}
                          title={isCover ? "Cover image" : "Click to set as cover"}
                        >
                          <Image
                            src={item.url}
                            alt={item.name}
                            fill
                            className={styles.previewImage}
                            sizes="120px"
                            unoptimized
                          />

                          {isCover ? (
                            <span className={styles.coverBadge}>Cover</span>
                          ) : (
                            <span className={styles.makeCoverPrompt}>
                              Set Cover
                            </span>
                          )}

                          <button
                            type="button"
                            className={styles.cardRemoveButton}
                            onClick={(e) => handleRemoveImage(item.id, e)}
                            aria-label={`Remove image ${item.name}`}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      );
                    })}

                    {/* Add more button tile */}
                    <button
                      type="button"
                      className={styles.addMoreCard}
                      onClick={() => addMoreInputRef.current?.click()}
                      aria-label="Add more images"
                    >
                      <Plus size={20} />
                      <span>Add More</span>
                    </button>
                  </div>

                  <input
                    ref={addMoreInputRef}
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    className={styles.visuallyHiddenInput}
                    onChange={(e) => {
                      handleProcessFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
            >
              <Plus size={16} />
              <span>Create Collection</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
