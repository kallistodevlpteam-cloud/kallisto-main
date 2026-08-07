"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, EyeOff, Tag, Trash2 } from "lucide-react";
import type { TaggedPortfolioItem } from "@/features/portfolio/types/portfolio.types";
import { PortfolioEmptyState } from "./portfolio-empty-state";
import styles from "./portfolio.module.css";

interface PortfolioTaggedGridProps {
  initialItems: TaggedPortfolioItem[];
  isOwner: boolean;
}

export function PortfolioTaggedGrid({
  initialItems,
  isOwner,
}: PortfolioTaggedGridProps) {
  const [items, setItems] = useState(initialItems);

  if (items.length === 0) {
    return (
      <PortfolioEmptyState
        title="No tagged projects"
        description={
          isOwner
            ? "Collaborations that credit your work will appear here for review."
            : "There are no visible tagged collaborations yet."
        }
      />
    );
  }

  const updateItem = (
    id: string,
    status: TaggedPortfolioItem["status"],
  ) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item)),
    );
  };

  return (
    <div className={styles.taggedGrid}>
      {items.map((item, index) => (
        <article className={styles.taggedItem} key={item.id}>
          <div className={styles.taggedMedia}>
            <Image
              src={item.coverImageUrl}
              alt={`${item.projectName} cover`}
              fill
              priority={index < 2}
              loading={index < 2 ? "eager" : "lazy"}
              className={styles.taggedImage}
              sizes="(max-width: 640px) 50vw, 32vw"
            />
            {isOwner ? (
              <span className={styles.taggedStatus}>{item.status}</span>
            ) : null}
          </div>
          <div className={styles.taggedContent}>
            <span>
              <Tag size={13} aria-hidden="true" />
              {item.collaborator}
            </span>
            <h2>{item.projectName}</h2>
            <p>{item.role}</p>
            <small>Original project by {item.originalOwner}</small>
          </div>
          {isOwner ? (
            <div className={styles.taggedActions}>
              {item.status !== "Approved" ? (
                <button
                  type="button"
                  onClick={() => updateItem(item.id, "Approved")}
                >
                  <Check size={13} aria-hidden="true" />
                  Approve
                </button>
              ) : null}
              {item.status !== "Hidden" ? (
                <button
                  type="button"
                  onClick={() => updateItem(item.id, "Hidden")}
                >
                  <EyeOff size={13} aria-hidden="true" />
                  Hide
                </button>
              ) : null}
              <button
                type="button"
                onClick={() =>
                  setItems((current) =>
                    current.filter((candidate) => candidate.id !== item.id),
                  )
                }
              >
                <Trash2 size={13} aria-hidden="true" />
                Remove
              </button>
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}
