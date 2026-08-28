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
  const isBasicsRoute = typeof pathname === "string" && (pathname === "/basics" || pathname.startsWith("/basics"));
  const isHandsRoute = typeof pathname === "string" && (pathname === "/hands" || pathname.startsWith("/hands"));

  return (
    <main
      className={`workspace${isEnquiries ? " enquiries-route-workspace" : ""}${
        isBasicsRoute ? " basics-route-workspace" : ""
      }${isHandsRoute ? " hands-route-workspace" : ""}${
        className ? ` ${className}` : ""
      }`}
      id="home"
    >
      {children}
    </main>
  );
}

