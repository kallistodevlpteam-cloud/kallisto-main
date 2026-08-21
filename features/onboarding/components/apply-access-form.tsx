"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  Building2,
  MapPin,
  Globe,
  Award,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Briefcase,
  Layers,
  Sparkles,
  Check,
  AtSign,
} from "lucide-react";
import { KallistoBrand } from "@/components/layout/kallisto-brand";
import { ThemeSelect, ThemeSelectOption } from "@/components/ui/theme-select";
import {
  FirmDiscipline,
  IndividualProfession,
  OnboardingStep,
  OrganisationType,
  PracticeDiscipline,
  ProviderApplicationFormData,
  ProviderApplicationResult,
  ProviderType,
} from "../types";
import styles from "./apply-access-form.module.css";

const INDIVIDUAL_PROFESSION_OPTIONS: ThemeSelectOption<IndividualProfession>[] = [
  { value: "Architects", label: "Architects" },
  { value: "Interior designers", label: "Interior designers" },
  { value: "Civil engineer", label: "Civil engineer" },
  { value: "Structural engineer", label: "Structural engineer" },
  { value: "Project Management Consultant", label: "Project Management Consultant" },
  { value: "Turnkey Professionals", label: "Turnkey Professionals" },
  { value: "Builders", label: "Builders" },
  { value: "Other", label: "Other" },
];

const FIRM_DISCIPLINE_OPTIONS: ThemeSelectOption<FirmDiscipline>[] = [
  { value: "Architecture or design studio", label: "Architecture or design studio" },
  { value: "Interior design Firm", label: "Interior design Firm" },
  { value: "Engineering consultancy", label: "Engineering consultancy" },
  { value: "Construction company", label: "Construction company" },
  { value: "Design & Building firms", label: "Design & Building firms" },
  { value: "Project Management Consultancy", label: "Project Management Consultancy" },
  { value: "Turnkey contractors", label: "Turnkey contractors" },
  { value: "Builder or Developer", label: "Builder or Developer" },
  { value: "Other", label: "Other" },
];

const EXPERIENCE_OPTIONS: ThemeSelectOption[] = [
  { value: "1-3 years", label: "1–3 years" },
  { value: "3-5 years", label: "3–5 years" },
  { value: "5-10 years", label: "5–10 years" },
  { value: "10+ years", label: "10+ years (Established)" },
];

