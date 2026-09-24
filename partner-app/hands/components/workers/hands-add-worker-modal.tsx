"use client";

import React, { useState } from "react";
import { X, Upload, Check, Calendar, Camera } from "lucide-react";
import {
  WorkerProfile,
  WorkerTrade,
} from "../../types/worker-domain";
import styles from "./hands-workers.module.css";

interface HandsAddWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWorker: (newWorker: WorkerProfile) => void;
}

const STEPS = [
  { id: 1, title: "Basic info", desc: "Personal details" },
  { id: 2, title: "Service Info", desc: "Skills & capabilities" },
  { id: 3, title: "Bank Details", desc: "Payment information" },
  { id: 4, title: "Documents", desc: "Identity verification" },
];

const DEFAULT_SERVICES = [
  "Carpentry",
  "Construction",
  "Plumbing",
  "Concrete Work",
  "Masonry",
  "Electrical",
  "Plastering",
  "Tile Work",
  "Painting",
  "Steel Fixing",
  "Formwork",
];

const EXPERIENCE_OPTIONS = [
  "0-1 Years",
  "1-3 Years",
  "3-5 Years",
  "5-10 Years",
  "10+ Years",
];

export function HandsAddWorkerModal({
  isOpen,
  onClose,
  onAddWorker,
}: HandsAddWorkerModalProps) {
  const [page, setPage] = useState<1 | 2 | 3>(1);
  const [slideDirection, setSlideDirection] = useState<"next" | "prev">("next");

  // Basic info / Labor Info
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [profilePhotoName, setProfilePhotoName] = useState<string | null>(null);

  // Service info / Project Info
  const [selectedServices, setSelectedServices] = useState<string[]>([
    "Carpentry",
    "Construction",
  ]);
  const [customService, setCustomService] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [dailyRate, setDailyRate] = useState("1000");
  const [experienceRange, setExperienceRange] = useState("3-5 Years");
  const [workingSince, setWorkingSince] = useState("2014");
  const [workingAreas, setWorkingAreas] = useState("Ernakulam, Marine Drive");
  const [serviceRadius, setServiceRadius] = useState("25 km");

  // Bank Details
  const [accountHolderName, setAccountHolderName] = useState("");
  const [bankName, setBankName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");

  // Documents
  const [govIdType, setGovIdType] = useState("Aadhaar Card");
  const [documentFileName, setDocumentFileName] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setPage(1);
    setName("");
    setPhone("");
    setAddress("");
    setLocation("");
    setError(null);
    onClose();
  };

  const handleToggleService = (srv: string) => {
    setSelectedServices((prev) =>
      prev.includes(srv) ? prev.filter((s) => s !== srv) : [...prev, srv]
    );
  };

  const handleWageDecrement = () => {
    const current = parseInt(dailyRate, 10) || 1000;
    if (current > 100) {
      setDailyRate(String(current - 100));
    }
  };

  const handleWageIncrement = () => {
    const current = parseInt(dailyRate, 10) || 1000;
    setDailyRate(String(current + 100));
  };

  const handleNextPage = (e?: React.MouseEvent | React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (page === 1) {
      if (!name.trim()) {
        setError("Please enter the laborer's full name");
        return;
      }
      setError(null);
      setSlideDirection("next");
      setPage(2);
    } else if (page === 2) {
      setError(null);
      setSlideDirection("next");
      setPage(3);
    }
  };

  const handlePrevPage = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setError(null);
    setSlideDirection("prev");
    if (page === 3) {
      setPage(2);
    } else if (page === 2) {
      setPage(1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (page === 1 || page === 2) {
      handleNextPage(e);
      return;
    }
    if (!name.trim()) {
      setError("Please enter the laborer's full name");
      setPage(1);
      return;
    }

    const randomId = `KH-W-${Math.floor(1000 + Math.random() * 9000)}`;
    const primaryTrade: WorkerTrade =
      (selectedServices[0] as WorkerTrade) || "Mason";
    const parsedExp = parseInt(experienceRange.split("-")[0], 10) || 5;

    const newWorker: WorkerProfile = {
      id: randomId,
      name: name.trim(),
      trade: primaryTrade,
      experienceYears: parsedExp,
      availability: "Available",
      currentAssignment: null,
      verificationStatus: "Verified",
      phone: phone.trim() ? `+91 ${phone.trim()}` : "+91 98470 10202",
      location: location.trim() || "Kochi, Kerala",
      skills: selectedServices.length > 0 ? selectedServices : [primaryTrade],
      verificationDetails: {
        identityVerified: true,
        phoneVerified: true,
        tradeCertified: true,
        kycDocumentType: govIdType || "Aadhaar Card",
        verifiedAt: new Date().toISOString().split("T")[0],
      },
      recentWork: [],
      dailyRate: parseInt(dailyRate, 10) || 1000,
    };

    onAddWorker(newWorker);
    handleClose();
  };

  return (
    <div
      className={styles.modalBackdrop}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Basic info"
    >
      <div className={styles.singleCardModalRefined} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className={styles.modalTopHeaderClean}>
          <h3 id="add-worker-title" className={styles.modalTitleTextClean}>
            Add Laborer
          </h3>
          <button
            type="button"
            className={styles.drawerCloseBtnClean}
            onClick={handleClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className={styles.modalFormContentClean}>
          {error && (
            <div className={styles.errorMessageBlock}>
              {error}
            </div>
          )}

          <div
            key={page}
            className={`${styles.pageSwapBlock} ${
              slideDirection === "next" ? styles.pageSlideInRight : styles.pageSlideInLeft
            }`}
          >
            {page === 1 && (
              /* SECTION 1: Basic info */
              <div className={styles.formSectionContainer}>
                <h4 className={styles.sectionHeadingClean}>Basic info</h4>

                <div className={styles.formGridTwoCol}>
                  {/* Profile Photo (REFINED CIRCULAR AVATAR DROPZONE) */}
                  <div className={styles.formGroupFullWidth}>
                    <label className={styles.formLabelClean}>Profile Photo</label>
                    <label className={styles.profileUploadContainerClean}>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setProfilePhotoName(e.target.files[0].name);
                          }
                        }}
                      />
                      <div className={styles.profileAvatarCircle}>
                        <Camera size={22} />
                      </div>
                      <div className={styles.profileUploadMeta}>
                        <span className={styles.profileUploadTitle}>
                          {profilePhotoName ? profilePhotoName : "Upload Profile Photo"}
                        </span>
                        <span className={styles.profileUploadSubtitle}>
                          PNG, JPG or WEBP (Max 5MB)
                        </span>
                      </div>
                      <span className={styles.profileChooseBtn}>
                        Choose File
                      </span>
                    </label>
                  </div>

                  {/* Full Name */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabelClean}>Full Name *</label>
                    <input
                      type="text"
                      className={styles.formInputClean}
                      placeholder="Yashna Dev"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setError(null);
                      }}
                    />
                  </div>

                  {/* Contact Number */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabelClean}>Contact Number *</label>
                    <div className={styles.phoneInputGroupClean}>
                      <div className={styles.phonePrefixClean}>+91</div>
                      <input
                        type="tel"
                        className={styles.formInputClean}
                        placeholder="Enter phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* City / Location (FULL WIDTH, NO ADD BUTTON) */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabelClean}>City / Location *</label>
                    <input
                      type="text"
                      className={styles.formInputClean}
                      placeholder="Enter location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>

                  {/* Address / Description */}
                  <div className={styles.formGroupFullWidth}>
                    <label className={styles.formLabelClean}>Address / Description *</label>
                    <textarea
                      rows={2}
                      className={styles.formTextareaClean}
                      placeholder="Enter description"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {page === 2 && (
              /* SECTION 2: Service info */
              <div className={styles.formSectionContainer}>
                <h4 className={styles.sectionHeadingClean}>Service info</h4>

                <div className={styles.formGridTwoCol}>
                  {/* Primary Trade / Service (REFINED PILL CHIPS) */}
                  <div className={styles.formGroupFullWidth}>
                    <label className={styles.formLabelClean}>Primary Trade / Services *</label>
                    <div className={styles.tradePillWrapClean}>
                      {DEFAULT_SERVICES.slice(0, 6).map((srv) => {
                        const isSelected = selectedServices.includes(srv);
                        return (
                          <button
                            key={srv}
                            type="button"
                            className={`${styles.tradePillClean} ${
                              isSelected ? styles.tradePillCleanActive : ""
                            }`}
                            onClick={() => handleToggleService(srv)}
                          >
                            {isSelected ? (
                              <span className={styles.tradePillCheckIconActive}>
                                <Check size={11} />
                              </span>
                            ) : (
                              <span className={styles.tradePillCheckIconMuted} />
                            )}
                            <span>{srv}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Service Radius (ROW 2 - LEFT) */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabelClean}>Service Radius *</label>
                    <select
                      className={styles.formSelectClean}
                      value={serviceRadius}
                      onChange={(e) => setServiceRadius(e.target.value)}
                    >
                      <option value="5 km">5 km</option>
                      <option value="10 km">10 km</option>
                      <option value="15 km">15 km</option>
                      <option value="25 km">25 km</option>
                      <option value="50 km">50 km</option>
                      <option value="100+ km">100+ km</option>
                    </select>
                  </div>

                  {/* Wage / Daily Rate Currency Input (ROW 2 - RIGHT: DIRECT MANUAL ENTRY) */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabelClean}>Daily Wage (₹) *</label>
                    <div className={styles.wageInputGroupClean}>
                      <div className={styles.wagePrefixClean}>₹</div>
                      <input
                        type="number"
                        className={styles.formInputClean}
                        placeholder="e.g. 1000"
                        value={dailyRate}
                        onChange={(e) => setDailyRate(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Experience Range */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabelClean}>Experience *</label>
                    <select
                      className={styles.formSelectClean}
                      value={experienceRange}
                      onChange={(e) => setExperienceRange(e.target.value)}
                    >
                      {EXPERIENCE_OPTIONS.map((exp) => (
                        <option key={exp} value={exp}>
                          {exp}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Working Since */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabelClean}>Working Since *</label>
                    <div className={styles.inputWithIcon}>
                      <input
                        type="text"
                        className={styles.formInputClean}
                        placeholder="2014"
                        value={workingSince}
                        onChange={(e) => setWorkingSince(e.target.value)}
                      />
                      <Calendar size={16} className={styles.fieldRightIcon} />
                    </div>
                  </div>

                  {/* Working Areas (FULL WIDTH, CLEAN TEXT FIELD) */}
                  <div className={styles.formGroupFullWidth}>
                    <label className={styles.formLabelClean}>Working Areas *</label>
                    <input
                      type="text"
                      className={styles.formInputClean}
                      placeholder="e.g. Ernakulam, Marine Drive"
                      value={workingAreas}
                      onChange={(e) => setWorkingAreas(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {page === 3 && (
              <>
                {/* SECTION 3: Bank Details */}
                <div className={styles.formSectionContainer}>
                  <h4 className={styles.sectionHeadingClean}>Bank Details</h4>

                  <div className={styles.formGridTwoCol}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabelClean}>Account Holder Name *</label>
                      <input
                        type="text"
                        className={styles.formInputClean}
                        placeholder="Enter account holder name"
                        value={accountHolderName}
                        onChange={(e) => setAccountHolderName(e.target.value)}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabelClean}>Bank Name *</label>
                      <input
                        type="text"
                        className={styles.formInputClean}
                        placeholder="HDFC Bank"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabelClean}>Branch Name *</label>
                      <input
                        type="text"
                        className={styles.formInputClean}
                        placeholder="Ernakulam Branch"
                        value={branchName}
                        onChange={(e) => setBranchName(e.target.value)}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabelClean}>Account Number *</label>
                      <input
                        type="text"
                        className={styles.formInputClean}
                        placeholder="43534456547567656"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                      />
                    </div>

                    <div className={styles.formGroupFullWidth}>
                      <label className={styles.formLabelClean}>IFSC Code *</label>
                      <input
                        type="text"
                        className={styles.formInputClean}
                        placeholder="HDFC0001234"
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 4: Documents */}
                <div className={styles.formSectionContainer}>
                  <h4 className={styles.sectionHeadingClean}>Documents</h4>

                  <div className={styles.formGridTwoCol}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabelClean}>Government ID Type *</label>
                      <select
                        className={styles.formSelectClean}
                        value={govIdType}
                        onChange={(e) => setGovIdType(e.target.value)}
                      >
                        <option value="Aadhaar Card">Aadhaar Card</option>
                        <option value="PAN Card">PAN Card</option>
                        <option value="Voter ID">Voter ID</option>
                        <option value="Driving License">Driving License</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabelClean}>Upload Government ID *</label>
                      <label className={styles.uploadBoxClean}>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              setDocumentFileName(e.target.files[0].name);
                            }
                          }}
                        />
                        <Upload size={18} style={{ color: "#64748b" }} />
                        <span style={{ fontSize: "12.5px", fontWeight: 500, color: "#0f172a" }}>
                          {documentFileName ? documentFileName : "Upload Document"}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Modal Bottom Footer Actions */}
          <div className={styles.modalFooterActionsClean}>
            {page === 1 && (
              <button
                type="button"
                className={styles.submitBtnCleanPill}
                onClick={handleNextPage}
              >
                Next
              </button>
            )}
            {page === 2 && (
              <>
                <button
                  type="button"
                  className={styles.cancelBtnCleanPill}
                  onClick={handlePrevPage}
                >
                  Back
                </button>
                <button
                  type="button"
                  className={styles.submitBtnCleanPill}
                  onClick={handleNextPage}
                >
                  Next
                </button>
              </>
            )}
            {page === 3 && (
              <>
                <button
                  type="button"
                  className={styles.cancelBtnCleanPill}
                  onClick={handlePrevPage}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className={styles.submitBtnCleanPill}
                >
                  Add Laborer
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

