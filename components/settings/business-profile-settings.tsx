"use client";

import React, { useState } from "react";
import {
  Check,
  Upload,
  FileText,
  AlertCircle,
  Clock,
  ShieldCheck,
  X,
  Building2,
  User,
  RotateCcw,
} from "lucide-react";
import styles from "../../app/settings/settings.module.css";
import { VerifiedBadge } from "@/components/ui/verified-badge";

export type ProviderType = "company" | "individual";
export type VerificationStatus = "pending" | "under_review" | "verified" | "rejected";

export interface StatutoryDocItem {
  id: string;
  name: string;
  category: string;
  required: boolean;
  fileName?: string;
  fileSize?: string;
  uploadedAt?: string;
}

interface BusinessProfileSettingsProps {
  workspace?: {
    id: string;
    name: string;
  };
}

export function BusinessProfileSettings(props?: BusinessProfileSettingsProps) {
  void props;
  // Practice General Details
  const [studioName, setStudioName] = useState("Arjun Architects Studio");
  const [studioWebsite, setStudioWebsite] = useState("arjunarchitects.kallisto.design");
  const [studioAddress, setStudioAddress] = useState("No. 12, MG Road, Bangalore, Karnataka, India");
  const [contactEmail, setContactEmail] = useState("contact@arjunarchitects.com");
  const [contactPhone, setContactPhone] = useState("+91 98450 12345");

  // Provider Type: Company / Firm vs Individual Practitioner
  const [providerType, setProviderType] = useState<ProviderType>("company");

  // Company Statutory Fields
  const [entityStructure, setEntityStructure] = useState("Private Limited Company (Pvt Ltd)");
  const [registrationNumber, setRegistrationNumber] = useState("U74999KA2021PTC148892");
  const [companyPan, setCompanyPan] = useState("AABCA1234F");

  // Individual Statutory Fields
  const [professionalLicenseNo, setProfessionalLicenseNo] = useState("CA/2016/78412");
  const [councilAssociation, setCouncilAssociation] = useState("Council of Architecture (COA)");
  const [individualPan, setIndividualPan] = useState("ABCDE1234F");
  const [practiceExperienceYears, setPracticeExperienceYears] = useState("8");

  // Shared Statutory Fields
  const [isGstApplicable, setIsGstApplicable] = useState(true);
  const [gstin, setGstin] = useState("29AABCA1234F1Z5");
  const [companyCouncil, setCompanyCouncil] = useState("Council of Architecture (Firm Reg) & IIA");

  // Verification Status Lifecycle: strictly pending -> under_review -> verified / rejected
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("pending");
  const [submittedDate, setSubmittedDate] = useState<string | null>(null);
  const [rejectionReason] = useState(
    "Statutory renewal document required: The uploaded COA registration certificate expired in 2026. Please upload the valid renewal certificate."
  );

  // Uploaded Documents state
  const [documents, setDocuments] = useState<StatutoryDocItem[]>([
    {
      id: "business-reg",
      name: "Certificate of Incorporation / Registration Proof",
      category: "Business Document",
      required: true,
      fileName: "Arjun_Architects_Certificate_of_Incorporation.pdf",
      fileSize: "1.4 MB",
      uploadedAt: "Uploaded 12 Mar 2026",
    },
    {
      id: "pan-card",
      name: "Company / Individual PAN Card",
      category: "Tax Statutory",
      required: true,
      fileName: "Arjun_PAN_Statutory.pdf",
      fileSize: "620 KB",
      uploadedAt: "Uploaded 12 Mar 2026",
    },
    {
      id: "license-cert",
      name: "Council of Architecture / Professional License Certificate",
      category: "Professional License",
      required: true,
      fileName: "COA_License_2026.pdf",
      fileSize: "2.1 MB",
      uploadedAt: "Uploaded 14 Mar 2026",
    },
    {
      id: "gstin-cert",
      name: "GST Registration Certificate (Form REG-06)",
      category: "Statutory Tax",
      required: isGstApplicable,
    },
    {
      id: "id-proof",
      name: "Authorized Signatory Government ID Proof (Aadhaar / Passport)",
      category: "Identity Proof",
      required: true,
    },
  ]);

  const [isSaved, setIsSaved] = useState(false);

  // Handle file upload simulation
  const handleFileUpload = (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === docId) {
          return {
            ...doc,
            fileName: file.name,
            fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            uploadedAt: "Uploaded just now",
          };
        }
        return doc;
      })
    );
    // Explicitly enforce: Uploading does NOT automatically verify!
    // Status stays as pending (or current status).
  };

  const handleRemoveFile = (docId: string) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === docId) {
          return {
            id: doc.id,
            name: doc.name,
            category: doc.category,
            required: doc.required,
          };
        }
        return doc;
      })
    );
  };

  // Submit for verification (transitions pending -> under_review)
  const handleSubmitForVerification = () => {
    setVerificationStatus("under_review");
    setSubmittedDate(new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }));
  };

  // Save changes
  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className={styles.contentScrollArea}>
      {/* 1. Practice & Provider Identity Header */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardHeaderTitle}>Business Profile & Statutory Identity</h2>
            <p className={styles.cardHeaderSubtitle}>
              Configure your practice details, statutory tax registrations, and compliance credentials on Kallisto.
            </p>
          </div>
        </div>

        <div className={styles.cardBody}>
          {/* Provider Type Selection */}
          <div className={styles.cleanFieldGroup} style={{ marginBottom: "16px" }}>
            <label className={styles.cleanFieldLabel}>Provider Entity Type</label>
            <div className={styles.providerTypeSelector} role="radiogroup" aria-label="Provider Entity Type">
              <label
                className={`${styles.providerTypeCard} ${
                  providerType === "company" ? styles.providerTypeCardSelected : ""
                }`}
                onClick={() => setProviderType("company")}
              >
                <input
                  type="radio"
                  name="providerType"
                  value="company"
                  checked={providerType === "company"}
                  onChange={() => setProviderType("company")}
                  className={styles.providerTypeRadio}
                />
                <div className={styles.providerTypeCardContent}>
                  <span className={styles.providerTypeCardTitle} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Building2 size={16} /> Registered Firm / Studio / Company
                  </span>
                  <span className={styles.providerTypeCardDesc}>
                    Private limited, LLP, partnership, or corporate architecture & interior design firm.
                  </span>
                </div>
              </label>

              <label
                className={`${styles.providerTypeCard} ${
                  providerType === "individual" ? styles.providerTypeCardSelected : ""
                }`}
                onClick={() => setProviderType("individual")}
              >
                <input
                  type="radio"
                  name="providerType"
                  value="individual"
                  checked={providerType === "individual"}
                  onChange={() => setProviderType("individual")}
                  className={styles.providerTypeRadio}
                />
                <div className={styles.providerTypeCardContent}>
                  <span className={styles.providerTypeCardTitle} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <User size={16} /> Individual Professional / Sole Practitioner
                  </span>
                  <span className={styles.providerTypeCardDesc}>
                    Licensed independent architect, interior designer, or structural consultant practicing under personal credentials.
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className={styles.cleanFormGridThree}>
            <div className={`${styles.cleanFieldGroup} ${styles.colSpan3}`}>
              <label className={styles.cleanFieldLabel}>
                {providerType === "company" ? "Practice / Studio Legal Name" : "Professional Full Name / Practice Title"}
              </label>
              <input
                type="text"
                className={styles.cleanInput}
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
                placeholder="e.g. Arjun Architects Studio"
              />
            </div>

            {/* Row of 3 input fields */}
            <div className={styles.cleanFieldGroup}>
              <label className={styles.cleanFieldLabel}>Official Studio Website / Portfolio</label>
              <div className={styles.cleanInputWithPrefix}>
                <span className={styles.inputPrefixAddon}>https://</span>
                <input
                  type="text"
                  className={styles.inputWithPrefixText}
                  value={studioWebsite}
                  onChange={(e) => setStudioWebsite(e.target.value)}
                  placeholder="your-studio.com"
                />
              </div>
            </div>

            <div className={styles.cleanFieldGroup}>
              <label className={styles.cleanFieldLabel}>Official Contact Email</label>
              <input
                type="email"
                className={styles.cleanInput}
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="contact@studio.com"
              />
            </div>

            <div className={styles.cleanFieldGroup}>
              <label className={styles.cleanFieldLabel}>Contact Phone Number</label>
              <input
                type="tel"
                className={styles.cleanInput}
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 98450 12345"
              />
            </div>

            <div className={`${styles.cleanFieldGroup} ${styles.colSpan3}`}>
              <label className={styles.cleanFieldLabel}>Registered Physical Address</label>
              <input
                type="text"
                className={styles.cleanInput}
                value={studioAddress}
                onChange={(e) => setStudioAddress(e.target.value)}
                placeholder="Enter official registered office address"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Statutory Registration Details (Conditional on Provider Type) */}
      <div className={styles.card} style={{ marginTop: "16px" }}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardHeaderTitle}>
              {providerType === "company" ? "Company Registration & Tax Statutory Details" : "Professional License & Statutory Details"}
            </h2>
            <p className={styles.cardHeaderSubtitle}>
              {providerType === "company"
                ? "Statutory company incorporation details, PAN, GSTIN, and industry council registrations."
                : "Council registration license, individual PAN, and professional credentials."}
            </p>
          </div>
        </div>

        <div className={styles.cardBody}>
          <div className={styles.cleanFormGridThree}>
            {providerType === "company" ? (
              <>
                <div className={styles.cleanFieldGroup}>
                  <label className={styles.cleanFieldLabel}>Entity Legal Structure</label>
                  <select
                    className={styles.cleanSelect}
                    value={entityStructure}
                    onChange={(e) => setEntityStructure(e.target.value)}
                  >
                    <option value="Private Limited Company (Pvt Ltd)">Private Limited Company (Pvt Ltd)</option>
                    <option value="Limited Liability Partnership (LLP)">Limited Liability Partnership (LLP)</option>
                    <option value="Partnership Firm">Partnership Firm</option>
                    <option value="Sole Proprietorship">Sole Proprietorship</option>
                    <option value="Public Limited Company">Public Limited Company</option>
                  </select>
                </div>

                <div className={styles.cleanFieldGroup}>
                  <label className={styles.cleanFieldLabel}>Business Registration No. (CIN / LLPIN / Udyam)</label>
                  <input
                    type="text"
                    className={styles.cleanInput}
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. U74999KA2021PTC148892"
                  />
                  <span className={styles.fieldHint}>Official incorporation or firm registration identifier.</span>
                </div>

                <div className={styles.cleanFieldGroup}>
                  <label className={styles.cleanFieldLabel}>Company PAN</label>
                  <input
                    type="text"
                    className={styles.cleanInput}
                    maxLength={10}
                    value={companyPan}
                    onChange={(e) => setCompanyPan(e.target.value.toUpperCase())}
                    placeholder="e.g. AABCA1234F"
                  />
                  <span className={styles.fieldHint}>10-digit Permanent Account Number issued by Income Tax Dept.</span>
                </div>

                <div className={`${styles.cleanFieldGroup} ${styles.colSpan3}`}>
                  <label className={styles.cleanFieldLabel}>Relevant Council / Association Registration</label>
                  <input
                    type="text"
                    className={styles.cleanInput}
                    value={companyCouncil}
                    onChange={(e) => setCompanyCouncil(e.target.value)}
                    placeholder="e.g. Council of Architecture (Firm Reg) / IIA / CREDAI"
                  />
                  <span className={styles.fieldHint}>Accredited body or professional architecture association.</span>
                </div>
              </>
            ) : (
              <>
                <div className={styles.cleanFieldGroup}>
                  <label className={styles.cleanFieldLabel}>Professional License / Registration No.</label>
                  <input
                    type="text"
                    className={styles.cleanInput}
                    value={professionalLicenseNo}
                    onChange={(e) => setProfessionalLicenseNo(e.target.value.toUpperCase())}
                    placeholder="e.g. CA/2016/78412"
                  />
                  <span className={styles.fieldHint}>Council of Architecture (COA) or Engineering Council reg number.</span>
                </div>

                <div className={styles.cleanFieldGroup}>
                  <label className={styles.cleanFieldLabel}>Professional Council / Association</label>
                  <select
                    className={styles.cleanSelect}
                    value={councilAssociation}
                    onChange={(e) => setCouncilAssociation(e.target.value)}
                  >
                    <option value="Council of Architecture (COA)">Council of Architecture (COA)</option>
                    <option value="The Indian Institute of Architects (IIA)">The Indian Institute of Architects (IIA)</option>
                    <option value="Institution of Engineers India (IEI)">Institution of Engineers India (IEI)</option>
                    <option value="Institute of Indian Interior Designers (IIID)">Institute of Indian Interior Designers (IIID)</option>
                    <option value="Other Recognized Association">Other Recognized Association</option>
                  </select>
                </div>

                <div className={styles.cleanFieldGroup}>
                  <label className={styles.cleanFieldLabel}>Individual PAN</label>
                  <input
                    type="text"
                    className={styles.cleanInput}
                    maxLength={10}
                    value={individualPan}
                    onChange={(e) => setIndividualPan(e.target.value.toUpperCase())}
                    placeholder="e.g. ABCDE1234F"
                  />
                  <span className={styles.fieldHint}>Personal PAN corresponding to your professional practice.</span>
                </div>

                <div className={styles.cleanFieldGroup}>
                  <label className={styles.cleanFieldLabel}>Years of Professional Practice</label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    className={styles.cleanInput}
                    value={practiceExperienceYears}
                    onChange={(e) => setPracticeExperienceYears(e.target.value)}
                    placeholder="e.g. 8"
                  />
                  <span className={styles.fieldHint}>Total active post-qualification experience years.</span>
                </div>
              </>
            )}

            {/* GSTIN Section (Applicable toggle + input) */}
            <div className={`${styles.cleanFieldGroup} ${styles.colSpan3}`} style={{ marginTop: "6px" }}>
              <label className={styles.cleanCheckboxRow}>
                <input
                  type="checkbox"
                  className={styles.cleanCheckbox}
                  checked={isGstApplicable}
                  onChange={(e) => setIsGstApplicable(e.target.checked)}
                />
                <span className={styles.cleanCheckboxLabel}>
                  GST Registered (GSTIN applicable for billing & invoicing on Kallisto)
                </span>
              </label>

              {isGstApplicable && (
                <div style={{ marginTop: "8px", maxWidth: "380px" }}>
                  <label className={styles.cleanFieldLabel}>GSTIN (Goods and Services Tax Identification Number)</label>
                  <input
                    type="text"
                    className={styles.cleanInput}
                    maxLength={15}
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    placeholder="e.g. 29AABCA1234F1Z5"
                  />
                  <span className={styles.fieldHint}>15-character statutory GST identification number.</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
            <button type="button" className={styles.btnPrimary} onClick={handleSave}>
              {isSaved ? (
                <>
                  <Check size={14} color="#ffffff" />
                  <span>Saved</span>
                </>
              ) : (
                <span>Save Registration Details</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Statutory Document & Certificate Uploads */}
      <div className={styles.card} style={{ marginTop: "16px" }}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardHeaderTitle}>Statutory Documents & Certificate Uploads</h2>
            <p className={styles.cardHeaderSubtitle}>
              Upload verified copies of your business incorporation, council license, PAN, and identity proof.
            </p>
          </div>
        </div>

        <div className={styles.cardBody}>
          <div style={{ marginBottom: "14px", padding: "10px 14px", borderRadius: "8px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "12px", color: "#475569", display: "flex", alignItems: "center", gap: "6px" }}>
              <AlertCircle size={14} color="#64748b" />
              <span>
                <strong>Compliance Policy:</strong> Uploading documents does not automatically grant &quot;Verified&quot; status. All submissions undergo structured statutory review by the Kallisto compliance desk before verification is granted.
              </span>
            </span>
          </div>

          <div className={styles.docList}>
            {documents
              .filter((doc) => doc.id !== "gstin-cert" || isGstApplicable)
              .map((doc) => {
                const isUploaded = Boolean(doc.fileName);
                return (
                  <div key={doc.id} className={styles.docItemRow}>
                    <div className={styles.docItemLeft}>
                      <div className={`${styles.docItemIcon} ${isUploaded ? styles.docItemIconSuccess : ""}`}>
                        <FileText size={18} />
                      </div>
                      <div className={styles.docItemText}>
                        <span className={styles.docItemTitle}>
                          {doc.name}
                          {doc.required && (
                            <span style={{ color: "#ef4444", fontSize: "11px", fontWeight: 700 }} title="Required document">
                              *
                            </span>
                          )}
                        </span>
                        <span className={styles.docItemSubtitle}>
                          {isUploaded
                            ? `${doc.fileName} • ${doc.fileSize} • ${doc.uploadedAt}`
                            : `${doc.category} • PDF, PNG, or JPEG (Max 10 MB)`}
                        </span>
                      </div>
                    </div>

                    <div className={styles.docItemRight}>
                      {isUploaded ? (
                        <>
                          <span className={styles.badgeUploaded}>Uploaded</span>
                          <label className={styles.uploadFileBtn} title="Replace uploaded file">
                            <Upload size={13} />
                            <span>Replace</span>
                            <input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg"
                              style={{ display: "none" }}
                              onChange={(e) => handleFileUpload(doc.id, e)}
                            />
                          </label>
                          <button
                            type="button"
                            className={styles.removeFileBtn}
                            onClick={() => handleRemoveFile(doc.id)}
                            title="Remove file"
                            aria-label={`Remove ${doc.name}`}
                          >
                            <X size={15} />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className={styles.badgePending}>Pending Upload</span>
                          <label className={styles.uploadFileBtn}>
                            <Upload size={13} />
                            <span>Upload Document</span>
                            <input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg"
                              style={{ display: "none" }}
                              onChange={(e) => handleFileUpload(doc.id, e)}
                            />
                          </label>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* 4. Verification Status Lifecycle Governance */}
      <div className={styles.card} style={{ marginTop: "16px" }}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardHeaderTitle}>Verification Status & Governance</h2>
            <p className={styles.cardHeaderSubtitle}>
              Strict verification lifecycle status within the Kallisto ecosystem (Pending → Under Review → Verified / Rejected).
            </p>
          </div>
        </div>

        <div className={styles.cardBody}>
          {/* Main Verification Card */}
          <div
            className={`${styles.verificationCard} ${
              verificationStatus === "pending"
                ? styles.verificationCardPending
                : verificationStatus === "under_review"
                ? styles.verificationCardUnderReview
                : verificationStatus === "verified"
                ? styles.verificationCardVerified
                : styles.verificationCardRejected
            }`}
          >
            <div className={styles.verificationStatusHeader}>
              <div className={styles.verificationStatusDetails}>
                <div
                  className={styles.verificationStatusIcon}
                  style={{
                    background:
                      verificationStatus === "pending"
                        ? "#fef3c7"
                        : verificationStatus === "under_review"
                        ? "#dbeafe"
                        : verificationStatus === "verified"
                        ? "#dcfce7"
                        : "#fee2e2",
                    color:
                      verificationStatus === "pending"
                        ? "#b45309"
                        : verificationStatus === "under_review"
                        ? "#1d4ed8"
                        : verificationStatus === "verified"
                        ? "#15803d"
                        : "#b91c1c",
                  }}
                >
                  {verificationStatus === "pending" && <Clock size={20} />}
                  {verificationStatus === "under_review" && <Clock size={20} />}
                  {verificationStatus === "verified" && <ShieldCheck size={20} />}
                  {verificationStatus === "rejected" && <AlertCircle size={20} />}
                </div>

                <div>
                  <h3 className={styles.verificationTitleText}>
                    {verificationStatus === "pending" && "Pending Submission"}
                    {verificationStatus === "under_review" && "Under Compliance Review"}
                    {verificationStatus === "verified" && (
                      <>
                        <VerifiedBadge size={18} /> Verified Practice
                      </>
                    )}
                    {verificationStatus === "rejected" && "Verification Action Required"}
                  </h3>

                  <p className={styles.verificationDescriptionText}>
                    {verificationStatus === "pending" &&
                      "Your business statutory details and credentials have not been submitted for verification. Upload all mandatory documents and submit your profile for compliance review to unlock project bids."}
                    {verificationStatus === "under_review" &&
                      `Credentials submitted on ${
                        submittedDate || "14 Mar 2026"
                      }. The Kallisto compliance team is auditing statutory registrations and license validity. Typical review window is 24–48 hours.`}
                    {verificationStatus === "verified" &&
                      "This practice has been authenticated and approved by the Kallisto Trust & Safety Desk. Statutory licenses, CIN/registration, and PAN credentials are in good standing."}
                    {verificationStatus === "rejected" && rejectionReason}
                  </p>
                </div>
              </div>

              <div
                className={`${styles.verificationStateBadge} ${
                  verificationStatus === "pending"
                    ? styles.statePending
                    : verificationStatus === "under_review"
                    ? styles.stateUnderReview
                    : verificationStatus === "verified"
                    ? styles.stateVerified
                    : styles.stateRejected
                }`}
              >
                {verificationStatus === "pending" && "Pending"}
                {verificationStatus === "under_review" && "Under Review"}
                {verificationStatus === "verified" && "Verified"}
                {verificationStatus === "rejected" && "Rejected"}
              </div>
            </div>

            {/* Action Row */}
            <div className={styles.verificationActionRow}>
              <div className={styles.verificationRequirementsNote}>
                {verificationStatus === "pending" && (
                  <span>Mandatory documents uploaded: 3 of 4 required.</span>
                )}
                {verificationStatus === "under_review" && (
                  <span>Status: Queued for Kallisto auditor review. No further action needed right now.</span>
                )}
                {verificationStatus === "verified" && (
                  <span style={{ color: "#15803d", fontWeight: 600 }}>
                    Active Service Provider • Authorized for Client Contracting
                  </span>
                )}
                {verificationStatus === "rejected" && (
                  <span style={{ color: "#b91c1c", fontWeight: 600 }}>
                    Please update the invalid document above and re-submit.
                  </span>
                )}
              </div>

              {verificationStatus === "pending" && (
                <button
                  type="button"
                  className={styles.btnSubmitVerification}
                  onClick={handleSubmitForVerification}
                >
                  <ShieldCheck size={15} />
                  <span>Submit for Verification</span>
                </button>
              )}

              {verificationStatus === "rejected" && (
                <button
                  type="button"
                  className={styles.btnSubmitVerification}
                  onClick={() => {
                    setVerificationStatus("under_review");
                    setSubmittedDate(new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }));
                  }}
                >
                  <RotateCcw size={15} />
                  <span>Re-submit for Verification</span>
                </button>
              )}
            </div>
          </div>

          {/* Reviewer / QA Simulator Bar */}
          <div className={styles.statusSwitcherRow} style={{ marginTop: "12px" }}>
            <span className={styles.statusSwitcherLabel}>
              Test Lifecycle State:
            </span>
            <div className={styles.statusSwitcherGroup} role="group" aria-label="Simulate Verification State">
              <button
                type="button"
                className={`${styles.statusSwitcherPill} ${
                  verificationStatus === "pending" ? styles.statusSwitcherPillActive : ""
                }`}
                onClick={() => setVerificationStatus("pending")}
              >
                1. Pending
              </button>
              <button
                type="button"
                className={`${styles.statusSwitcherPill} ${
                  verificationStatus === "under_review" ? styles.statusSwitcherPillActive : ""
                }`}
                onClick={() => setVerificationStatus("under_review")}
              >
                2. Under Review
              </button>
              <button
                type="button"
                className={`${styles.statusSwitcherPill} ${
                  verificationStatus === "verified" ? styles.statusSwitcherPillActive : ""
                }`}
                onClick={() => setVerificationStatus("verified")}
              >
                3. Verified
              </button>
              <button
                type="button"
                className={`${styles.statusSwitcherPill} ${
                  verificationStatus === "rejected" ? styles.statusSwitcherPillActive : ""
                }`}
                onClick={() => setVerificationStatus("rejected")}
              >
                4. Rejected
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