function sanitizeHandle(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ApplyAccessForm() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("account_creation");
  const [formSubStep, setFormSubStep] = useState<1 | 2 | 3>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedType, setSelectedType] = useState<ProviderType | null>(null);

  // OTP state
  const [otpValues, setOtpValues] = useState<string[]>(["", "", "", "", "", ""]);
  const [resendCountdown, setResendCountdown] = useState(30);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [formData, setFormData] = useState<ProviderApplicationFormData>({
    accountEmail: "",
    password: "",
    isEmailVerified: false,
    providerType: null,
    fullName: "",
    phone: "",
    email: "",
    discipline: "",
    city: "",
    additionalCities: "",
    experienceYears: "5-10 years",
    portfolioUrl: "",
    licenseNumber: "",
    studioName: "",
    virtualOfficeId: "",
    companyName: "",
    organisationType: "",
    companyWebsite: "",
    yearsInOperation: "5-10 years",
    contactPersonName: "",
    contactRole: "",
    gstin: "",
    companyRegNumber: "",
    agreedToTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<ProviderApplicationResult | null>(null);

  // Generate Suggested Virtual Office IDs based on user profile
  const handleSuggestions = useMemo(() => {
    const rawSeed =
      formData.providerType === "company"
        ? formData.companyName || "practice"
        : formData.studioName || formData.fullName || "studio";

    const base = sanitizeHandle(rawSeed);
    if (!base) return ["studio", "studio-vo", "practice-vo"];

    return Array.from(
      new Set([
        base,
        `${base}-studio`,
        formData.discipline ? `${base}-${sanitizeHandle(formData.discipline)}` : `${base}-arch`,
        `vo-${base}`,
      ])
    ).filter((s) => s.length >= 3);
  }, [formData.companyName, formData.studioName, formData.fullName, formData.providerType, formData.discipline]);

  // Pre-fill initial Virtual Office ID if empty
  useEffect(() => {
    if (formSubStep === 3 && !formData.virtualOfficeId && handleSuggestions.length > 0) {
      setFormData((prev) => ({
        ...prev,
        virtualOfficeId: handleSuggestions[0],
      }));
    }
  }, [formSubStep, handleSuggestions, formData.virtualOfficeId]);

  // Resend countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (currentStep === "email_verification" && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [currentStep, resendCountdown]);

  // Step 1: Account Creation Submit
  const handleAccountCreationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.accountEmail.trim()) {
      newErrors.accountEmail = "Work email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.accountEmail.trim())) {
      newErrors.accountEmail = "Please enter a valid work email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setFormData((prev) => ({ ...prev, email: prev.accountEmail }));
      setCurrentStep("email_verification");
      setResendCountdown(30);
    }, 500);
  };

  // Step 2: OTP Input handlers
  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) {
      const pasted = val.slice(0, 6).split("");
      const nextOtp = [...otpValues];
      pasted.forEach((char, i) => {
        if (index + i < 6) nextOtp[index + i] = char;
      });
      setOtpValues(nextOtp);
      const nextFocus = Math.min(index + pasted.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
      return;
    }

    const nextOtp = [...otpValues];
    nextOtp[index] = val;
    setOtpValues(nextOtp);

    if (errors.otp) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.otp;
        return next;
      });
    }

    if (val && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otpValues.join("");

    if (otpCode.length < 6) {
      setErrors({ otp: "Please enter the complete 6-digit verification code" });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setFormData((prev) => ({ ...prev, isEmailVerified: true }));
      setCurrentStep("practice_type_selection");
    }, 600);
  };

  const handleResendOtp = () => {
    if (resendCountdown > 0) return;
    setResendCountdown(30);
    setOtpValues(["", "", "", "", "", ""]);
  };

  // Step 3: Practice Selection
  const handleSelectCard = (type: ProviderType) => {
    setSelectedType(type);
    if (errors.providerType) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.providerType;
        return next;
      });
    }
  };

  const handleContinueToForm = () => {
    if (!selectedType) return;
    setFormData((prev) => ({ ...prev, providerType: selectedType }));
    setFormSubStep(1);
    setErrors({});
    setCurrentStep("application_form");
  };

  const handleBackToPracticeSelection = () => {
    setCurrentStep("practice_type_selection");
    setFormSubStep(1);
    setErrors({});
  };

  const handleInputChange = (
    field: keyof ProviderApplicationFormData,
    value: string | boolean | ProviderType | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Sub-Step 1 Validation & Next
  const handleSubStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (formData.providerType === "individual") {
      if (!formData.fullName.trim()) {
        newErrors.fullName = "Full name is required";
      }
      if (!formData.phone.trim()) {
        newErrors.phone = "Mobile / WhatsApp number is required";
      } else if (!/^[+]?[\d\s-]{8,15}$/.test(formData.phone.trim())) {
        newErrors.phone = "Please enter a valid phone number";
      }
    } else {
      if (!formData.companyName?.trim()) {
        newErrors.companyName = "Firm / Company name is required";
      }
      if (!formData.organisationType) {
        newErrors.organisationType = "Please select your organisation type";
      }
      if (!formData.discipline) {
        newErrors.discipline = "Please select primary discipline / service";
      }
      if (!formData.city.trim()) {
        newErrors.city = "Primary operating city is required";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setFormSubStep(2);
  };

  // Sub-Step 2 Validation & Next
  const handleSubStep2Next = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (formData.providerType === "individual") {
      if (!formData.discipline) {
        newErrors.discipline = "Please select your primary discipline";
      }
      if (!formData.city.trim()) {
        newErrors.city = "Primary operating city is required";
      }
    } else {
      if (!formData.contactPersonName?.trim()) {
        newErrors.contactPersonName = "Authorised contact person name is required";
      }
      if (!formData.contactRole?.trim()) {
        newErrors.contactRole = "Role / Designation is required";
      }
      if (!formData.phone.trim()) {
        newErrors.phone = "Mobile / WhatsApp number is required";
      } else if (!/^[+]?[\d\s-]{8,15}$/.test(formData.phone.trim())) {
        newErrors.phone = "Please enter a valid phone number";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setFormSubStep(3);
  };

  // Sub-Step 3 Final Submission (Virtual Office ID + Consent)
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const cleanVoId = sanitizeHandle(formData.virtualOfficeId || "");
    if (!cleanVoId) {
      newErrors.virtualOfficeId = "Please choose a Virtual Office ID";
    } else if (cleanVoId.length < 3) {
      newErrors.virtualOfficeId = "Virtual Office ID must be at least 3 characters";
    }

    if (!formData.agreedToTerms) {
      newErrors.agreedToTerms = "You must agree to the verification terms to apply";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const generatedId = `KAL-APP-${Math.floor(100000 + Math.random() * 900000)}`;
      const primaryIdentifier =
        formData.providerType === "company"
          ? formData.companyName
          : formData.fullName;

      setSubmittedResult({
        applicationId: generatedId,
        submittedAt: new Date().toISOString(),
        providerType: formData.providerType!,
        primaryIdentifier: primaryIdentifier || "Provider",
        applicantEmail: formData.email || formData.accountEmail,
        virtualOfficeId: cleanVoId,
      });
      setCurrentStep("confirmation");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormExpanded = currentStep === "application_form";

  return (
    <div className={`${styles.authCanvas} ${isFormExpanded ? styles.authCanvasExpanded : ""}`}>
      {/* =========================================================
          LEFT SHELL: FLOATING BRANDING SHELL
          ========================================================= */}
      <section className={styles.brandingShell} aria-label="Kallisto Partner Network Overview">
        <div className={styles.brandingHero}>
          <span className={styles.brandingKicker}>Verified Ecosystem</span>
          <h2 className={styles.brandingTitle}>
            <span>Kallisto Workspace</span>
            <br />
            <span className={styles.brandingTitleSecondary}>Apply for verified service provider access.</span>
          </h2>
          <p className={styles.brandingDesc}>
            Join India’s premier network of architects, interior designers, and construction partners. Receive structured client briefs, authoritative feasibility data, and protected milestone cashflows.
          </p>
        </div>

        <div className={styles.brandingBottomSection}>
          <div className={styles.brandingBottomMeta}>
            <div className={styles.brandingFooterNote}>
              <ShieldCheck size={14} aria-hidden="true" />
              <span>Enterprise Governance & Role-Based Access Control</span>
            </div>
            <span>v2026.1</span>
          </div>
        </div>
      </section>

      {/* =========================================================
          RIGHT SHELL: APPLICATION WORKFLOW
          ========================================================= */}
      <section
        className={`${styles.formShell} ${isFormExpanded ? styles.formShellExpanded : ""}`}
        aria-label="Provider Access Application"
      >
        <div className={styles.formContent}>
          {/* =========================================================
              STEP 1: ACCOUNT CREATION (EMAIL & PASSWORD)
              ========================================================= */}
          {currentStep === "account_creation" && (
            <div className={styles.stepContainer}>
              <header className={styles.header}>
                <div className={styles.logoRow}>
                  <div className={styles.logoWrap}>
                    <KallistoBrand />
                  </div>
                </div>
                <h1 className={styles.title}>Create your Workspace Account</h1>
                <p className={styles.subtitle}>
                  Set up your provider credentials to begin practice verification and project allocation.
                </p>
              </header>

              <form className={styles.form} onSubmit={handleAccountCreationSubmit} noValidate>
                <div className={styles.fieldGroup}>
                  <label htmlFor="reg-email" className={styles.label}>
                    Work Email
                  </label>
                  <div className={styles.inputWrapper}>
                    <Mail size={15} className={styles.inputIcon} aria-hidden="true" />
                    <input
                      id="reg-email"
                      type="email"
                      name="accountEmail"
                      autoComplete="email"
                      placeholder="name@provider.com"
                      value={formData.accountEmail}
                      onChange={(e) => handleInputChange("accountEmail", e.target.value)}
                      className={styles.input}
                      aria-invalid={!!errors.accountEmail}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.accountEmail && <span className={styles.fieldError}>{errors.accountEmail}</span>}
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="reg-password" className={styles.label}>
                    Password
                  </label>
                  <div className={styles.inputWrapper}>
                    <Lock size={15} className={styles.inputIcon} aria-hidden="true" />
                    <input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className={`${styles.input} ${styles.inputWithToggle}`}
                      aria-invalid={!!errors.password}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={styles.passwordToggle}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
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
                      <span>Continue to Email Verification</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>

                <div className={styles.divider}>
                  <span>or continue with</span>
                </div>

                <button
                  type="button"
                  className={styles.ssoBtn}
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      accountEmail: "provider@google-workspace.in",
                      email: "provider@google-workspace.in",
                      isEmailVerified: true,
                    }));
                    setCurrentStep("practice_type_selection");
                  }}
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
              </form>

              <footer className={styles.footer}>
                <span>Already have an account?</span>
                <Link href="/sign-in" className={styles.footerLink}>
                  Sign in to Workspace
                </Link>
              </footer>
            </div>
          )}

          {/* =========================================================
              STEP 2: EMAIL VERIFICATION (OTP)
              ========================================================= */}
          {currentStep === "email_verification" && (
            <div className={styles.stepContainer}>
              <header className={styles.header}>
                <div className={styles.logoRow}>
                  <div className={styles.logoWrap}>
                    <KallistoBrand />
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep("account_creation")}
                    className={styles.backButton}
                    aria-label="Back to account creation"
                  >
                    <ArrowLeft size={13} />
                    <span>Back</span>
                  </button>
                </div>
                <h1 className={styles.title}>Verify your work email</h1>
                <p className={styles.subtitle}>
                  We sent a 6-digit verification code to your work email address.
                </p>
              </header>

              <div className={styles.emailBadgeNotice}>
                <span><strong>{formData.accountEmail}</strong></span>
                <button
                  type="button"
                  onClick={() => setCurrentStep("account_creation")}
                  className={styles.changeEmailBtn}
                >
                  Change
                </button>
              </div>

              <form className={styles.form} onSubmit={handleVerifyOtp}>
                <div className={styles.otpBoxGrid} role="group" aria-label="Verification Code">
                  {otpValues.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className={styles.otpDigitInput}
                      aria-label={`Digit ${idx + 1}`}
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>

                {errors.otp && <span className={styles.fieldError} style={{ textAlign: "center" }}>{errors.otp}</span>}

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className={styles.spinner} aria-hidden="true" />
                  ) : (
                    <>
                      <span>Verify Email & Continue</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>

                <div className={styles.resendContainer}>
                  <span>Didn’t receive the code?</span>
                  {resendCountdown > 0 ? (
                    <span>Resend in {resendCountdown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className={styles.resendActiveBtn}
                    >
                      Resend code
                    </button>
                  )}
                </div>
              </form>

              <footer className={styles.footer}>
                <span>Need assistance?</span>
                <a href="mailto:support@kallisto.in" className={styles.footerLink}>
                  Contact Support
                </a>
              </footer>
            </div>
          )}

          {/* =========================================================
              STEP 3: PRACTICE SELECTION (EXACT MOCKUP)
              ========================================================= */}
          {currentStep === "practice_type_selection" && (
            <div className={styles.stepContainer}>
              <header className={styles.header}>
                <div className={styles.logoRow}>
                  <div className={styles.logoWrap}>
                    <KallistoBrand />
                  </div>
                </div>
                <h1 className={styles.title}>Tell us about your practice</h1>
                <p className={styles.subtitle}>
                  Join the first group of construction professionals and firms being considered for Kallisto Virtual Office early access.
                </p>
              </header>

              <div className={styles.stepSectionHeader}>Who are you joining as?</div>

              <div className={styles.typeSelectionGrid} role="radiogroup" aria-label="Who are you joining as?">
                {/* Option 1: Independent professional */}
                <button
                  type="button"
                  role="radio"
                  aria-checked={selectedType === "individual"}
                  className={`${styles.typeCard} ${selectedType === "individual" ? styles.typeCardSelected : ""}`}
                  onClick={() => handleSelectCard("individual")}
                  aria-label="Independent professional: A sole practitioner working under your own professional identity."
                >
                  <div className={styles.typeCardHeader}>
                    <span className={styles.typeShapeIcon} aria-hidden="true">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="#2563eb">
                        <path d="M12 3L2 21h20L12 3z" />
                      </svg>
                    </span>
                    <span className={styles.typeCardTitle}>Independent professional</span>
                  </div>
                  <div className={styles.typeCardDesc}>
                    A sole practitioner working under your own professional identity.
                  </div>
                </button>

                {/* Option 2: Firm or company */}
                <button
                  type="button"
                  role="radio"
                  aria-checked={selectedType === "company"}
                  className={`${styles.typeCard} ${selectedType === "company" ? styles.typeCardSelected : ""}`}
                  onClick={() => handleSelectCard("company")}
                  aria-label="Firm or company: A studio, consultancy, construction company or registered practice."
                >
                  <div className={styles.typeCardHeader}>
                    <span className={styles.typeShapeIcon} aria-hidden="true">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="#16a34a">
                        <rect width="20" height="20" x="2" y="2" rx="4" />
                      </svg>
                    </span>
                    <span className={styles.typeCardTitle}>Firm or company</span>
                  </div>
                  <div className={styles.typeCardDesc}>
                    A studio, consultancy, construction company or registered practice.
                  </div>
                </button>
              </div>

              <button
                type="button"
                onClick={handleContinueToForm}
                disabled={!selectedType}
                className={`${styles.continueBtn} ${
                  selectedType ? styles.continueBtnActive : styles.continueBtnDisabled
                }`}
                aria-label="Continue to application form"
              >
                Continue
              </button>

              <footer className={styles.footer}>
                <span>Already an approved provider?</span>
                <Link href="/sign-in" className={styles.footerLink}>
                  Sign in to Workspace
                </Link>
              </footer>
            </div>
          )}

          {/* =========================================================
              STEP 4: 3-STEP BRANCHING APPLICATION FORM
              ========================================================= */}
          {currentStep === "application_form" && (
            <div className={styles.stepContainer}>
              <header className={styles.header}>
                <div className={styles.logoRow}>
                  <div className={styles.logoWrap}>
                    <KallistoBrand />
                  </div>
                  <button
                    type="button"
                    onClick={handleBackToPracticeSelection}
                    className={styles.backButton}
                    aria-label="Change provider type"
                  >
                    <ArrowLeft size={13} />
                    <span>Change type</span>
                  </button>
                </div>
                <h1 className={styles.title}>
                  {formData.providerType === "individual"
                    ? "Apply as an Independent Professional"
                    : "Apply as a Firm or Company"}
                </h1>
                <p className={styles.subtitle}>
                  {formData.providerType === "individual"
                    ? "Complete your professional profile for verification and project matching."
                    : "Complete your practice profile and authorised contact details for verification."}
                </p>

                {/* Sub-step Progress Bar */}
                <div className={styles.progressRow}>
                  <span className={styles.progressBadge}>
                    Step {formSubStep} of 3:{" "}
                    {formSubStep === 1
                      ? formData.providerType === "individual"
                        ? "Contact Details"
                        : "Organisation Profile"
                      : formSubStep === 2
                      ? formData.providerType === "individual"
                        ? "Professional Details"
                        : "Authorised Contact"
                      : "Virtual Office ID & Verification"}
                  </span>
                  <div className={styles.progressPills} aria-hidden="true">
                    <div
                      className={`${styles.progressPill} ${
                        formSubStep >= 1 ? styles.progressPillActive : ""
                      }`}
                    />
                    <div
                      className={`${styles.progressPill} ${
                        formSubStep >= 2 ? styles.progressPillActive : ""
                      }`}
                    />
                    <div
                      className={`${styles.progressPill} ${
                        formSubStep >= 3 ? styles.progressPillActive : ""
                      }`}
                    />
                  </div>
                </div>
              </header>

              {/* =========================================================
                  BRANCH A: INDEPENDENT PROFESSIONAL (3 SUB-STEPS)
                  ========================================================= */}
              {formData.providerType === "individual" && (
                <>
                  {/* Sub-Step 1: Contact Details */}
                  {formSubStep === 1 && (
                    <form className={styles.form} onSubmit={handleSubStep1Next} noValidate>
                      <div className={styles.sectionGroup}>
                        <div className={styles.formRow}>
                          <div className={styles.fieldGroup}>
                            <label htmlFor="ind-name" className={styles.label}>
                              Full Name
                            </label>
                            <div className={styles.inputWrapper}>
                              <User size={15} className={styles.inputIcon} aria-hidden="true" />
                              <input
                                id="ind-name"
                                type="text"
                                name="fullName"
                                autoComplete="name"
                                placeholder="Arjun Menon"
                                value={formData.fullName}
                                onChange={(e) => handleInputChange("fullName", e.target.value)}
                                className={styles.input}
                                aria-invalid={!!errors.fullName}
                                disabled={isLoading}
                              />
                            </div>
                            {errors.fullName && <span className={styles.fieldError}>{errors.fullName}</span>}
                          </div>

                          <div className={styles.fieldGroup}>
                            <label htmlFor="ind-phone" className={styles.label}>
                              Mobile / WhatsApp
                            </label>
                            <div className={styles.inputWrapper}>
                              <Phone size={15} className={styles.inputIcon} aria-hidden="true" />
                              <input
                                id="ind-phone"
                                type="tel"
                                name="phone"
                                autoComplete="tel"
                                placeholder="+91 98450 12345"
                                value={formData.phone}
                                onChange={(e) => handleInputChange("phone", e.target.value)}
                                className={styles.input}
                                aria-invalid={!!errors.phone}
                                disabled={isLoading}
                              />
                            </div>
                            {errors.phone && <span className={styles.fieldError}>{errors.phone}</span>}
                          </div>
                        </div>
                      </div>

                      <button type="submit" className={styles.submitBtn}>
                        <span>Continue to Professional Details</span>
                        <ArrowRight size={14} />
                      </button>
                    </form>
                  )}

                  {/* Sub-Step 2: Professional Details */}
                  {formSubStep === 2 && (
                    <form className={styles.form} onSubmit={handleSubStep2Next} noValidate>
                      <div className={styles.sectionGroup}>
                        <div className={styles.formRow}>
                          <div className={styles.fieldGroup}>
                            <label htmlFor="ind-discipline" className={styles.label}>
                              Primary Practice Discipline
                            </label>
                            <ThemeSelect
                              id="ind-discipline"
                              name="discipline"
                              ariaLabel="Primary Practice Discipline"
                              value={formData.discipline}
                              options={INDIVIDUAL_PROFESSION_OPTIONS}
                              placeholder="Select profession..."
                              icon={<Briefcase size={15} aria-hidden="true" />}
                              variant="formField"
                              hasError={!!errors.discipline}
                              disabled={isLoading}
                              fullWidth
                              onChange={(val) => handleInputChange("discipline", val as PracticeDiscipline)}
                            />
                            {errors.discipline && <span className={styles.fieldError}>{errors.discipline}</span>}
                          </div>

                          <div className={styles.fieldGroup}>
                            <label htmlFor="ind-city" className={styles.label}>
                              Primary Operating City
                            </label>
                            <div className={styles.inputWrapper}>
                              <MapPin size={15} className={styles.inputIcon} aria-hidden="true" />
                              <input
                                id="ind-city"
                                type="text"
                                name="city"
                                placeholder="Kochi, Bengaluru..."
                                value={formData.city}
                                onChange={(e) => handleInputChange("city", e.target.value)}
                                className={styles.input}
                                aria-invalid={!!errors.city}
                                disabled={isLoading}
                              />
                            </div>
                            {errors.city && <span className={styles.fieldError}>{errors.city}</span>}
                          </div>
                        </div>

                        <div className={styles.formRow}>
                          <div className={styles.fieldGroup}>
                            <label htmlFor="ind-exp" className={styles.label}>
                              Years of Experience
                            </label>
                            <ThemeSelect
                              id="ind-exp"
                              name="experienceYears"
                              ariaLabel="Years of Experience"
                              value={formData.experienceYears}
                              options={EXPERIENCE_OPTIONS}
                              icon={<Calendar size={15} aria-hidden="true" />}
                              variant="formField"
                              disabled={isLoading}
                              fullWidth
                              onChange={(val) => handleInputChange("experienceYears", val)}
                            />
                          </div>

                          <div className={styles.fieldGroup}>
                            <label htmlFor="ind-portfolio" className={styles.label}>
                              Portfolio / Website <span className={styles.optionalLabel}>(Optional)</span>
                            </label>
                            <div className={styles.inputWrapper}>
                              <Globe size={15} className={styles.inputIcon} aria-hidden="true" />
                              <input
                                id="ind-portfolio"
                                type="url"
                                name="portfolioUrl"
                                placeholder="https://arjunmenon.in"
                                value={formData.portfolioUrl}
                                onChange={(e) => handleInputChange("portfolioUrl", e.target.value)}
                                className={styles.input}
                                disabled={isLoading}
                              />
                            </div>
                          </div>
                        </div>

                        <div className={styles.fieldGroup}>
                          <label htmlFor="ind-license" className={styles.label}>
                            Council / Professional Registration No. <span className={styles.optionalLabel}>(CoA, IIID, etc. optional)</span>
                          </label>
                          <div className={styles.inputWrapper}>
                            <Award size={15} className={styles.inputIcon} aria-hidden="true" />
                            <input
                              id="ind-license"
                              type="text"
                              name="licenseNumber"
                              placeholder="CA/2019/12345"
                              value={formData.licenseNumber}
                              onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                              className={styles.input}
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                      </div>

                      <div className={styles.formNavRow}>
                        <button
                          type="button"
                          onClick={() => setFormSubStep(1)}
                          className={styles.navBackBtn}
                        >
                          <ArrowLeft size={13} />
                          <span>Back</span>
                        </button>
                        <button type="submit" className={styles.submitBtn}>
                          <span>Continue to Virtual Office Setup</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Sub-Step 3: Virtual Office ID Selection & Practice Verification */}
                  {formSubStep === 3 && (
                    <form className={styles.form} onSubmit={handleFinalSubmit} noValidate>
                      <div className={styles.sectionGroup}>
                        {/* Virtual Office ID Selection Field */}
                        <div className={styles.fieldGroup}>
                          <div className={styles.fieldHeaderRow}>
                            <label htmlFor="ind-vo-id" className={styles.label}>
                              Virtual Office ID
                            </label>
                            <span className={styles.voAvailabilityBadge}>
                              <Check size={11} aria-hidden="true" />
                              <span>Available on Kallisto</span>
                            </span>
                          </div>

                          <div className={styles.inputWrapper}>
                            <AtSign size={15} className={styles.inputIcon} aria-hidden="true" />
                            <input
                              id="ind-vo-id"
                              type="text"
                              name="virtualOfficeId"
                              placeholder="e.g. arjunmenon"
                              value={formData.virtualOfficeId}
                              onChange={(e) => handleInputChange("virtualOfficeId", sanitizeHandle(e.target.value))}
                              className={styles.input}
                              aria-label="Virtual Office ID Handle"
                              aria-invalid={!!errors.virtualOfficeId}
                              disabled={isLoading}
                            />
                          </div>

                          {errors.virtualOfficeId && (
                            <span className={styles.fieldError}>{errors.virtualOfficeId}</span>
                          )}

                          {/* Suggestions */}
                          {handleSuggestions.length > 0 && (
                            <div className={styles.suggestionsWrapper}>
                              <span className={styles.suggestionsLabel}>
                                <Sparkles size={11} style={{ display: "inline", verticalAlign: "middle", marginRight: "3px" }} />
                                Suggestions:
                              </span>
                              {handleSuggestions.map((sug) => (
                                <button
                                  key={sug}
                                  type="button"
                                  className={`${styles.suggestionChip} ${
                                    formData.virtualOfficeId === sug ? styles.suggestionChipActive : ""
                                  }`}
                                  onClick={() => handleInputChange("virtualOfficeId", sug)}
                                >
                                  {sug}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className={styles.formRow}>
                          <div className={styles.fieldGroup}>
                            <label htmlFor="ind-studio" className={styles.label}>
                              Studio / Practice Display Name <span className={styles.optionalLabel}>(Optional)</span>
                            </label>
                            <div className={styles.inputWrapper}>
                              <Building2 size={15} className={styles.inputIcon} aria-hidden="true" />
                              <input
                                id="ind-studio"
                                type="text"
                                name="studioName"
                                placeholder="Studio Menon"
                                value={formData.studioName}
                                onChange={(e) => handleInputChange("studioName", e.target.value)}
                                className={styles.input}
                                disabled={isLoading}
                              />
                            </div>
                          </div>

                          <div className={styles.fieldGroup}>
                            <label htmlFor="ind-addcities" className={styles.label}>
                              Additional Operating Cities <span className={styles.optionalLabel}>(Optional)</span>
                            </label>
                            <div className={styles.inputWrapper}>
                              <MapPin size={15} className={styles.inputIcon} aria-hidden="true" />
                              <input
                                id="ind-addcities"
                                type="text"
                                name="additionalCities"
                                placeholder="Calicut, Trivandrum..."
                                value={formData.additionalCities}
                                onChange={(e) => handleInputChange("additionalCities", e.target.value)}
                                className={styles.input}
                                disabled={isLoading}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Consent Checkbox */}
                        <div className={styles.consentRow}>
                          <input
                            id="apply-terms-ind"
                            type="checkbox"
                            checked={formData.agreedToTerms}
                            onChange={(e) => handleInputChange("agreedToTerms", e.target.checked)}
                            className={styles.checkbox}
                            disabled={isLoading}
                          />
                          <label htmlFor="apply-terms-ind" className={styles.consentLabel}>
                            I confirm that the details provided are accurate and agree to Kallisto’s Service Provider Verification Terms and Privacy Policy.
                          </label>
                        </div>
                        {errors.agreedToTerms && <span className={styles.fieldError}>{errors.agreedToTerms}</span>}
                      </div>

                      <div className={styles.formNavRow}>
                        <button
                          type="button"
                          onClick={() => setFormSubStep(2)}
                          className={styles.navBackBtn}
                        >
                          <ArrowLeft size={13} />
                          <span>Back</span>
                        </button>
                        <button
                          type="submit"
                          className={styles.submitBtn}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <span className={styles.spinner} aria-hidden="true" />
                          ) : (
                            <>
                              <span>Reserve & Submit for Verification</span>
                              <ArrowRight size={14} />
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}

              {/* =========================================================
                  BRANCH B: FIRM OR COMPANY (3 SUB-STEPS)
                  ========================================================= */}
              {formData.providerType === "company" && (
                <>
                  {/* Sub-Step 1: Organisation Profile */}
                  {formSubStep === 1 && (
                    <form className={styles.form} onSubmit={handleSubStep1Next} noValidate>
                      <div className={styles.sectionGroup}>
                        <div className={styles.formRow}>
                          <div className={styles.fieldGroup}>
                            <label htmlFor="org-name" className={styles.label}>
                              Firm / Company Name
                            </label>
                            <div className={styles.inputWrapper}>
                              <Building2 size={15} className={styles.inputIcon} aria-hidden="true" />
                              <input
                                id="org-name"
                                type="text"
                                name="companyName"
                                placeholder="Kallisto Design Studio Pvt Ltd"
                                value={formData.companyName}
                                onChange={(e) => handleInputChange("companyName", e.target.value)}
                                className={styles.input}
                                aria-invalid={!!errors.companyName}
                                disabled={isLoading}
                              />
                            </div>
                            {errors.companyName && <span className={styles.fieldError}>{errors.companyName}</span>}
                          </div>

                          <div className={styles.fieldGroup}>
                            <label htmlFor="org-type" className={styles.label}>
                              Organisation Type
                            </label>
                            <ThemeSelect
                              id="org-type"
                              name="organisationType"
                              ariaLabel="Organisation Type"
                              value={formData.organisationType || ""}
                              options={FIRM_DISCIPLINE_OPTIONS}
                              placeholder="Select organisation type..."
                              icon={<Layers size={15} aria-hidden="true" />}
                              variant="formField"
                              hasError={!!errors.organisationType}
                              disabled={isLoading}
                              fullWidth
                              onChange={(val) => handleInputChange("organisationType", val as OrganisationType)}
                            />
                            {errors.organisationType && <span className={styles.fieldError}>{errors.organisationType}</span>}
                          </div>
                        </div>

                        <div className={styles.formRow}>
                          <div className={styles.fieldGroup}>
                            <label htmlFor="org-discipline" className={styles.label}>
                              Primary Discipline / Service
                            </label>
                            <ThemeSelect
                              id="org-discipline"
                              name="discipline"
                              ariaLabel="Primary Discipline / Service"
                              value={formData.discipline}
                              options={FIRM_DISCIPLINE_OPTIONS}
                              placeholder="Select primary discipline..."
                              icon={<Briefcase size={15} aria-hidden="true" />}
                              variant="formField"
                              hasError={!!errors.discipline}
                              disabled={isLoading}
                              fullWidth
                              onChange={(val) => handleInputChange("discipline", val as PracticeDiscipline)}
                            />
                            {errors.discipline && <span className={styles.fieldError}>{errors.discipline}</span>}
                          </div>

                          <div className={styles.fieldGroup}>
                            <label htmlFor="org-city" className={styles.label}>
                              Primary Operating City
                            </label>
                            <div className={styles.inputWrapper}>
                              <MapPin size={15} className={styles.inputIcon} aria-hidden="true" />
                              <input
                                id="org-city"
                                type="text"
                                name="city"
                                placeholder="Kochi, Bengaluru, Mumbai..."
                                value={formData.city}
                                onChange={(e) => handleInputChange("city", e.target.value)}
                                className={styles.input}
                                aria-invalid={!!errors.city}
                                disabled={isLoading}
                              />
                            </div>
                            {errors.city && <span className={styles.fieldError}>{errors.city}</span>}
                          </div>
                        </div>
                      </div>

                      <button type="submit" className={styles.submitBtn}>
                        <span>Continue to Authorised Contact</span>
                        <ArrowRight size={14} />
                      </button>
                    </form>
                  )}

                  {/* Sub-Step 2: Authorised Representative */}
                  {formSubStep === 2 && (
                    <form className={styles.form} onSubmit={handleSubStep2Next} noValidate>
                      <div className={styles.sectionGroup}>
                        <div className={styles.formRow}>
                          <div className={styles.fieldGroup}>
                            <label htmlFor="org-contact-name" className={styles.label}>
                              Contact Person Name
                            </label>
                            <div className={styles.inputWrapper}>
                              <User size={15} className={styles.inputIcon} aria-hidden="true" />
                              <input
                                id="org-contact-name"
                                type="text"
                                name="contactPersonName"
                                autoComplete="name"
                                placeholder="Priya Nair"
                                value={formData.contactPersonName}
                                onChange={(e) => handleInputChange("contactPersonName", e.target.value)}
                                className={styles.input}
                                aria-invalid={!!errors.contactPersonName}
                                disabled={isLoading}
                              />
                            </div>
                            {errors.contactPersonName && <span className={styles.fieldError}>{errors.contactPersonName}</span>}
                          </div>

                          <div className={styles.fieldGroup}>
                            <label htmlFor="org-contact-role" className={styles.label}>
                              Role / Designation
                            </label>
                            <div className={styles.inputWrapper}>
                              <Briefcase size={15} className={styles.inputIcon} aria-hidden="true" />
                              <input
                                id="org-contact-role"
                                type="text"
                                name="contactRole"
                                placeholder="Managing Director / Partner"
                                value={formData.contactRole}
                                onChange={(e) => handleInputChange("contactRole", e.target.value)}
                                className={styles.input}
                                aria-invalid={!!errors.contactRole}
                                disabled={isLoading}
                              />
                            </div>
                            {errors.contactRole && <span className={styles.fieldError}>{errors.contactRole}</span>}
                          </div>
                        </div>

                        <div className={styles.formRow}>
                          <div className={styles.fieldGroup}>
                            <label htmlFor="org-phone" className={styles.label}>
                              Mobile / WhatsApp
                            </label>
                            <div className={styles.inputWrapper}>
                              <Phone size={15} className={styles.inputIcon} aria-hidden="true" />
                              <input
                                id="org-phone"
                                type="tel"
                                name="phone"
                                autoComplete="tel"
                                placeholder="+91 98450 67890"
                                value={formData.phone}
                                onChange={(e) => handleInputChange("phone", e.target.value)}
                                className={styles.input}
                                aria-invalid={!!errors.phone}
                                disabled={isLoading}
                              />
                            </div>
                            {errors.phone && <span className={styles.fieldError}>{errors.phone}</span>}
                          </div>

                          <div className={styles.fieldGroup}>
                            <label htmlFor="org-website" className={styles.label}>
                              Company Website / Portfolio <span className={styles.optionalLabel}>(Optional)</span>
                            </label>
                            <div className={styles.inputWrapper}>
                              <Globe size={15} className={styles.inputIcon} aria-hidden="true" />
                              <input
                                id="org-website"
                                type="url"
                                name="companyWebsite"
                                placeholder="https://kallistostudio.in"
                                value={formData.companyWebsite}
                                onChange={(e) => handleInputChange("companyWebsite", e.target.value)}
                                className={styles.input}
                                disabled={isLoading}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className={styles.formNavRow}>
                        <button
                          type="button"
                          onClick={() => setFormSubStep(1)}
                          className={styles.navBackBtn}
                        >
                          <ArrowLeft size={13} />
                          <span>Back</span>
                        </button>
                        <button type="submit" className={styles.submitBtn}>
                          <span>Continue to Virtual Office Setup</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Sub-Step 3: Virtual Office ID Selection & Operations */}
                  {formSubStep === 3 && (
                    <form className={styles.form} onSubmit={handleFinalSubmit} noValidate>
                      <div className={styles.sectionGroup}>
                        {/* Virtual Office ID Selection Field */}
                        <div className={styles.fieldGroup}>
                          <div className={styles.fieldHeaderRow}>
                            <label htmlFor="org-vo-id" className={styles.label}>
                              Firm Virtual Office ID
                            </label>
                            <span className={styles.voAvailabilityBadge}>
                              <Check size={11} aria-hidden="true" />
                              <span>Available on Kallisto</span>
                            </span>
                          </div>

                          <div className={styles.inputWrapper}>
                            <AtSign size={15} className={styles.inputIcon} aria-hidden="true" />
                            <input
                              id="org-vo-id"
                              type="text"
                              name="virtualOfficeId"
                              placeholder="e.g. kallisto-design-studio"
                              value={formData.virtualOfficeId}
                              onChange={(e) => handleInputChange("virtualOfficeId", sanitizeHandle(e.target.value))}
                              className={styles.input}
                              aria-label="Firm Virtual Office ID Handle"
                              aria-invalid={!!errors.virtualOfficeId}
                              disabled={isLoading}
                            />
                          </div>

                          {errors.virtualOfficeId && (
                            <span className={styles.fieldError}>{errors.virtualOfficeId}</span>
                          )}

                          {/* Suggestions */}
                          {handleSuggestions.length > 0 && (
                            <div className={styles.suggestionsWrapper}>
                              <span className={styles.suggestionsLabel}>
                                <Sparkles size={11} style={{ display: "inline", verticalAlign: "middle", marginRight: "3px" }} />
                                Suggestions:
                              </span>
                              {handleSuggestions.map((sug) => (
                                <button
                                  key={sug}
                                  type="button"
                                  className={`${styles.suggestionChip} ${
                                    formData.virtualOfficeId === sug ? styles.suggestionChipActive : ""
                                  }`}
                                  onClick={() => handleInputChange("virtualOfficeId", sug)}
                                >
                                  {sug}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className={styles.formRow}>
                          <div className={styles.fieldGroup}>
                            <label htmlFor="org-years" className={styles.label}>
                              Years in Operation
                            </label>
                            <ThemeSelect
                              id="org-years"
                              name="yearsInOperation"
                              ariaLabel="Years in Operation"
                              value={formData.yearsInOperation || "5-10 years"}
                              options={EXPERIENCE_OPTIONS}
                              icon={<Calendar size={15} aria-hidden="true" />}
                              variant="formField"
                              disabled={isLoading}
                              fullWidth
                              onChange={(val) => handleInputChange("yearsInOperation", val)}
                            />
                          </div>

                          <div className={styles.fieldGroup}>
                            <label htmlFor="org-addcities" className={styles.label}>
                              Additional Operating Cities <span className={styles.optionalLabel}>(Optional)</span>
                            </label>
                            <div className={styles.inputWrapper}>
                              <MapPin size={15} className={styles.inputIcon} aria-hidden="true" />
                              <input
                                id="org-addcities"
                                type="text"
                                name="additionalCities"
                                placeholder="Chennai, Hyderabad, Pune..."
                                value={formData.additionalCities}
                                onChange={(e) => handleInputChange("additionalCities", e.target.value)}
                                className={styles.input}
                                disabled={isLoading}
                              />
                            </div>
                          </div>
                        </div>

                        <div className={styles.formRow}>
                          <div className={styles.fieldGroup}>
                            <label htmlFor="org-gstin" className={styles.label}>
                              GSTIN <span className={styles.optionalLabel}>(Optional)</span>
                            </label>
                            <div className={styles.inputWrapper}>
                              <Award size={15} className={styles.inputIcon} aria-hidden="true" />
                              <input
                                id="org-gstin"
                                type="text"
                                name="gstin"
                                placeholder="32AAAAA0000A1Z5"
                                value={formData.gstin}
                                onChange={(e) => handleInputChange("gstin", e.target.value)}
                                className={styles.input}
                                disabled={isLoading}
                              />
                            </div>
                          </div>

                          <div className={styles.fieldGroup}>
                            <label htmlFor="org-reg" className={styles.label}>
                              Company / LLP Reg. No. <span className={styles.optionalLabel}>(Optional)</span>
                            </label>
                            <div className={styles.inputWrapper}>
                              <Award size={15} className={styles.inputIcon} aria-hidden="true" />
                              <input
                                id="org-reg"
                                type="text"
                                name="companyRegNumber"
                                placeholder="U74999KL2020PTC012345"
                                value={formData.companyRegNumber}
                                onChange={(e) => handleInputChange("companyRegNumber", e.target.value)}
                                className={styles.input}
                                disabled={isLoading}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Consent Checkbox */}
                        <div className={styles.consentRow}>
                          <input
                            id="apply-terms-org"
                            type="checkbox"
                            checked={formData.agreedToTerms}
                            onChange={(e) => handleInputChange("agreedToTerms", e.target.checked)}
                            className={styles.checkbox}
                            disabled={isLoading}
                          />
                          <label htmlFor="apply-terms-org" className={styles.consentLabel}>
                            I confirm that the details provided are accurate and agree to Kallisto’s Service Provider Verification Terms and Privacy Policy.
                          </label>
                        </div>
                        {errors.agreedToTerms && <span className={styles.fieldError}>{errors.agreedToTerms}</span>}
                      </div>

                      <div className={styles.formNavRow}>
                        <button
                          type="button"
                          onClick={() => setFormSubStep(2)}
                          className={styles.navBackBtn}
                        >
                          <ArrowLeft size={13} />
                          <span>Back</span>
                        </button>
                        <button
                          type="submit"
                          className={styles.submitBtn}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <span className={styles.spinner} aria-hidden="true" />
                          ) : (
                            <>
                              <span>Reserve & Submit for Verification</span>
                              <ArrowRight size={14} />
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}

              <footer className={styles.footer}>
                <span>Already an approved provider?</span>
                <Link href="/sign-in" className={styles.footerLink}>
                  Sign in to Workspace
                </Link>
              </footer>
            </div>
          )}

          {/* =========================================================
              STEP 5: SUCCESS CONFIRMATION STATE
              ========================================================= */}
          {currentStep === "confirmation" && submittedResult && (
            <div className={styles.successContainer} role="status">
              <div className={styles.successIconBadge}>
                <CheckCircle2 size={32} />
              </div>
              <h1 className={styles.successTitle}>Application Received</h1>
              <p className={styles.successDesc}>
                Thank you for applying to the Kallisto Provider Ecosystem as an{" "}
                <strong>
                  {submittedResult.providerType === "company"
                    ? "Organisation / Firm"
                    : "Independent Professional"}
                </strong>
                . Our verification team will review your practice credentials within{" "}
                <strong>24–48 business hours</strong>.
              </p>

              <div className={styles.appReferenceCard}>
                <span className={styles.appRefLabel}>Application Reference</span>
                <span className={styles.appRefValue}>{submittedResult.applicationId}</span>
                {submittedResult.virtualOfficeId && (
                  <div className={styles.appRefVoUrl}>
                    <span>Virtual Office ID:</span>
                    <strong>{submittedResult.virtualOfficeId}</strong>
                  </div>
                )}
                <span style={{ fontSize: "11.5px", color: "var(--muted, #64748b)" }}>
                  Applicant: <strong>{submittedResult.primaryIdentifier}</strong> ({submittedResult.applicantEmail})
                </span>
              </div>

              <Link href="/sign-in" className={styles.returnBtn}>
                <span>Return to Sign In</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
