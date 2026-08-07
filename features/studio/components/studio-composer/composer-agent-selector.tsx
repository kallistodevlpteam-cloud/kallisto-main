"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { StudioAgentType } from "@/types/domain/studio";
import { STUDIO_AGENT_REGISTRY } from "../../lib/agent-registry";

export interface ComposerAgentSelectorProps {
  value: StudioAgentType | "auto";
  onChange: (agentId: StudioAgentType | "auto") => void;
}

export type StudioPerformanceMode = "high" | "balanced" | "fast";

export function ComposerAgentSelector({
  value,
  onChange,
}: ComposerAgentSelectorProps) {
  const [performance, setPerformance] = useState<StudioPerformanceMode>("high");

  const selectedAgent = STUDIO_AGENT_REGISTRY[value] || STUDIO_AGENT_REGISTRY.auto;
  const currentKey = `${value}:${performance}`;

  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <select
        value={currentKey}
        onChange={(e) => {
          const parts = e.target.value.split(":");
          const agentId = parts[0] as StudioAgentType | "auto";
          const perfMode = parts[1] as StudioPerformanceMode;
          onChange(agentId);
          if (perfMode) {
            setPerformance(perfMode);
          }
        }}
        aria-label="Select AI performance mode"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          height: "28px",
          padding: "0 22px 0 12px",
          border: "none",
          borderRadius: "9999px",
          background: "#f3f4f6",
          color: "#1e293b",
          fontSize: "12.5px",
          fontWeight: 600,
          cursor: "pointer",
          appearance: "none",
          outline: "none",
        }}
      >
        <optgroup label="Auto Performance Modes">
          <option value="auto:high">Auto Agent (High Performance)</option>
          <option value="auto:balanced">Auto Agent (Balanced)</option>
          <option value="auto:fast">Auto Agent (Fast Response)</option>
        </optgroup>
        <optgroup label="Specialist AI Agents">
          {Object.values(STUDIO_AGENT_REGISTRY)
            .filter((a) => a.id !== "auto")
            .map((agent) => (
              <option key={agent.id} value={`${agent.id}:high`}>
                {agent.name} (High Performance)
              </option>
            ))}
        </optgroup>
      </select>

      <ChevronDown
        size={13}
        style={{
          position: "absolute",
          right: "8px",
          pointerEvents: "none",
          color: "#64748b",
        }}
      />
    </div>
  );
}
