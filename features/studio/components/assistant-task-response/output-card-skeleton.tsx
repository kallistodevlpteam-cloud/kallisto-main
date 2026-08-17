"use client";

import React from "react";

export function OutputCardSkeleton() {
  return (
    <div
      aria-label="Generating proposal skeleton"
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: "100%",
        background: "#ffffff",
        borderRadius: "12px",
        padding: "14px 16px",
        marginTop: "4px",
        marginBottom: "8px",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.03)",
        boxSizing: "border-box",
        gap: "12px",
      }}
    >
      {/* ── Header Row Skeleton ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: "10px",
          borderBottom: "1px solid #f7f7f5",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "7px",
              background: "#ebebe8",
            }}
          />
          <div
            style={{
              width: "160px",
              height: "16px",
              borderRadius: "4px",
              background: "#ebebe8",
            }}
          />
          <div
            style={{
              width: "36px",
              height: "16px",
              borderRadius: "9999px",
              background: "#ebebe8",
            }}
          />
        </div>
        <div
          style={{
            width: "100px",
            height: "20px",
            borderRadius: "9999px",
            background: "#ebebe8",
          }}
        />
      </div>

      {/* ── Metadata Row Skeleton ── */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ width: "90px", height: "12px", borderRadius: "4px", background: "#f7f7f5" }} />
        <div style={{ width: "80px", height: "12px", borderRadius: "4px", background: "#f7f7f5" }} />
        <div style={{ width: "70px", height: "12px", borderRadius: "4px", background: "#f7f7f5" }} />
      </div>

      {/* ── Highlights Section Skeleton ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "2px" }}>
        <div style={{ width: "110px", height: "10px", borderRadius: "3px", background: "#ebebe8" }} />
        <div style={{ width: "85%", height: "12px", borderRadius: "4px", background: "#f7f7f5" }} />
        <div style={{ width: "75%", height: "12px", borderRadius: "4px", background: "#f7f7f5" }} />
        <div style={{ width: "90%", height: "12px", borderRadius: "4px", background: "#f7f7f5" }} />
      </div>

      {/* ── Button Skeleton ── */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
        <div
          style={{
            width: "84px",
            height: "28px",
            borderRadius: "7px",
            background: "#ebebe8",
          }}
        />
      </div>
    </div>
  );
}
