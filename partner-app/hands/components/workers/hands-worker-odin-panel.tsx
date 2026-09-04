"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  RotateCcw,
  UserCheck,
  SendHorizontal,
  Mic,
  ArrowRight,
  Plus,
  CheckCircle2,
  UserPlus,
  Phone,
  MapPin,
  Briefcase,
} from "lucide-react";
import {
  StudioDuotoneIcon,
  TeamDuotoneIcon,
  ProjectsDuotoneIcon,
  AnalyticsDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import {
  WorkerProfile,
  WorkerTrade,
  LabourRequestMatch,
  WorkerAvailability,
} from "../../types/worker-domain";
import { ACTIVE_LABOUR_REQUESTS } from "../../mock/workers-mock-data";
import styles from "./hands-workers.module.css";

export interface HandsWorkerOdinPanelProps {
  selectedWorker: WorkerProfile | null;
  onDeselectWorker: () => void;
  onFilterAvailability: (avail: WorkerAvailability | "All") => void;
  onFilterTrade: (trade: string) => void;
  onSearchQuery: (query: string) => void;
  onAssignWorker: (worker: WorkerProfile, request?: LabourRequestMatch) => void;
  onClose: () => void;
  availableCount: number;
  isRegisteringWorker?: boolean;
  onCancelRegistration?: () => void;
  onAddWorker?: (worker: WorkerProfile) => void;
}

type RegistrationQuestion =
  | "name"
  | "phone"
  | "location"
  | "trade"
  | "experience"
  | "wage"
  | "review";

interface RegistrationDraft {
  name: string;
  phone: string;
  location: string;
  trade: WorkerTrade;
  experienceYears: number;
  level: string;
  skills: string[];
  dailyRate: number;
  idDocumentType: string;
  availability: WorkerAvailability;
}

interface ChatMessage {
  id: string;
  sender: "odin" | "user";
  text: string;
  timestamp: string;
  quickOptions?: { label: string; value: string }[];
  reviewCard?: RegistrationDraft;
  registeredWorker?: WorkerProfile;
}

function renderInlineMarkdown(str: string) {
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  const parts = str.split(regex);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return (
        <strong key={i} style={{ color: "#0f172a", fontWeight: 700 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
      return (
        <em key={i} style={{ color: "#475569" }}>
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code
          key={i}
          style={{
            fontFamily: "monospace",
            backgroundColor: "#f1f5f9",
            padding: "1px 5px",
            borderRadius: "4px",
            fontSize: "11.5px",
            color: "#0f172a",
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function FormattedMessageText({ text }: { text: string }) {
  const paragraphs = text.split("\n\n");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {paragraphs.map((p, pIdx) => {
        const lines = p.split("\n");
        return (
          <p key={pIdx} className={styles.odinMessageText}>
            {lines.map((line, lIdx) => (
              <React.Fragment key={lIdx}>
                {lIdx > 0 && <br />}
                {renderInlineMarkdown(line)}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

export function HandsWorkerOdinPanel({
  selectedWorker,
  onDeselectWorker,
  onFilterAvailability,
  onFilterTrade,
  onSearchQuery,
  onAssignWorker,
  onClose,
  availableCount,
  isRegisteringWorker = false,
  onCancelRegistration,
  onAddWorker,
}: HandsWorkerOdinPanelProps) {
  const [inputQuery, setInputQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [regQuestion, setRegQuestion] = useState<RegistrationQuestion | null>(null);
  const [draftWorker, setDraftWorker] = useState<RegistrationDraft>({
    name: "",
    phone: "",
    location: "Kochi",
    trade: "Mason",
    experienceYears: 5,
    level: "Senior",
    skills: ["Brickwork", "Plastering"],
    dailyRate: 950,
    idDocumentType: "Aadhaar Card",
    availability: "Available",
  });
  const streamEndRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  const matchingRequests = selectedWorker
    ? ACTIVE_LABOUR_REQUESTS.filter((r) => r.trade === selectedWorker.trade)
    : [];

  useEffect(() => {
    if (streamEndRef.current && typeof streamEndRef.current.scrollIntoView === "function") {
      streamEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, selectedWorker, regQuestion]);

  const startRegistrationFlow = () => {
    setRegQuestion("name");
    setDraftWorker({
      name: "",
      phone: "",
      location: "Kochi",
      trade: "Mason",
      experienceYears: 5,
      level: "Senior",
      skills: ["Brickwork", "Plastering"],
      dailyRate: 950,
      idDocumentType: "Aadhaar Card",
      availability: "Available",
    });

    const q1: ChatMessage = {
      id: `odn-q-name-${Date.now()}`,
      sender: "odin",
      text: "Let's register a new worker to your fleet.\n\nWhat is the worker's **Full Name**?",
      timestamp: "Just now",
    };
    setMessages([q1]);
  };

  useEffect(() => {
    if (isRegisteringWorker && !initializedRef.current) {
      initializedRef.current = true;
      startRegistrationFlow();
    } else if (!isRegisteringWorker) {
      initializedRef.current = false;
    }
  }, [isRegisteringWorker]);

  const handleResetConversation = () => {
    setMessages([]);
    setInputQuery("");
    setRegQuestion(null);
    initializedRef.current = false;
    if (onCancelRegistration) {
      onCancelRegistration();
    }
    onDeselectWorker();
    onFilterAvailability("All");
    onFilterTrade("All");
    onSearchQuery("");
  };

  const handleConfirmRegister = (finalDraft: RegistrationDraft) => {
    const newWorker: WorkerProfile = {
      id: `KH-W-${Math.floor(1000 + Math.random() * 9000)}`,
      name: finalDraft.name.trim() || "Registered Worker",
      trade: finalDraft.trade || "Mason",
      experienceYears: finalDraft.experienceYears || 5,
      level: finalDraft.level || "Senior",
      availability: finalDraft.availability || "Available",
      currentAssignment: null,
      verificationStatus: "Verified",
      phone: finalDraft.phone.trim() || "+91 98470 00000",
      location: finalDraft.location.trim() || "Kochi",
      skills: finalDraft.skills.length > 0 ? finalDraft.skills : [finalDraft.trade],
      dailyRate: finalDraft.dailyRate || 950,
      verificationDetails: {
        identityVerified: true,
        phoneVerified: true,
        tradeCertified: true,
        kycDocumentType: finalDraft.idDocumentType || "Aadhaar Card",
        verifiedAt: new Date().toISOString().split("T")[0],
      },
      recentWork: [
        {
          id: `hist-new-${Date.now()}`,
          projectName: "Newly Registered Fleet",
          role: `${finalDraft.trade}`,
          dateRange: "Aug 2026",
          location: finalDraft.location || "Kochi",
        },
      ],
    };

    if (onAddWorker) {
      onAddWorker(newWorker);
    }

    setRegQuestion(null);

    const completionMsg: ChatMessage = {
      id: `odn-complete-${Date.now()}`,
      sender: "odin",
      text: `🎉 **Worker Registered Successfully!**\n**${newWorker.name}** (${newWorker.trade}, ${newWorker.level}, ${newWorker.experienceYears} Yrs Exp) has been registered under ID \`${newWorker.id}\` and added to your active workforce.`,
      timestamp: "Just now",
      registeredWorker: newWorker,
    };
    setMessages((prev) => [...prev, completionMsg]);
  };

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;
    const promptText = textToSend.trim();
    setInputQuery("");

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: promptText,
      timestamp: "Just now",
    };
    setMessages((prev) => [...prev, userMsg]);

    const lower = promptText.toLowerCase();

    // Trigger registration if asked
    if (regQuestion === null && (lower.includes("add worker") || lower.includes("register") || lower.includes("new worker"))) {
      setTimeout(() => {
        startRegistrationFlow();
      }, 200);
      return;
    }

    // Question 1: Name -> Ask Phone
    if (regQuestion === "name") {
      const name = promptText;
      setDraftWorker((prev) => ({ ...prev, name }));
      setRegQuestion("phone");

      setTimeout(() => {
        const q2: ChatMessage = {
          id: `odn-q-phone-${Date.now()}`,
          sender: "odin",
          text: `Thanks! What is **${name}'s mobile number**?`,
          timestamp: "Just now",
        };
        setMessages((prev) => [...prev, q2]);
      }, 250);
      return;
    }

    // Question 2: Phone -> Ask Location
    if (regQuestion === "phone") {
      const phone = promptText;
      setDraftWorker((prev) => ({ ...prev, phone }));
      setRegQuestion("location");

      setTimeout(() => {
        const q3: ChatMessage = {
          id: `odn-q-location-${Date.now()}`,
          sender: "odin",
          text: `Where is **${draftWorker.name || "the worker"}** based? (**Primary Location**)`,
          timestamp: "Just now",
          quickOptions: [
            { label: "Kochi", value: "Kochi" },
            { label: "Trivandrum", value: "Trivandrum" },
            { label: "Kozhikode", value: "Kozhikode" },
            { label: "Thrissur", value: "Thrissur" },
            { label: "Kollam", value: "Kollam" },
          ],
        };
        setMessages((prev) => [...prev, q3]);
      }, 250);
      return;
    }

    // Question 3: Location -> Ask Trade
    if (regQuestion === "location") {
      const location = promptText;
      setDraftWorker((prev) => ({ ...prev, location }));
      setRegQuestion("trade");

      setTimeout(() => {
        const q4: ChatMessage = {
          id: `odn-q-trade-${Date.now()}`,
          sender: "odin",
          text: `What is **${draftWorker.name || "the worker"}'s primary trade**?`,
          timestamp: "Just now",
          quickOptions: [
            { label: "Mason", value: "Mason" },
            { label: "Electrician", value: "Electrician" },
            { label: "Carpenter", value: "Carpenter" },
            { label: "Plumber", value: "Plumber" },
            { label: "Painter", value: "Painter" },
            { label: "Steel Fixer", value: "Steel Fixer" },
            { label: "Tile Worker", value: "Tile Worker" },
            { label: "Helper", value: "Helper" },
          ],
        };
        setMessages((prev) => [...prev, q4]);
      }, 250);
      return;
    }

    // Question 4: Trade -> Ask Experience
    if (regQuestion === "trade") {
      let trade: WorkerTrade = "Mason";
      if (lower.includes("electrician")) trade = "Electrician";
      else if (lower.includes("carpenter")) trade = "Carpenter";
      else if (lower.includes("plumber")) trade = "Plumber";
      else if (lower.includes("painter")) trade = "Painter";
      else if (lower.includes("steel")) trade = "Steel Fixer";
      else if (lower.includes("tile")) trade = "Tile Worker";
      else if (lower.includes("helper")) trade = "Helper";

      let skills = ["Brickwork", "Plastering"];
      if (trade === "Electrician") skills = ["DB Dressing", "Conduit Wiring", "Earthing"];
      else if (trade === "Carpenter") skills = ["Shuttering", "Formwork", "Doors & Windows"];
      else if (trade === "Plumber") skills = ["CPVC Piping", "Sanitary", "Pressure Testing"];
      else if (trade === "Painter") skills = ["Putty Application", "Interior Emulsion", "Texture Finish"];
      else if (trade === "Helper") skills = ["Material Handling", "Site Cleanup", "Mixing"];
      else if (trade === "Steel Fixer") skills = ["Rebar Cutting", "Bending", "Column Ties"];
      else if (trade === "Tile Worker") skills = ["Large Format Tiles", "Granite Laying", "Grouting"];

      setDraftWorker((prev) => ({ ...prev, trade, skills }));
      setRegQuestion("experience");

      setTimeout(() => {
        const q5: ChatMessage = {
          id: `odn-q-exp-${Date.now()}`,
          sender: "odin",
          text: `How many **years of experience** does ${draftWorker.name || "the worker"} have in **${trade}** work?`,
          timestamp: "Just now",
          quickOptions: [
            { label: "2 Years (Helper)", value: "2 Years" },
            { label: "5 Years (Skilled)", value: "5 Years" },
            { label: "8 Years (Senior)", value: "8 Years" },
            { label: "12+ Years (Master)", value: "12 Years" },
          ],
        };
        setMessages((prev) => [...prev, q5]);
      }, 250);
      return;
    }

    // Question 5: Experience -> Ask Daily Wage
    if (regQuestion === "experience") {
      let exp = 5;
      let level = "Senior";
      const matchNum = promptText.match(/\d+/);
      if (matchNum) {
        exp = Number(matchNum[0]);
      }
      if (exp >= 10) level = "Master";
      else if (exp >= 7) level = "Senior";
      else if (exp >= 4) level = "Skilled";
      else level = "Helper";

      setDraftWorker((prev) => ({ ...prev, experienceYears: exp, level }));
      setRegQuestion("wage");

      setTimeout(() => {
        const q6: ChatMessage = {
          id: `odn-q-wage-${Date.now()}`,
          sender: "odin",
          text: `What is the expected **Daily Wage** (₹/day) for ${draftWorker.name || "the worker"}?`,
          timestamp: "Just now",
          quickOptions: [
            { label: "₹700 / day", value: "700" },
            { label: "₹850 / day", value: "850" },
            { label: "₹950 / day", value: "950" },
            { label: "₹1050 / day", value: "1050" },
            { label: "₹1200 / day", value: "1200" },
          ],
        };
        setMessages((prev) => [...prev, q6]);
      }, 250);
      return;
    }

    // Question 6: Wage -> Show Review & Confirmation Card
    if (regQuestion === "wage") {
      let dailyRate = 950;
      const matchWage = promptText.match(/\d+/);
      if (matchWage) {
        dailyRate = Number(matchWage[0]);
      }

      const finalDraft: RegistrationDraft = {
        ...draftWorker,
        dailyRate,
      };
      setDraftWorker(finalDraft);
      setRegQuestion("review");

      setTimeout(() => {
        const q7: ChatMessage = {
          id: `odn-q-review-${Date.now()}`,
          sender: "odin",
          text: `All set! Here is the registration review for **${finalDraft.name}**:\n\nPlease confirm to add to your registered fleet:`,
          timestamp: "Just now",
          reviewCard: finalDraft,
        };
        setMessages((prev) => [...prev, q7]);
      }, 250);
      return;
    }

    // If in review and user typed "confirm" or "yes"
    if (regQuestion === "review" && (lower.includes("confirm") || lower.includes("yes") || lower.includes("register"))) {
      handleConfirmRegister(draftWorker);
      return;
    }

    // General queries
    setTimeout(() => {
      let replyText = "";
      if (lower.includes("mason")) {
        onFilterTrade("Mason");
        onFilterAvailability("Available");
        replyText = "Filtered your directory to available Masons. You currently have 5 verified masons ready for dispatch to Kazhakkoottam IT Complex.";
      } else if (lower.includes("plastering")) {
        onSearchQuery("Plastering");
        replyText = "Displaying verified tradesmen with specialized plastering and surface-finish expertise.";
      } else if (lower.includes("available") || lower.includes("tomorrow") || lower.includes("unassigned")) {
        onFilterAvailability("Available");
        replyText = `Showing all ${availableCount} workers available for immediate assignment.`;
      } else if (lower.includes("match") || lower.includes("request")) {
        replyText = "Evaluated 3 open contractor requests. 8 Masons match Kazhakkoottam IT Complex, and 3 Electricians match Azure Villa.";
      } else if (lower.includes("gap") || lower.includes("shortage")) {
        replyText = "Workforce Gap Analysis: Helper and Senior Wireman demand exceeds current bench by 4 positions for next week's shifts.";
      } else {
        onSearchQuery(promptText);
        replyText = `Evaluated "${promptText}". Filtered directory records accordingly.`;
      }

      const odinMsg: ChatMessage = {
        id: `odn-${Date.now()}`,
        sender: "odin",
        text: replyText,
        timestamp: "Just now",
      };
      setMessages((prev) => [...prev, odinMsg]);
    }, 280);
  };

  return (
    <div className={styles.aiPanelContainer}>
      <aside className={styles.minimalCard} aria-label="Odin Workforce Intelligence">
        {/* Header */}
        <div className={styles.minimalHeader}>
          <div className={styles.minimalBotAvatar}>
            <StudioDuotoneIcon size={19} />
            <span className={styles.minimalOnlineDot} />
          </div>

          <div className={styles.minimalHeaderTitles}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span className={styles.minimalHeaderTitle}>Odin</span>
              <span className={styles.minimalBadge}>Workforce AI</span>
            </div>
            <span className={styles.minimalHeaderSub}>
              {regQuestion !== null
                ? "Conversational Worker Registration"
                : selectedWorker
                ? `Analyzing ${selectedWorker.name}`
                : "Workforce & Labour Operations"}
            </span>
          </div>

          <button
            type="button"
            className={styles.minimalResetBtn}
            onClick={handleResetConversation}
            title="Reset conversation and filters"
            aria-label="Reset conversation"
          >
            <RotateCcw size={14} />
          </button>

          <button
            type="button"
            className={styles.minimalResetBtn}
            onClick={onClose}
            title="Close Odin Panel"
            aria-label="Close Odin Panel"
          >
            <X size={15} />
          </button>
        </div>

        {/* Conversational Stream */}
        <div className={styles.minimalChatStream}>
          {regQuestion === null && messages.length === 0 && (
            <div className={styles.odinChatRow}>
              <div className={styles.odinAvatarIcon}>
                <StudioDuotoneIcon size={17} />
              </div>
              <div className={styles.odinChatContent}>
                <FormattedMessageText
                  text={
                    selectedWorker
                      ? `Inspecting profile for **${selectedWorker.name}** (${selectedWorker.trade}, ${selectedWorker.experienceYears} Yrs).`
                      : `Hello Vikram. **${availableCount} workers** are available today across 6 trade categories. **3 active contractor requests** need workforce allocation.`
                  }
                />

                {selectedWorker && (
                  <div className={styles.selectedWorkerStreamCard}>
                    <div className={styles.selectedWorkerHeader}>
                      <div className={styles.selectedWorkerHeaderLeft}>
                        <div className={styles.selectedWorkerAvatar}>
                          {selectedWorker.name
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                        <div>
                          <div className={styles.selectedWorkerMetaTitle}>
                            {selectedWorker.name}
                          </div>
                          <div className={styles.selectedWorkerMetaSub}>
                            {selectedWorker.trade} · {selectedWorker.availability}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={styles.clearSelectionBtn}
                        onClick={onDeselectWorker}
                      >
                        Clear
                      </button>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      {selectedWorker.skills.map((s) => (
                        <span key={s} className={styles.skillPill} style={{ fontSize: "11px", padding: "2px 6px" }}>
                          {s}
                        </span>
                      ))}
                    </div>

                    {matchingRequests.length > 0 ? (
                      <div className={styles.matchingRequestCard}>
                        <div className={styles.matchingRequestHeader}>
                          <span>Matching Active Request</span>
                          <span style={{ fontSize: "10px", color: "#ea580c", textTransform: "uppercase" }}>
                            {matchingRequests[0].urgency}
                          </span>
                        </div>
                        <div className={styles.matchingRequestDetail}>
                          <strong>{matchingRequests[0].projectName}</strong> needs {matchingRequests[0].requiredWorkers} {matchingRequests[0].trade}s starting {matchingRequests[0].startDate} ({matchingRequests[0].location}).
                        </div>
                        <button
                          type="button"
                          className={styles.matchingRequestActionBtn}
                          onClick={() => onAssignWorker(selectedWorker, matchingRequests[0])}
                        >
                          <UserCheck size={13} />
                          <span>Assign to {matchingRequests[0].projectName}</span>
                        </button>
                      </div>
                    ) : (
                      <div style={{ fontSize: "12px", color: "#64748b" }}>
                        {selectedWorker.availability === "Assigned"
                          ? `Currently deployed at ${selectedWorker.currentAssignment?.projectName}.`
                          : "Ready for on-demand dispatch or new project requests."}
                      </div>
                    )}
                  </div>
                )}

                {!selectedWorker && (
                  <div className={styles.quickActionGrid}>
                    <button
                      type="button"
                      className={styles.quickActionCard}
                      onClick={() => handleSendMessage("Find Available Workers")}
                    >
                      <div className={styles.quickActionIconWrap}>
                        <TeamDuotoneIcon size={18} />
                      </div>
                      <div className={styles.quickActionTexts}>
                        <span className={styles.quickActionTitle}>Find Available Workers</span>
                        <span className={styles.quickActionSub}>
                          Filter active bench of {availableCount} unassigned tradesmen
                        </span>
                      </div>
                      <ArrowRight size={14} style={{ color: "#94a3b8" }} />
                    </button>

                    <button
                      type="button"
                      className={styles.quickActionCard}
                      onClick={() => handleSendMessage("Match Workers to Requests")}
                    >
                      <div className={styles.quickActionIconWrap} style={{ background: "#f1f5f9", color: "#0f172a" }}>
                        <ProjectsDuotoneIcon size={18} />
                      </div>
                      <div className={styles.quickActionTexts}>
                        <span className={styles.quickActionTitle}>Match Workers to Requests</span>
                        <span className={styles.quickActionSub}>
                          Auto-allocate skills to 3 active site requirements
                        </span>
                      </div>
                      <ArrowRight size={14} style={{ color: "#94a3b8" }} />
                    </button>

                    <button
                      type="button"
                      className={styles.quickActionCard}
                      onClick={() => handleSendMessage("Review Workforce Gaps")}
                    >
                      <div className={styles.quickActionIconWrap} style={{ background: "#f1f5f9", color: "#0f172a" }}>
                        <AnalyticsDuotoneIcon size={18} />
                      </div>
                      <div className={styles.quickActionTexts}>
                        <span className={styles.quickActionTitle}>Review Workforce Gaps</span>
                        <span className={styles.quickActionSub}>
                          Audit verification status and upcoming shortages
                        </span>
                      </div>
                      <ArrowRight size={14} style={{ color: "#94a3b8" }} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dynamic Conversation Timeline */}
          {messages.map((msg) => {
            if (msg.sender === "user") {
              return (
                <div key={msg.id} className={styles.userChatRow}>
                  <div className={styles.userMessageBubble}>{msg.text}</div>
                </div>
              );
            }
            return (
              <div key={msg.id} className={styles.odinChatRow}>
                <div className={styles.odinAvatarIcon}>
                  <StudioDuotoneIcon size={17} />
                </div>
                <div className={styles.odinChatContent}>
                  <FormattedMessageText text={msg.text} />

                  {/* Contextual Quick Reply Options for the Current Question */}
                  {msg.quickOptions && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                      {msg.quickOptions.map((opt) => (
                        <button
                          key={opt.label}
                          type="button"
                          className={styles.suggestedChip}
                          style={{
                            padding: "6px 12px",
                            fontSize: "12px",
                            fontWeight: 600,
                            backgroundColor: "#f1f5f9",
                            color: "#334155",
                            border: "1px solid #e2e8f0",
                          }}
                          onClick={() => handleSendMessage(opt.value)}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Review Confirmation Card in Signature Theme */}
                  {msg.reviewCard && (
                    <div className={styles.odinReviewCardDark}>
                      <div className={styles.odinReviewCardHeader}>
                        <div>
                          <div className={styles.odinReviewCardName}>
                            {msg.reviewCard.name || "Worker Name"}
                          </div>
                          <div className={styles.odinReviewCardSub}>
                            {msg.reviewCard.trade} ({msg.reviewCard.level}) · {msg.reviewCard.experienceYears} Years Experience
                          </div>
                        </div>
                        <span className={styles.odinReviewCardBadge}>
                          Available Today
                        </span>
                      </div>

                      <div className={styles.odinReviewCardDetails}>
                        {msg.reviewCard.phone && (
                          <div className={styles.odinReviewCardDetailRow}>
                            <Phone size={13} />
                            <span>{msg.reviewCard.phone}</span>
                          </div>
                        )}
                        <div className={styles.odinReviewCardDetailRow}>
                          <MapPin size={13} />
                          <span>{msg.reviewCard.location}</span>
                        </div>
                        <div className={styles.odinReviewCardDetailRow}>
                          <Briefcase size={13} />
                          <span>₹{msg.reviewCard.dailyRate} / day · {msg.reviewCard.skills.join(", ")}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={styles.odinReviewConfirmBtn}
                        onClick={() => handleConfirmRegister(msg.reviewCard!)}
                      >
                        <UserPlus size={14} />
                        <span>Confirm & Register Worker</span>
                      </button>
                    </div>
                  )}

                  {/* Registered Confirmation Card */}
                  {msg.registeredWorker && (
                    <div className={styles.odinRegSuccessCard}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "#065f46" }}>
                        <CheckCircle2 size={15} color="#059669" />
                        <span>Registered: {msg.registeredWorker.name} ({msg.registeredWorker.id})</span>
                      </div>
                      <div style={{ fontSize: "11.5px", color: "#047857" }}>
                        Trade: {msg.registeredWorker.trade} · Level: {msg.registeredWorker.level} · Location: {msg.registeredWorker.location} · ₹{msg.registeredWorker.dailyRate}/day
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div ref={streamEndRef} />
        </div>

        {/* Suggested Actions */}
        <div className={styles.suggestedChipsBar}>
          {[
            "+ Register worker",
            "Find available masons",
            "Available tomorrow",
            "Unassigned workers",
          ].map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className={styles.suggestedChip}
              onClick={() => handleSendMessage(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Composer Box */}
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputQuery); }} className={styles.minimalComposer}>
          <textarea
            className={styles.minimalInput}
            rows={2}
            placeholder={
              regQuestion === "name"
                ? "Type worker's full name..."
                : regQuestion === "phone"
                ? "Type mobile number..."
                : regQuestion === "location"
                ? "Type city or choose a location above..."
                : regQuestion === "trade"
                ? "Type or choose a trade above..."
                : regQuestion === "experience"
                ? "Type years of experience..."
                : regQuestion === "wage"
                ? "Type daily wage in ₹/day..."
                : selectedWorker
                ? `Ask Odin about ${selectedWorker.name}...`
                : "Ask Odin or type to register a worker..."
            }
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(inputQuery);
              }
            }}
            aria-label="Ask Odin about your workforce"
          />

          <div className={styles.composerBottomBar}>
            <div className={styles.composerLeftGroup}>
              <button
                type="button"
                className={styles.composerPlusBtn}
                title="Register worker via Odin chat"
                onClick={startRegistrationFlow}
                aria-label="Register worker"
              >
                <Plus size={14} strokeWidth={2} />
              </button>
            </div>

            <div className={styles.composerRightGroup}>
              <button
                type="button"
                className={styles.composerMicBtn}
                title="Voice dictation"
                onClick={() => handleSendMessage("Deepak N")}
                aria-label="Voice dictation"
              >
                <Mic size={15} />
              </button>

              <button
                type="submit"
                className={styles.minimalSendBtn}
                disabled={!inputQuery.trim()}
                style={
                  inputQuery.trim()
                    ? { backgroundColor: "#0f172a", borderColor: "#0f172a", color: "#ffffff" }
                    : undefined
                }
                title="Send query"
                aria-label="Send query"
              >
                <SendHorizontal size={14} style={{ marginLeft: "1px" }} />
              </button>
            </div>
          </div>
        </form>
      </aside>
    </div>
  );
}
