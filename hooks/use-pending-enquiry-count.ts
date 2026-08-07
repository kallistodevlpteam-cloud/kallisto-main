"use client";

import { useEffect, useState } from "react";
import { homeWorkspaceService } from "@/services/repositories/home-workspace-service";

export function usePendingEnquiryCount(): number | null {
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    homeWorkspaceService
      .getPendingEnquiryCount()
      .then((count) => {
        if (active) setPendingCount(count);
      })
      .catch(() => {
        if (active) setPendingCount(null);
      });

    return () => {
      active = false;
    };
  }, []);

  return pendingCount;
}
