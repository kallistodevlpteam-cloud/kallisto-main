import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In • Kallisto Workspace",
  description: "Sign in to your Kallisto service provider workspace.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        width: "100%",
        minHeight: "100dvh",
        margin: 0,
        padding: 0,
        background: "var(--page, #eceef1)",
      }}
    >
      {children}
    </div>
  );
}
