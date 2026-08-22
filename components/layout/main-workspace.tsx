"use client";

import React from "react";
import { usePathname } from "next/navigation";

export interface MainWorkspaceProps {
  children?: React.ReactNode;
  className?: string;
}

export function MainWorkspace({ children, className }: MainWorkspaceProps) {
  let pathname = "";
  try {
    pathname = usePathname() || "";
  } catch {
    pathname = "";
  }
  const isEnquiries = typeof pathname === "string" && (pathname === "/enquiries" || pathname.startsWith("/enquiries"));
  const isBasicsOverview = typeof pathname === "string" && pathname === "/basics";
  const isHandsOverview = typeof pathname === "string" && pathname === "/hands";

  return (
    <main
      className={`workspace${isEnquiries ? " enquiries-route-workspace" : ""}${
        isBasicsOverview ? " basics-route-workspace" : ""
      }${isHandsOverview ? " hands-route-workspace" : ""}${
        className ? ` ${className}` : ""
      }`}
      id="home"
    >
      {children}
    </main>
  );
}

