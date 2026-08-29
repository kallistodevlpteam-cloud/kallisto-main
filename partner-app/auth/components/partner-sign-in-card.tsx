"use client";

import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles, Building2 } from "lucide-react";
import { KallistoBrand } from "@/components/layout/kallisto-brand";
import { usePartnerAuth } from "../context/partner-auth-context";
import { PartnerType } from "../../shared/types/partner-domain";
import { PARTNER_CONFIGS, ALL_PARTNER_TYPES } from "../../shared/config/partner-config";

export function PartnerSignInCard() {
  const { signIn, signInDemo, isLoading } = usePartnerAuth();

  const [selectedPartnerType, setSelectedPartnerType] = useState<PartnerType>("HANDS");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeConfig = PARTNER_CONFIGS[selectedPartnerType] || PARTNER_CONFIGS["HANDS"];

  const validateForm = () => {
    let isValid = true;
    setEmailError(null);
    setPasswordError(null);
    setGeneralError(null);

    const trimmed = emailOrPhone.trim();
    if (!trimmed) {
      setEmailError("Work email or mobile number is required");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    }

    return isValid;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setGeneralError(null);

    try {
      const res = await signIn({
        emailOrPhone,
        password,
        partnerType: selectedPartnerType,
        rememberMe,
      });

      if (!res.success) {
        setGeneralError(res.error || "Authentication failed. Please verify your partner credentials.");
      }
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : "Unable to sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoEntry = async (type: PartnerType) => {
    setIsSubmitting(true);
    setGeneralError(null);
    try {
      await signInDemo(type);
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : "Unable to activate demo context.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "460px",
        backgroundColor: "#ffffff",
        borderRadius: "20px",
        boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.07), 0 0 1px 1px rgba(0, 0, 0, 0.05)",
        border: "1px solid rgba(226, 232, 240, 0.8)",
        padding: "36px 32px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      {/* Header with Kallisto Brand and Partner Portal Identifier */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "10px" }}>
        <div style={{ transform: "scale(1.05)", marginBottom: "4px" }}>
          <KallistoBrand />
        </div>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#f8fafc", padding: "4px 12px", borderRadius: "9999px", border: "1px solid #e2e8f0", marginBottom: "6px" }}>
            <Building2 size={13} color="#475569" />
            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", color: "#475569", textTransform: "uppercase" }}>
              Partner Workspace
            </span>
          </div>
          <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>
            Sign In to Partner Portal
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
            Operational access for Kallisto trade, material & service partners
          </p>
        </div>
      </div>

      {/* Partner Business Selector Tabs */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label style={{ fontSize: "12px", fontWeight: 600, color: "#475569" }}>Select Partner Ecosystem</label>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            backgroundColor: "#f1f5f9",
            borderRadius: "10px",
            padding: "3px",
            gap: "3px",
          }}
        >
          {ALL_PARTNER_TYPES.map((type) => {
            const isSelected = selectedPartnerType === type;
            const cfg = PARTNER_CONFIGS[type];
            return (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedPartnerType(type)}
                style={{
                  padding: "8px 4px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: isSelected ? "#ffffff" : "transparent",
                  color: isSelected ? "#0f172a" : "#64748b",
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: "12px",
                  cursor: "pointer",
                  boxShadow: isSelected ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.15s ease",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "2px",
                }}
              >
                <span>{cfg.shortName}</span>
                <span
                  style={{
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    backgroundColor: isSelected ? cfg.accentColor : "transparent",
                  }}
                />
              </button>
            );
          })}
        </div>
        <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#64748b", textAlign: "center" }}>
          {activeConfig.tagline}
        </p>
      </div>

      {generalError && (
        <div
          style={{
            padding: "10px 14px",
            backgroundColor: "#fef2f2",
            border: "1px solid #fee2e2",
            borderRadius: "8px",
            color: "#991b1b",
            fontSize: "12px",
            lineHeight: 1.4,
          }}
        >
          {generalError}
        </div>
      )}

      {/* Main Login Form */}
      <form onSubmit={handleSignIn} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label htmlFor="partner-email" style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>
            Work Email or Phone
          </label>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <Mail size={16} color="#94a3b8" style={{ position: "absolute", left: "12px" }} />
            <input
              id="partner-email"
              type="text"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              placeholder={`lead@kallisto-${selectedPartnerType.toLowerCase()}.com`}
              style={{
                width: "100%",
                height: "40px",
                padding: "0 12px 0 36px",
                borderRadius: "8px",
                border: emailError ? "1px solid #ef4444" : "1px solid #cbd5e1",
                fontSize: "13px",
                color: "#0f172a",
                outline: "none",
                backgroundColor: "#ffffff",
              }}
            />
          </div>
          {emailError && <span style={{ fontSize: "11px", color: "#ef4444" }}>{emailError}</span>}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label htmlFor="partner-password" style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>
            Password
          </label>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <Lock size={16} color="#94a3b8" style={{ position: "absolute", left: "12px" }} />
            <input
              id="partner-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your partner password"
              style={{
                width: "100%",
                height: "40px",
                padding: "0 36px 0 36px",
                borderRadius: "8px",
                border: passwordError ? "1px solid #ef4444" : "1px solid #cbd5e1",
                fontSize: "13px",
                color: "#0f172a",
                outline: "none",
                backgroundColor: "#ffffff",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{
                position: "absolute",
                right: "10px",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                color: "#94a3b8",
                display: "flex",
                alignItems: "center",
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {passwordError && <span style={{ fontSize: "11px", color: "#ef4444" }}>{passwordError}</span>}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", color: "#64748b" }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ accentColor: "#0f172a" }}
            />
            Remember session
          </label>
          <span style={{ color: "#64748b", cursor: "pointer" }}>Need access? Contact admin</span>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          style={{
            height: "42px",
            width: "100%",
            borderRadius: "8px",
            backgroundColor: "#0f172a",
            color: "#ffffff",
            border: "none",
            fontSize: "13px",
            fontWeight: 600,
            cursor: isSubmitting || isLoading ? "not-allowed" : "pointer",
            opacity: isSubmitting || isLoading ? 0.7 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.15)",
            transition: "all 0.15s ease",
          }}
        >
          {isSubmitting || isLoading ? (
            <span>Authenticating...</span>
          ) : (
            <>
              <span>Sign In to {activeConfig.displayName}</span>
              <ArrowRight size={15} />
            </>
          )}
        </button>
      </form>

      {/* Development Quick Partner Context Switcher */}
      <div
        style={{
          borderTop: "1px dashed #e2e8f0",
          paddingTop: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Sparkles size={12} color="#0284c7" />
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
              Quick Partner Context
            </span>
          </div>
          <span style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 500 }}>Development Demo Mode</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
          {ALL_PARTNER_TYPES.map((type) => {
            const cfg = PARTNER_CONFIGS[type];
            return (
              <button
                key={`demo-${type}`}
                type="button"
                onClick={() => handleQuickDemoEntry(type)}
                disabled={isSubmitting}
                style={{
                  padding: "8px 6px",
                  borderRadius: "8px",
                  border: `1px solid ${cfg.borderColor}`,
                  backgroundColor: cfg.lightBgColor,
                  color: cfg.accentColor,
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "transform 0.1s ease",
                  textAlign: "center",
                }}
              >
                {cfg.displayName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Trust & Security Badge */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", color: "#94a3b8", fontSize: "11px" }}>
        <ShieldCheck size={13} />
        <span>Kallisto Partner Operations Security & Audit Encrypted</span>
      </div>
    </div>
  );
}
