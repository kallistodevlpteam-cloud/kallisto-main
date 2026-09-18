"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import styles from "./basics-workspace.module.css";

type ReviewItemActionsProps = {
  reviewerName: string;
};

export function ReviewItemActions({ reviewerName }: ReviewItemActionsProps) {
  const [liked, setLiked] = useState(true);

  return (
    <div className={styles.reviewActionsBar}>
      <button
        type="button"
        className={styles.reviewActionBtn}
      >
        Public Comment
      </button>
      <button
        type="button"
        className={styles.reviewActionBtn}
      >
        Direct Message
      </button>
      <button
        type="button"
        className={styles.reviewHeartBtn}
        onClick={() => setLiked(!liked)}
        aria-label={liked ? `Unlike review by ${reviewerName}` : `Like review by ${reviewerName}`}
      >
        <Heart
          size={14}
          className={liked ? styles.reviewHeartIcon : undefined}
          fill={liked ? "#3b82f6" : "none"}
          color={liked ? "#3b82f6" : "#94a3b8"}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
