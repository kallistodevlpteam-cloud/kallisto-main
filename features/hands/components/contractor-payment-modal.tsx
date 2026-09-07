"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  QrCode,
  ShieldCheck,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { RupeeIcon } from "@/components/layout/sidebar-icons";
import type { ContractorPaymentRecord, PaymentMethod } from "../types/hands.types";
import styles from "./hands-overview.module.css";

interface ContractorPaymentModalProps {
  contractorName: string;
  assignedWorkersCount: number;
  totalWorkersRequested?: number;
  projectName?: string;
  location?: string;
  dailyRate?: number;
  durationDays?: number;
  tradesBreakdown?: { trade: string; quantity: number; dailyRate?: number }[];
  onClose: () => void;
  onPaymentSuccess?: (record: ContractorPaymentRecord) => void;
}

export function ContractorPaymentModal({
  contractorName,
  assignedWorkersCount,
  totalWorkersRequested = 10,
  projectName = "Nila Residence",
  location = "Thiruvananthapuram, Kerala",
  dailyRate = 8600,
  durationDays = 1,
  tradesBreakdown = [
    { trade: "Masons", quantity: 2, dailyRate: 950 },
    { trade: "Electricians", quantity: 1, dailyRate: 1100 },
    { trade: "Helpers", quantity: 4, dailyRate: 650 },
  ],
  onClose,
  onPaymentSuccess,
}: ContractorPaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer");
  const [referenceNo, setReferenceNo] = useState<string>("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedRecord, setSubmittedRecord] = useState<ContractorPaymentRecord | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Default Bank & UPI credentials for verified contractor
  const bankInfo = {
    bankName: "HDFC Bank Ltd.",
    accountNumber: "50100492817264",
    ifscCode: "HDFC0000240",
    beneficiaryName: `${contractorName} Pvt Ltd`,
    branch: "MG Road Branch, Thiruvananthapuram",
  };

  const upiInfo = {
    upiId: `${contractorName.toLowerCase().replace(/[^a-z0-9]/g, "")}@okaxis`,
    payeeName: contractorName,
  };

  // Base daily sum calculated from breakdown or total daily rate
  const baseDailyTotal = tradesBreakdown.reduce(
    (sum, t) => sum + (t.dailyRate ?? 850) * t.quantity,
    0,
  );
  const effectiveDailyRate = baseDailyTotal > 0 ? baseDailyTotal : dailyRate;
  const effectiveDurationDays = Math.max(1, durationDays);
  const calculatedTotal = effectiveDailyRate * effectiveDurationDays;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!referenceNo.trim()) {
      setErrorMsg(
        paymentMethod === "bank_transfer"
          ? "Please enter the UTR / Bank Reference Number to confirm payment."
          : "Please enter the UPI Transaction ID / Ref No. to confirm payment.",
      );
      return;
    }

    const record: ContractorPaymentRecord = {
      id: `pay-${Date.now()}`,
      contractorName,
      workerCount: assignedWorkersCount,
      totalAmount: calculatedTotal,
      paymentMethod,
      bankDetails:
        paymentMethod === "bank_transfer"
          ? {
              accountNumber: bankInfo.accountNumber,
              ifscCode: bankInfo.ifscCode,
              bankName: bankInfo.bankName,
              beneficiaryName: bankInfo.beneficiaryName,
              utrReference: referenceNo.trim(),
            }
          : undefined,
      upiDetails:
        paymentMethod === "upi_transfer"
          ? {
              upiId: upiInfo.upiId,
              transactionId: referenceNo.trim(),
            }
          : undefined,
      paidAt: new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      status: "Completed",
    };

    setSubmittedRecord(record);
    setIsSubmitting(false);
    if (onPaymentSuccess) {
      onPaymentSuccess(record);
    }
  };

  return (
    <div
      className={styles.drawerBackdrop}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={styles.paymentModalCard}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contractor-payment-modal-title"
      >
        {/* Modal Header */}
        <div className={styles.paymentModalHeader}>
          <div className={styles.paymentModalHeaderLeft}>
            <div className={styles.paymentModalIconBadge}>
              <RupeeIcon size={20} aria-hidden="true" />
            </div>
            <div>
              <h2 id="contractor-payment-modal-title" className={styles.paymentModalTitle}>
                Contractor Workforce Payment
              </h2>
              <p className={styles.paymentModalSubtitle}>
                Direct payout for assigned crew on {projectName} · {location}
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.drawerCloseBtn}
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {submittedRecord ? (
          /* ── SUCCESS RECEIPT STEP ── */
          <div className={styles.paymentSuccessBody}>
            <div className={styles.paymentSuccessBadge}>
              <CheckCircle2 size={44} className={styles.paymentSuccessIcon} />
              <h3>Payment Submitted & Recorded</h3>
              <p>
                ₹{submittedRecord.totalAmount.toLocaleString("en-IN")} transferred to{" "}
                <strong>{submittedRecord.contractorName}</strong>.
              </p>
            </div>

            <div className={styles.paymentReceiptDetails}>
              <div className={styles.receiptRow}>
                <span>Payment Reference / ID</span>
                <strong>{submittedRecord.id}</strong>
              </div>
              <div className={styles.receiptRow}>
                <span>Payment Method</span>
                <strong style={{ textTransform: "capitalize" }}>
                  {submittedRecord.paymentMethod.replace("_", " ")}
                </strong>
              </div>
              <div className={styles.receiptRow}>
                <span>
                  {submittedRecord.paymentMethod === "bank_transfer"
                    ? "Bank UTR Number"
                    : "UPI Transaction ID"}
                </span>
                <strong>
                  {submittedRecord.bankDetails?.utrReference ||
                    submittedRecord.upiDetails?.transactionId}
                </strong>
              </div>
              <div className={styles.receiptRow}>
                <span>Workforce Covered</span>
                <strong>{submittedRecord.workerCount} assigned workers</strong>
              </div>
              <div className={styles.receiptRow}>
                <span>Timestamp</span>
                <strong>{submittedRecord.paidAt}</strong>
              </div>
              <div className={styles.receiptRow}>
                <span>Status</span>
                <span className={`${styles.statusBadge} ${styles.statusActive}`}>
                  <ShieldCheck size={12} aria-hidden="true" />
                  {submittedRecord.status}
                </span>
              </div>
            </div>

            <div className={styles.paymentSuccessActions}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={onClose}
                style={{ width: "100%", height: "42px" }}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* ── FORM PAYMENT STEP ── */
          <form onSubmit={handleConfirmPayment} className={styles.paymentFormBody}>
            {/* Contractor & Assigned Workers Summary */}
            <div className={styles.paymentContractorSummaryBox}>
              <div className={styles.summaryTopLine}>
                <div className={styles.contractorBadgeRow}>
                  <Building2 size={16} aria-hidden="true" />
                  <strong className={styles.summaryContractorName}>{contractorName}</strong>
                  <span className={styles.verifiedTagPill}>
                    <ShieldCheck size={11} aria-hidden="true" /> Verified Trade Partner
                  </span>
                </div>
                <span className={styles.assignedCountBadge}>
                  <Users size={12} aria-hidden="true" />
                  {assignedWorkersCount} of {totalWorkersRequested} workers assigned
                </span>
              </div>

              {/* Trade Breakdown Items */}
              <div className={styles.paymentBreakdownMiniGrid}>
                {tradesBreakdown.map((tb, i) => (
                  <div key={i} className={styles.paymentBreakdownChip}>
                    <span>{tb.trade}</span>
                    <strong>
                      {tb.quantity} × ₹{(tb.dailyRate ?? 850).toLocaleString("en-IN")}/d
                    </strong>
                  </div>
                ))}
              </div>

              {/* Shift Duration Display & Total Calculated Amount */}
              <div className={styles.paymentAmountCalculatorRow}>
                <div className={styles.shiftInputGroup}>
                  <span>Shift Duration:</span>
                  <span className={styles.shiftValueBadge}>
                    {effectiveDurationDays} {effectiveDurationDays > 1 ? "shifts / days" : "shift / day"}
                  </span>
                </div>

                <div className={styles.calculatedAmountDisplay}>
                  <span className={styles.calculatedAmountLabel}>Total Payout Amount:</span>
                  <strong className={styles.calculatedAmountValue}>
                    ₹{calculatedTotal.toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className={styles.paymentMethodSelectSection}>
              <label className={styles.paymentMethodGroupLabel}>Select Payment Method:</label>
              <div className={styles.paymentMethodTabsRow}>
                <button
                  type="button"
                  className={`${styles.paymentMethodTab} ${
                    paymentMethod === "bank_transfer" ? styles.paymentMethodTabActive : ""
                  }`}
                  onClick={() => {
                    setPaymentMethod("bank_transfer");
                    setErrorMsg(null);
                  }}
                >
                  <Building2 size={16} aria-hidden="true" />
                  <span>Bank Transfer (NEFT/RTGS)</span>
                </button>

                <button
                  type="button"
                  className={`${styles.paymentMethodTab} ${
                    paymentMethod === "upi_transfer" ? styles.paymentMethodTabActive : ""
                  }`}
                  onClick={() => {
                    setPaymentMethod("upi_transfer");
                    setErrorMsg(null);
                  }}
                >
                  <QrCode size={16} aria-hidden="true" />
                  <span>UPI Transfer (GPay/Paytm)</span>
                </button>
              </div>
            </div>

            {/* Method Details Pane */}
            {paymentMethod === "bank_transfer" ? (
              <div className={styles.methodDetailsBox}>
                <div className={styles.methodDetailsHeader}>
                  <Building2 size={16} aria-hidden="true" />
                  <span>Verified Contractor Bank Account Details</span>
                </div>

                <div className={styles.bankFieldsGrid}>
                  <div className={styles.bankFieldItem}>
                    <span className={styles.bankFieldLabel}>Beneficiary Name</span>
                    <strong className={styles.bankFieldValue}>{bankInfo.beneficiaryName}</strong>
                  </div>

                  <div className={styles.bankFieldItem}>
                    <span className={styles.bankFieldLabel}>Bank & Branch</span>
                    <strong className={styles.bankFieldValue}>
                      {bankInfo.bankName} ({bankInfo.branch})
                    </strong>
                  </div>

                  <div className={styles.bankFieldItem}>
                    <span className={styles.bankFieldLabel}>Account Number</span>
                    <div className={styles.copyValueRow}>
                      <strong className={styles.bankFieldValue}>{bankInfo.accountNumber}</strong>
                      <button
                        type="button"
                        className={styles.copyFieldBtn}
                        onClick={() => handleCopy(bankInfo.accountNumber, "account")}
                        title="Copy Account Number"
                      >
                        {copiedField === "account" ? (
                          <Check size={13} style={{ color: "#16a34a" }} />
                        ) : (
                          <Copy size={13} />
                        )}
                        <span>{copiedField === "account" ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>

                  <div className={styles.bankFieldItem}>
                    <span className={styles.bankFieldLabel}>IFSC Code</span>
                    <div className={styles.copyValueRow}>
                      <strong className={styles.bankFieldValue}>{bankInfo.ifscCode}</strong>
                      <button
                        type="button"
                        className={styles.copyFieldBtn}
                        onClick={() => handleCopy(bankInfo.ifscCode, "ifsc")}
                        title="Copy IFSC Code"
                      >
                        {copiedField === "ifsc" ? (
                          <Check size={13} style={{ color: "#16a34a" }} />
                        ) : (
                          <Copy size={13} />
                        )}
                        <span>{copiedField === "ifsc" ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className={styles.referenceInputSection}>
                  <label htmlFor="bank-utr-input" className={styles.inputLabelRequired}>
                    Bank Transfer UTR / Payment Reference Number *
                  </label>
                  <input
                    id="bank-utr-input"
                    type="text"
                    placeholder="e.g. UTR948192019482 or Bank Ref No."
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    className={styles.formTextInput}
                  />
                  <span className={styles.fieldHelpText}>
                    Enter the UTR reference code generated by your netbanking portal after executing the transfer.
                  </span>
                </div>
              </div>
            ) : (
              <div className={styles.methodDetailsBox}>
                <div className={styles.methodDetailsHeader}>
                  <QrCode size={16} aria-hidden="true" />
                  <span>Verified Contractor UPI Transfer</span>
                </div>

                <div className={styles.upiFlexRow}>
                  {/* QR Code Container */}
                  <div className={styles.upiQrWrapper}>
                    <div className={styles.simulatedQrBox}>
                      <QrCode size={90} className={styles.qrSvgIcon} />
                      <span className={styles.qrLabelText}>Scan to Pay ₹{calculatedTotal}</span>
                    </div>
                  </div>

                  {/* UPI Info & Quick Pay */}
                  <div className={styles.upiDetailsCol}>
                    <div className={styles.bankFieldItem}>
                      <span className={styles.bankFieldLabel}>Contractor UPI ID (VPA)</span>
                      <div className={styles.copyValueRow}>
                        <strong className={styles.bankFieldValue}>{upiInfo.upiId}</strong>
                        <button
                          type="button"
                          className={styles.copyFieldBtn}
                          onClick={() => handleCopy(upiInfo.upiId, "upi")}
                        >
                          {copiedField === "upi" ? (
                            <Check size={13} style={{ color: "#16a34a" }} />
                          ) : (
                            <Copy size={13} />
                          )}
                          <span>{copiedField === "upi" ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                    </div>

                    <div className={styles.bankFieldItem}>
                      <span className={styles.bankFieldLabel}>Payee Name</span>
                      <strong className={styles.bankFieldValue}>{upiInfo.payeeName}</strong>
                    </div>

                    <div className={styles.upiAppActionBox}>
                      <a
                        href={`upi://pay?pa=${upiInfo.upiId}&pn=${encodeURIComponent(upiInfo.payeeName)}&am=${calculatedTotal}&cu=INR`}
                        className={styles.upiAppBtn}
                        onClick={(e) => {
                          e.preventDefault();
                          handleCopy(upiInfo.upiId, "upi_link");
                          alert(`UPI ID ${upiInfo.upiId} copied to clipboard! Open your UPI App (Google Pay / PhonePe / Paytm) to complete payment of ₹${calculatedTotal}.`);
                        }}
                      >
                        <Wallet size={14} aria-hidden="true" />
                        <span>Pay via UPI App (GPay/PhonePe)</span>
                      </a>
                    </div>
                  </div>
                </div>

                <div className={styles.referenceInputSection}>
                  <label htmlFor="upi-tx-input" className={styles.inputLabelRequired}>
                    UPI Transaction ID / 12-digit Ref No. *
                  </label>
                  <input
                    id="upi-tx-input"
                    type="text"
                    placeholder="e.g. 329104819201 or UPI Txn Ref"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    className={styles.formTextInput}
                  />
                  <span className={styles.fieldHelpText}>
                    Enter the 12-digit UPI transaction reference ID from your GPay, PhonePe, or Paytm payment receipt.
                  </span>
                </div>
              </div>
            )}

            {errorMsg ? (
              <div className={styles.drawerNotice} role="alert" style={{ margin: "14px 0 0 0" }}>
                <div className={styles.drawerNoticeContent}>
                  <AlertTriangle size={16} className={styles.drawerNoticeIcon} />
                  <div className={styles.drawerNoticeText}>
                    <p style={{ fontSize: "13px", color: "#e11d48", fontWeight: 600 }}>{errorMsg}</p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Modal Actions */}
            <div className={styles.paymentModalFooter}>
              <button type="button" className={styles.secondaryButton} onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={isSubmitting}
                style={{ height: "40px", padding: "0 20px" }}
              >
                {isSubmitting ? (
                  <span>Processing Payment...</span>
                ) : (
                  <>
                    <ShieldCheck size={15} aria-hidden="true" />
                    <span>Confirm & Submit Payment (₹{calculatedTotal.toLocaleString("en-IN")})</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
