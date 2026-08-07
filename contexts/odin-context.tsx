"use client";

import React, { createContext, useContext, useState } from "react";
import { OdinContextPayload, OpenOdinOptions } from "@/types/domain/home";

interface OdinContextType {
  assistantOpen: boolean;
  odinPinned: boolean;
  activeContext: OdinContextPayload | null;
  activePrompt: string;
  openOdin: (options: OpenOdinOptions) => void;
  closeOdin: () => void;
  toggleAssistant: () => void;
  setOdinPinned: (pinned: boolean) => void;
  toggleOdinPinned: () => void;
}

const OdinContext = createContext<OdinContextType | undefined>(undefined);

export function OdinProvider({ children }: { children: React.ReactNode }) {
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [odinPinned, setOdinPinned] = useState(false);
  const [activeContext, setActiveContext] = useState<OdinContextPayload | null>(null);
  const [activePrompt, setActivePrompt] = useState("");

  const openOdin = (options: OpenOdinOptions) => {
    setActiveContext(options.context);
    setActivePrompt(options.prompt);
    setAssistantOpen(true);
  };

  const closeOdin = () => {
    setAssistantOpen(false);
  };

  const toggleAssistant = () => {
    setAssistantOpen((prev) => !prev);
  };

  const toggleOdinPinned = () => {
    setOdinPinned((prev) => !prev);
  };

  return (
    <OdinContext.Provider
      value={{
        assistantOpen,
        odinPinned,
        activeContext,
        activePrompt,
        openOdin,
        closeOdin,
        toggleAssistant,
        setOdinPinned,
        toggleOdinPinned,
      }}
    >
      {children}
    </OdinContext.Provider>
  );
}

export function useOdinContext(): OdinContextType {
  const context = useContext(OdinContext);
  if (!context) {
    throw new Error("useOdinContext must be used within an OdinProvider");
  }
  return context;
}
