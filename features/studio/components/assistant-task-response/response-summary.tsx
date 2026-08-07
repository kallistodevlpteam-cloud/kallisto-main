"use client";

import React from "react";

export interface ResponseSummaryProps {
  content: string;
}

export function ResponseSummary({ content }: ResponseSummaryProps) {
  return (
    <p
      style={{
        margin: "0 0 8px 0",
        fontSize: "13.5px",
        lineHeight: "1.55",
        color: "#334155",
        fontWeight: 450,
      }}
    >
      {content}
    </p>
  );
}
