"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Folder,
  Image as ImageIcon,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import type { PortfolioCollection } from "@/features/portfolio/types/portfolio.types";
import styles from "./collection-viewer-modal.module.css";

interface EditImageItem {
  id: string;
  url: string;
  name: string;
  file?: File;
}

export interface CollectionViewerModalProps {
  isOpen: boolean;
  collection: PortfolioCollection | null;
  isOwner: boolean;
  onClose: () => void;
  onUpdateCollection?: (updated: PortfolioCollection) => void;
}

function CollectionViewerDialog({
  collection,
  isOwner,
  onClose,
  onUpdateCollection,
}: {
  collection: PortfolioCollection;
  isOwner: boolean;
  onClose: () => void;
  onUpdateCollection?: (updated: PortfolioCollection) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Edit mode state initialized from collection
  const [editTitle, setEditTitle] = useState(collection.label);
  const initialImages = useMemo(() => {
    return (
      collection.images && collection.images.length > 0
        ? collection.images
        : collection.imageUrl
          ? [collection.imageUrl]
          : []
    ).map((url, idx) => ({
      id: `img-${collection.id}-${idx}`,
      url,
      name: `Image ${idx + 1}`,
    }));
  }, [collection]);

  const [editImages, setEditImages] = useState<EditImageItem[]>(initialImages);
  const [editCoverId, setEditCoverId] = useState<string>(initialImages[0]?.id ?? "");
  const [editError, setEditError] = useState<string | null>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);

  // Derive all image URLs for view mode
  const viewImages = useMemo(() => {
    if (collection.images && collection.images.length > 0) {
      return collection.images;
    }
    return collection.imageUrl ? [collection.imageUrl] : [];
  }, [collection]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isEditing) {
          setIsEditing(false);
        } else {
          onClose();
        }
      } else if (!isEditing && viewImages.length > 1) {
        if (e.key === "ArrowLeft") {
          setActiveImageIndex((prev) =>
            prev === 0 ? viewImages.length - 1 : prev - 1,
          );
        } else if (e.key === "ArrowRight") {
          setActiveImageIndex((prev) =>
            prev === viewImages.length - 1 ? 0 : prev + 1,
          );
        }
      }
    },
    [isEditing, onClose, viewImages.length],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const currentImageUrl = viewImages[activeImageIndex] ?? collection.imageUrl;

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIndex((prev) =>
      prev === viewImages.length - 1 ? 0 : prev + 1,
    );
  };

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIndex((prev) =>
      prev === 0 ? viewImages.length - 1 : prev - 1,
    );
  };

  // Edit actions
  const handleAddFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setEditError(null);

    const newItems: EditImageItem[] = [];
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);
      const id = `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      newItems.push({
        id,
        url,
        name: file.name,
        file,
      });
    });

    if (newItems.length === 0) {
      setEditError("Please select valid image files.");
      return;
    }

    setEditImages((prev) => {
      const combined = [...prev, ...newItems];
      if (!editCoverId && combined.length > 0) {
        setEditCoverId(combined[0].id);
      }
      return combined;
    });
  };

  const handleRemoveImage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditImages((prev) => {
      const itemToRemove = prev.find((item) => item.id === id);
      if (itemToRemove && itemToRemove.url.startsWith("blob:")) {
        URL.revokeObjectURL(itemToRemove.url);
      }
      const updated = prev.filter((item) => item.id !== id);
      if (editCoverId === id) {
        setEditCoverId(updated.length > 0 ? updated[0].id : "");
      }
      return updated;
    });
  };

  const handleSetCover = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditCoverId(id);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editTitle.trim()) {
      setEditError("Collection title cannot be empty.");
      return;
    }

    if (editImages.length === 0) {
      setEditError("Please retain at least one image in the collection.");
      return;
    }

    const coverItem =
      editImages.find((img) => img.id === editCoverId) ?? editImages[0];

    const updatedCollection: PortfolioCollection = {
      ...collection,
      label: editTitle.trim(),
      imageUrl: coverItem?.url ?? collection.imageUrl,
      images: editImages.map((img) => img.url),
    };

    onUpdateCollection?.(updatedCollection);
    setIsEditing(false);
  };

  return (
    <div
      className={styles.modalOverlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="collection-viewer-title"
    >
      <div
        className={styles.modalDialog}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.titleArea}>
              <h2 id="collection-viewer-title" className={styles.modalTitle}>
                {isEditing ? `Edit: ${collection.label}` : collection.label}
              </h2>
              <p className={styles.modalSubtitle}>
                <Folder size={12} />
                <span>
                  {collection.projectIds?.length
                    ? `${collection.projectIds.length} ${
                        collection.projectIds.length === 1
                          ? "project"
                          : "projects"
                      }`
                    : viewImages.length > 0
                      ? `${viewImages.length} ${
                          viewImages.length === 1 ? "image" : "images"
                        }`
                      : "Collection"}
                </span>
              </p>
            </div>
          </div>

          <div className={styles.headerActions}>
            {isOwner && !isEditing && (
              <button
                type="button"
                className={styles.editButton}
                onClick={() => setIsEditing(true)}
                aria-label="Edit collection"
              >
                <Pencil size={13} />
                <span>Edit</span>
              </button>
            )}

            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close viewer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className={styles.modalBody}>
          {!isEditing ? (
            /* VIEW MODE */
            <div className={styles.viewerContainer}>
              <div className={styles.imageFrame}>
                {currentImageUrl ? (
                  <Image
                    src={currentImageUrl}
                    alt={`${collection.label} preview`}
                    fill
                    className={styles.mainImage}
                    sizes="(max-width: 768px) 100vw, 760px"
                    priority
                    unoptimized={
                      currentImageUrl.startsWith("blob:") ||
                      currentImageUrl.startsWith("data:")
                    }
                  />
                ) : (
                  <div className={styles.emptyImagePlaceholder}>
                    <ImageIcon size={32} />
                    <span>No image available</span>
                  </div>
                )}

                {/* Multiple Images Navigation Controls */}
                {viewImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      className={`${styles.navButton} ${styles.navPrev}`}
                      onClick={handlePrevImage}
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      type="button"
                      className={`${styles.navButton} ${styles.navNext}`}
                      onClick={handleNextImage}
                      aria-label="Next image"
                    >
                      <ChevronRight size={20} />
                    </button>
                    <span className={styles.imageCounterBadge}>
                      {activeImageIndex + 1} / {viewImages.length}
                    </span>
                  </>
                )}
              </div>

              {/* Thumbnails strip for fast browsing */}
              {viewImages.length > 1 && (
                <div
                  className={styles.thumbnailStrip}
                  role="tablist"
                  aria-label="Collection images preview"
                >
                  {viewImages.map((imgUrl, index) => {
                    const isActive = index === activeImageIndex;
                    return (
                      <button
                        key={`${imgUrl}-${index}`}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        className={`${styles.thumbnailButton} ${
                          isActive ? styles.thumbnailActive : ""
                        }`}
                        onClick={() => setActiveImageIndex(index)}
                        aria-label={`View image ${index + 1}`}
                      >
                        <Image
                          src={imgUrl}
                          alt={`Thumbnail ${index + 1}`}
                          fill
                          className={styles.thumbnailImage}
                          sizes="64px"
                          unoptimized={
                            imgUrl.startsWith("blob:") ||
                            imgUrl.startsWith("data:")
                          }
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* EDIT MODE */
            <form onSubmit={handleSaveEdit} className={styles.editForm}>
              {editError && (
                <div className={styles.errorMessage} role="alert">
                  <AlertCircle size={16} />
                  <span>{editError}</span>
                </div>
              )}

              {/* Title input */}
              <div className={styles.formGroup}>
                <label
                  htmlFor="edit-collection-title-input"
                  className={styles.label}
                >
                  Collection Title <span className={styles.required}>*</span>
                </label>
                <input
                  id="edit-collection-title-input"
                  type="text"
                  className={styles.input}
                  value={editTitle}
                  onChange={(e) => {
                    setEditTitle(e.target.value);
                    if (editError) setEditError(null);
                  }}
                  maxLength={60}
                  placeholder="Enter collection title"
                />
              </div>

              {/* Images Manager Grid */}
              <div className={styles.formGroup}>
                <div className={styles.labelRow}>
                  <span className={styles.label}>
                    Collection Images <span className={styles.required}>*</span>
                  </span>
                  <span className={styles.countBadge}>
                    {editImages.length}{" "}
                    {editImages.length === 1 ? "image" : "images"}
                  </span>
                </div>

                <div className={styles.previewGrid}>
                  {editImages.map((item) => {
                    const isCover = item.id === editCoverId;

                    return (
                      <div
                        key={item.id}
                        className={`${styles.previewCard} ${
                          isCover ? styles.previewCardCover : ""
                        }`}
                        onClick={(e) => handleSetCover(item.id, e)}
                        title={
                          isCover ? "Cover image" : "Click to set as cover"
                        }
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
                    aria-label="Add more images to collection"
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
                    handleAddFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </div>

              {/* Action buttons */}
              <div className={styles.modalFooter} style={{ padding: "8px 0 0" }}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    setIsEditing(false);
                    setEditError(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton}>
                  <Check size={16} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export function CollectionViewerModal({
  isOpen,
  collection,
  isOwner,
  onClose,
  onUpdateCollection,
}: CollectionViewerModalProps) {
  if (!isOpen || !collection) return null;

  return (
    <CollectionViewerDialog
      key={collection.id}
      collection={collection}
      isOwner={isOwner}
      onClose={onClose}
      onUpdateCollection={onUpdateCollection}
    />
  );
}
