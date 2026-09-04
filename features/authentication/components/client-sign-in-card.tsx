"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { KallistoBrand } from "@/components/layout/kallisto-brand";
import styles from "./sign-in-card.module.css";

export function ClientSignInCard() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const validateForm = () => {
    let isValid = true;
    setEmailError(null);
    setPasswordError(null);
    setGeneralError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError("Please enter a valid email address");
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

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setGeneralError(null);

    try {
      // Simulate client sign in or verify credentials
      const token = `tok_client_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      const clientId = "CL-0001";

      if (typeof window !== "undefined") {
        localStorage.setItem("kallisto_auth_token", token);
        localStorage.setItem("kallisto_client_id", clientId);
      }

      // Persist client role cookie for server-side workspace context
      document.cookie = `kallisto_auth_token=${encodeURIComponent(token)}; path=/; max-age=2592000; SameSite=Lax`;
      document.cookie = `kallisto_client_id=${encodeURIComponent(clientId)}; path=/; max-age=2592000; SameSite=Lax`;
      document.cookie = `kallisto_simulated_role=client; path=/; max-age=2592000; SameSite=Lax`;

      // Navigate to client app shell
      router.push("/client/overview");
    } catch (err) {
      setGeneralError(
        err instanceof Error ? err.message : "Unable to sign in. Please verify your credentials and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("Enter your email address above to receive reset instructions");
      return;
    }
    setEmailError(null);
    setForgotSent(true);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const token = `tok_client_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      const clientId = "CL-0001";
      if (typeof window !== "undefined") {
        localStorage.setItem("kallisto_auth_token", token);
        localStorage.setItem("kallisto_client_id", clientId);
      }
      document.cookie = `kallisto_auth_token=${encodeURIComponent(token)}; path=/; max-age=2592000; SameSite=Lax`;
      document.cookie = `kallisto_client_id=${encodeURIComponent(clientId)}; path=/; max-age=2592000; SameSite=Lax`;
      document.cookie = `kallisto_simulated_role=client; path=/; max-age=2592000; SameSite=Lax`;
      router.push("/client/overview");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authCanvas}>
      {/* =========================================================
          LEFT SHELL: FLOATING BRANDING SHELL
          ========================================================= */}
      <section className={styles.brandingShell} aria-label="Kallisto Client Portal Overview">
        <div className={styles.brandingHero}>
          <span className={styles.brandingKicker}>Client Portal</span>
          <h2 className={styles.brandingTitle}>
            <span>Kallisto Client Workspace</span>
            <br />
            <span className={styles.brandingTitleSecondary}>Real-time transparency into your architectural and interior projects.</span>
          </h2>
          <p className={styles.brandingDesc}>
            Review design proposals, monitor site feasibility, track milestone approvals, view authoritative BOQ revisions, and manage payments with full security.
          </p>
        </div>

        <div className={styles.brandingBottomSection}>
          <div className={styles.brandingBottomMeta}>
            <div className={styles.brandingFooterNote}>
              <ShieldCheck size={14} aria-hidden="true" />
              <span>Verified Client Protection & Milestone Escrow</span>
            </div>
            <span>v2026.1</span>
          </div>
        </div>
      </section>

      {/* =========================================================
          RIGHT SHELL: FLOATING LOGIN & WORKSPACE SHELL
          ========================================================= */}
      <section className={styles.loginShell} aria-label="Client Sign In">
        <div className={styles.loginContent}>
          <div>
            <header className={styles.header}>
              <div className={styles.logoRow}>
                <div className={styles.logoWrap}>
                  <KallistoBrand />
                </div>
              </div>
              <h1 className={styles.title}>Sign in as Client</h1>
              <p className={styles.subtitle}>
                Access your projects, proposals, documents, and payments
              </p>
            </header>

            {generalError && (
              <div className={styles.errorBanner} role="alert">
                <AlertCircle size={15} className={styles.errorIcon} />
                <span>{generalError}</span>
              </div>
            )}

            {forgotSent && (
              <div
                className={styles.errorBanner}
                style={{ background: "#f0fdf4", borderColor: "#bbf7d0", color: "#166534" }}
                role="status"
              >
                <span>Password reset instructions sent to <strong>{email}</strong></span>
              </div>
            )}

            <form className={styles.form} onSubmit={handleSignIn} noValidate>
              <div className={styles.fieldGroup}>
                <label htmlFor="signin-email" className={styles.label}>
                  Email Address
                </label>
                <div className={styles.inputWrapper}>
                  <Mail size={15} className={styles.inputIcon} aria-hidden="true" />
                  <input
                    id="signin-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError(null);
                    }}
                    className={styles.input}
                    aria-invalid={!!emailError}
                    aria-describedby={emailError ? "email-error" : undefined}
                    disabled={isLoading}
                  />
                </div>
                {emailError && (
                  <span id="email-error" className={styles.fieldError}>
                    {emailError}
                  </span>
                )}
              </div>

              <div className={styles.fieldGroup}>
                <div className={styles.fieldHeader}>
                  <label htmlFor="signin-password" className={styles.label}>
                    Password
                  </label>
                  <button
                    type="button"
                    className={styles.forgotLink}
                    onClick={handleForgotPassword}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className={styles.inputWrapper}>
                  <Lock size={15} className={styles.inputIcon} aria-hidden="true" />
                  <input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError(null);
                    }}
                    className={`${styles.input} ${styles.inputWithToggle}`}
                    aria-invalid={!!passwordError}
                    aria-describedby={passwordError ? "password-error" : undefined}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    tabIndex={0}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {passwordError && (
                  <span id="password-error" className={styles.fieldError}>
                    {passwordError}
                  </span>
                )}
              </div>

              <div className={styles.rememberRow}>
                <input
                  id="signin-remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className={styles.checkbox}
                  disabled={isLoading}
                />
                <label htmlFor="signin-remember" className={styles.rememberLabel}>
                  Keep me signed in for 30 days
                </label>
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className={styles.spinner} aria-hidden="true" />
                ) : (
                  <>
                    <span>Sign in to Client Workspace</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>

            <div className={styles.divider}>
              <span>or continue with</span>
            </div>

            <button
              type="button"
              className={styles.ssoBtn}
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className={styles.ssoIcon} viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google Single Sign-On</span>
            </button>
          </div>

          <footer className={styles.footer}>
            <span>Are you a service provider?</span>
            <Link href="/login" className={styles.footerLink}>
              Sign in to Provider Workspace
            </Link>
          </footer>
        </div>
      </section>
    </div>
  );
}
