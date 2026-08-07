"use client";

import { useOdinContext } from "@/contexts/odin-context";

export function useOdin() {
  return useOdinContext();
}
