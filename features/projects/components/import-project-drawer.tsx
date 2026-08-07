import React, { useState } from "react";
import { AlertCircle, AlertTriangle, CheckCircle, ChevronRight, X } from "lucide-react";
import { ImportValidationResult, ProjectListItem, UserSecurityContext } from "../types/project.types";
import { projectImportService } from "../services/project-import.service";
import styles from "../projects.module.css";

interface ImportProjectDrawerProps {
  isOpen: boolean;
  securityContext: UserSecurityContext;
  onClose: () => void;
  onImportSuccess: (project: ProjectListItem) => void;
}

export function ImportProjectDrawer({
  isOpen,
  securityContext,
  onClose,
  onImportSuccess,
}: ImportProjectDrawerProps) {
  const [step, setStep] = useState<"form" | "preview">("form");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [projectName, setProjectName] = useState("");
  const [projectCode, setProjectCode] = useState("");
  const [projectType, setProjectType] = useState("Luxury Residential Villa");
  const [siteLocation, setSiteLocation] = useState("");
  const [phase, setPhase] = useState("Briefing");
  const [startDate] = useState("");
  const [expectedCompletionDate] = useState("");
  const [contractValue] = useState("");
  const [notes] = useState("");

  // Client Selection State
  const [clientMode, setClientMode] = useState<"use_existing" | "create_new">("use_existing");
  const [selectedClientId, setSelectedClientId] = useState("cli-101");
  const [newClientName, setNewClientName] = useState("");
  const [newOrgName, setNewOrgName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone] = useState("");

  // Preview Result & Idempotency Key
  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState<string>("");

  if (!isOpen) return null;

  const handleValidateAndPreview = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const result = await projectImportService.validateAndPreviewImport(securityContext, {
        projectName,
        projectCode: projectCode || `PRJ-IMP-${Math.floor(1000 + Math.random() * 9000)}`,
        projectType,
        clientName: clientMode === "create_new" ? newClientName : undefined,
        organisationName: clientMode === "create_new" ? newOrgName : undefined,
        email: clientMode === "create_new" ? newEmail : undefined,
        phone: clientMode === "create_new" ? newPhone : undefined,
        siteLocation,
        phase,
        startDate,
        expectedCompletionDate,
        contractValue: contractValue ? parseFloat(contractValue) : undefined,
        notes,
      });

      setValidationResult(result);
      if (!result.isValid) {
        setErrorMessage(result.errors.join(" "));
      } else {
        setIdempotencyKey(`idempotency-import-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
        setStep("preview");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg || "Failed to validate project import.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!validationResult || !validationResult.validationId) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await projectImportService.confirmImport(securityContext, {
        validationId: validationResult.validationId,
        idempotencyKey,
        clientSelection: {
          mode: clientMode,
          selectedClientId: clientMode === "use_existing" ? selectedClientId : undefined,
          newClientDetails:
            clientMode === "create_new"
              ? {
                  name: newClientName,
                  organisationName: newOrgName,
                  email: newEmail,
                  phone: newPhone,
                }
              : undefined,
        },
        notes,
      });

      if (res.success) {
        onImportSuccess(res.project);
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg || "Failed to confirm project import.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.drawerOverlay}>
      <div className={styles.drawerContainer} role="dialog" aria-modal="true" aria-label="Import Project Drawer">
        <div className={styles.drawerHeader}>
          <div>
            <span className={styles.drawerEyebrow}>Legacy Migration</span>
            <h2 className={styles.drawerTitle}>Import Project</h2>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {errorMessage && (
          <div className={styles.errorBanner}>
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {step === "form" ? (
          <form onSubmit={handleValidateAndPreview} className={styles.drawerForm}>
            <div className={styles.formSection}>
              <h3 className={styles.formSectionTitle}>Project Details</h3>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Project Name *</label>
                <input
                  type="text"
                  required
                  className={styles.formInput}
                  placeholder="e.g. Malabar Heritage Mansion"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>

              <div className={styles.formGrid2}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Project Code *</label>
                  <input
                    type="text"
                    required
                    className={styles.formInput}
                    placeholder="e.g. PRJ-MHM-99"
                    value={projectCode}
                    onChange={(e) => setProjectCode(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Project Type</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.formGrid2}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Site Location</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="City, District"
                    value={siteLocation}
                    onChange={(e) => setSiteLocation(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Current Phase</label>
                  <select
                    className={styles.formSelect}
                    value={phase}
                    onChange={(e) => setPhase(e.target.value)}
                  >
                    <option value="Briefing">Briefing</option>
                    <option value="Site verification">Site verification</option>
                    <option value="Concept">Concept</option>
                    <option value="Design development">Design development</option>
                    <option value="Approvals">Approvals</option>
                    <option value="BOQ and procurement">BOQ and procurement</option>
                    <option value="Construction">Construction</option>
                    <option value="Handover">Handover</option>
                  </select>
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h3 className={styles.formSectionTitle}>Client Assignment</h3>
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="clientMode"
                    checked={clientMode === "use_existing"}
                    onChange={() => setClientMode("use_existing")}
                  />
                  <span>Select existing client</span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="clientMode"
                    checked={clientMode === "create_new"}
                    onChange={() => setClientMode("create_new")}
                  />
                  <span>Create new client</span>
                </label>
              </div>

              {clientMode === "use_existing" ? (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Existing Client</label>
                  <select
                    className={styles.formSelect}
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                  >
                    <option value="cli-101">Anoop Menon (Menon Residences)</option>
                    <option value="cli-102">Riya Thomas (Thomas Retail Ventures)</option>
                    <option value="cli-103">Nikhil Varma (Varma Living)</option>
                    <option value="cli-104">Ananya Sharma (Sharma Estates)</option>
                  </select>
                </div>
              ) : (
                <div className={styles.newClientBox}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Client Name *</label>
                    <input
                      type="text"
                      required
                      className={styles.formInput}
                      placeholder="Full name"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGrid2}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Organisation Name</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        placeholder="Company or Estate name"
                        value={newOrgName}
                        onChange={(e) => setNewOrgName(e.target.value)}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Email</label>
                      <input
                        type="email"
                        className={styles.formInput}
                        placeholder="client@domain.com"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.drawerFooter}>
              <button type="button" className={styles.secondaryBtn} onClick={onClose}>
                Cancel
              </button>
              <button type="submit" disabled={loading} className={styles.primaryBtn}>
                <span>Validate & Preview</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </form>
        ) : (
          <div className={styles.drawerPreview}>
            <div className={styles.noticeBox}>
              <AlertTriangle size={18} className={styles.noticeIcon} />
              <div>
                <h4 className={styles.noticeTitle}>Important Migration Notice</h4>
                <p className={styles.noticeText}>
                  Importing creates a Kallisto project record. It does not automatically import external files, financial records or previous communication.
                </p>
              </div>
            </div>

            {validationResult?.warnings && validationResult.warnings.length > 0 && (
              <div className={styles.warningBox}>
                {validationResult.warnings.map((w, idx) => (
                  <p key={idx}>{w}</p>
                ))}
              </div>
            )}

            <div className={styles.previewSummaryCard}>
              <h4>Preview Summary</h4>
              <div className={styles.previewGrid}>
                <div>
                  <span className={styles.previewLabel}>Project Name</span>
                  <p className={styles.previewValue}>{validationResult?.dataPreview.projectName}</p>
                </div>
                <div>
                  <span className={styles.previewLabel}>Project Code</span>
                  <p className={styles.previewValue}>{validationResult?.dataPreview.projectCode}</p>
                </div>
                <div>
                  <span className={styles.previewLabel}>Phase</span>
                  <p className={styles.previewValue}>{validationResult?.dataPreview.phase}</p>
                </div>
                <div>
                  <span className={styles.previewLabel}>Location</span>
                  <p className={styles.previewValue}>{validationResult?.dataPreview.siteLocation || "—"}</p>
                </div>
              </div>
            </div>

            <div className={styles.drawerFooter}>
              <button type="button" className={styles.secondaryBtn} onClick={() => setStep("form")}>
                Back to Form
              </button>
              <button
                type="button"
                disabled={loading}
                className={styles.primaryBtn}
                onClick={handleConfirmImport}
              >
                <CheckCircle size={15} />
                <span>{loading ? "Importing..." : "Confirm Import"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
