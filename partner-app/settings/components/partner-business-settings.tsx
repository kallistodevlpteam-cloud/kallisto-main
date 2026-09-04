"use client";

import React, { useState } from "react";
import {
  Building2,
  Check,
  Save,
  ShieldCheck,
  Plus,
  Trash2,
  CheckCircle2,
  Landmark,
} from "lucide-react";
import { usePartnerAuth } from "../../auth/context/partner-auth-context";
import { getPartnerConfig } from "../../shared/config/partner-config";
import styles from "../styles/partner-settings.module.css";

export interface PartnerBankAccount {
  id: string;
  bankName: string;
  accountType: string;
  accountNumberMasked: string;
  ifsc: string;
  branch: string;
  isPrimary: boolean;
}

const INITIAL_BANK_ACCOUNTS: PartnerBankAccount[] = [
  {
    id: "ba-1",
    bankName: "HDFC Bank",
    accountType: "Current Account",
    accountNumberMasked: "•••• •••• •••• 7890",
    ifsc: "HDFC0001234",
    branch: "Kalamassery Industrial Estate, Kochi",
    isPrimary: true,
  },
  {
    id: "ba-2",
    bankName: "ICICI Bank",
    accountType: "Corporate Escrow Settlement",
    accountNumberMasked: "•••• •••• •••• 4512",
    ifsc: "ICIC0000451",
    branch: "MG Road Branch, Kochi",
    isPrimary: false,
  },
];

export function PartnerBusinessSettings() {
  const { user, partnerType } = usePartnerAuth();
  const config = getPartnerConfig(partnerType);

  const [bizName, setBizName] = useState(user?.partnerBusinessName || "BuildMart Materials & Supplies Ltd.");
  const [gstin, setGstin] = useState("32AABCK1234F1Z8");
  const [tradeLicense, setTradeLicense] = useState("TL-KC-2026-8891");
  const [pan, setPan] = useState("AABCK1234F");

  // Multi-Bank Accounts State
  const [bankAccounts, setBankAccounts] = useState<PartnerBankAccount[]>(INITIAL_BANK_ACCOUNTS);
  const [showAddForm, setShowAddForm] = useState(false);

  // New Bank Form State
  const [newBankName, setNewBankName] = useState("State Bank of India");
  const [newAccType, setNewAccType] = useState("Current Account");
  const [newAccNumber, setNewAccNumber] = useState("");
  const [newIfsc, setNewIfsc] = useState("");
  const [newBranch, setNewBranch] = useState("");
  const [newSetPrimary, setNewSetPrimary] = useState(false);

  const [isSaved, setIsSaved] = useState(false);
  const [toastMsg, setToastMsg] = useState("Business details saved");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleMakePrimary = (id: string) => {
    setBankAccounts((prev) =>
      prev.map((acc) => ({
        ...acc,
        isPrimary: acc.id === id,
      }))
    );
    showToast("Primary settlement account updated");
  };

  const handleRemoveAccount = (id: string) => {
    if (bankAccounts.length <= 1) return;
    const remaining = bankAccounts.filter((acc) => acc.id !== id);
    // If we removed the primary, designate the first remaining as primary
    if (!remaining.some((acc) => acc.isPrimary) && remaining.length > 0) {
      remaining[0].isPrimary = true;
    }
    setBankAccounts(remaining);
    showToast("Bank account removed");
  };

  const handleAddAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccNumber || !newIfsc) return;

    const last4 = newAccNumber.slice(-4) || "0000";
    const newAccount: PartnerBankAccount = {
      id: `ba-${Date.now()}`,
      bankName: newBankName || "Bank Account",
      accountType: newAccType,
      accountNumberMasked: `•••• •••• •••• ${last4}`,
      ifsc: newIfsc.toUpperCase(),
      branch: newBranch || "Main Branch",
      isPrimary: newSetPrimary || bankAccounts.length === 0,
    };

    if (newAccount.isPrimary) {
      setBankAccounts((prev) => [
        ...prev.map((acc) => ({ ...acc, isPrimary: false })),
        newAccount,
      ]);
    } else {
      setBankAccounts((prev) => [...prev, newAccount]);
    }

    setShowAddForm(false);
    setNewAccNumber("");
    setNewIfsc("");
    setNewBranch("");
    setNewSetPrimary(false);
    showToast("New bank account linked successfully");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Business details saved");
  };

  return (
    <form onSubmit={handleSubmit} className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.cardHeaderTitle}>Business Registration & Legal Entity</h2>
          <p className={styles.cardHeaderSubtitle}>
            Configure your commercial entity verification, GST compliance, and milestone payout bank accounts.
          </p>
        </div>
        {isSaved && (
          <div className={styles.toastSaved}>
            <Check size={14} />
            <span>{toastMsg}</span>
          </div>
        )}
      </div>

      <div className={styles.cardBody}>
        {/* Verification Status */}
        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <span className={styles.settingLabel}>Kallisto Verified Partner Status</span>
            <span className={styles.settingDesc}>
              Tier-1 Certified Supplier badge active across Kochi & Ernakulam regions.
            </span>
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              background: "#f0fdf4",
              color: "#16a34a",
              borderRadius: "9999px",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            <ShieldCheck size={14} />
            <span>Verified Partner</span>
          </div>
        </div>

        {/* Legal Identifiers */}
        <div className={styles.inputGrid}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="bizName">Legal Entity Name</label>
            <input
              id="bizName"
              type="text"
              className={styles.input}
              value={bizName}
              onChange={(e) => setBizName(e.target.value)}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="gstin">GSTIN Registration Number</label>
            <input
              id="gstin"
              type="text"
              className={styles.input}
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
              required
            />
          </div>
        </div>

        <div className={styles.inputGrid}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="tradeLicense">Trade License Reference</label>
            <input
              id="tradeLicense"
              type="text"
              className={styles.input}
              value={tradeLicense}
              onChange={(e) => setTradeLicense(e.target.value)}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="pan">Business PAN</label>
            <input
              id="pan"
              type="text"
              className={styles.input}
              value={pan}
              onChange={(e) => setPan(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Direct Escrow Settlement Accounts (Multi-Bank Manager) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "6px" }}>
          <div className={styles.bankSectionHeader}>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span className={styles.settingLabel}>Direct Escrow Settlement Accounts</span>
              <span className={styles.settingDesc}>
                Verified commercial bank accounts for automatic milestone disbursements and contractor settlements.
              </span>
            </div>
            {!showAddForm && (
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setShowAddForm(true)}
              >
                <Plus size={13} />
                <span>Add Bank Account</span>
              </button>
            )}
          </div>

          {/* Accounts List */}
          <div className={styles.bankCardList}>
            {bankAccounts.map((account) => (
              <div
                key={account.id}
                className={`${styles.bankCard} ${account.isPrimary ? styles.bankCardPrimary : ""}`}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div className={styles.bankIconWrap}>
                    <Landmark size={18} />
                  </div>
                  <div className={styles.bankMeta}>
                    <div className={styles.bankTitleRow}>
                      <span className={styles.bankName}>{account.bankName}</span>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>· {account.accountType}</span>
                      {account.isPrimary && (
                        <span className={styles.badgePrimary}>Primary</span>
                      )}
                    </div>
                    <span className={styles.bankSub}>
                      {account.accountNumberMasked} · IFSC: {account.ifsc} {account.branch && `· ${account.branch}`}
                    </span>
                  </div>
                </div>

                <div className={styles.bankActions}>
                  {!account.isPrimary && (
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      style={{ fontSize: "11.5px", padding: "4px 10px" }}
                      onClick={() => handleMakePrimary(account.id)}
                    >
                      <span>Set as Primary</span>
                    </button>
                  )}
                  {bankAccounts.length > 1 && (
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      style={{
                        padding: "5px 8px",
                        color: "#ef4444",
                        borderColor: "#fecaca",
                      }}
                      title="Remove Account"
                      onClick={() => handleRemoveAccount(account.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Expandable Add Bank Account Form */}
          {showAddForm && (
            <div className={styles.addBankBox}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#0f172a" }}>
                  Link New Escrow Settlement Account
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "12px",
                    color: "#64748b",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>

              <div className={styles.inputGrid}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="newBankName">Bank Name</label>
                  <select
                    id="newBankName"
                    className={styles.select}
                    value={newBankName}
                    onChange={(e) => setNewBankName(e.target.value)}
                  >
                    <option value="State Bank of India">State Bank of India (SBI)</option>
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                    <option value="Federal Bank">Federal Bank</option>
                    <option value="Canara Bank">Canara Bank</option>
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="newAccType">Account Type</label>
                  <select
                    id="newAccType"
                    className={styles.select}
                    value={newAccType}
                    onChange={(e) => setNewAccType(e.target.value)}
                  >
                    <option value="Current Account">Current Account</option>
                    <option value="Corporate Escrow Settlement">Corporate Escrow Settlement</option>
                    <option value="Cash Credit (CC) Account">Cash Credit (CC) Account</option>
                  </select>
                </div>
              </div>

              <div className={styles.inputGrid}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="newAccNumber">Account Number</label>
                  <input
                    id="newAccNumber"
                    type="password"
                    placeholder="Enter full 12-16 digit account number"
                    className={styles.input}
                    value={newAccNumber}
                    onChange={(e) => setNewAccNumber(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="newIfsc">IFSC Code</label>
                  <input
                    id="newIfsc"
                    type="text"
                    placeholder="e.g. SBIN0001234"
                    className={styles.input}
                    value={newIfsc}
                    onChange={(e) => setNewIfsc(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="newBranch">Branch Location</label>
                <input
                  id="newBranch"
                  type="text"
                  placeholder="e.g. Panampilly Nagar Branch, Kochi"
                  className={styles.input}
                  value={newBranch}
                  onChange={(e) => setNewBranch(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                <input
                  id="setPrimaryCheck"
                  type="checkbox"
                  checked={newSetPrimary}
                  onChange={(e) => setNewSetPrimary(e.target.checked)}
                  style={{ width: "16px", height: "16px", accentColor: "#0f172a", cursor: "pointer" }}
                />
                <label htmlFor="setPrimaryCheck" style={{ fontSize: "12.5px", color: "#334155", cursor: "pointer" }}>
                  Set as primary settlement account for all active projects
                </label>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={handleAddAccountSubmit}
                >
                  <Check size={14} />
                  <span>Verify & Link Account</span>
                </button>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: "10px" }}>
          <button type="submit" className={styles.btnPrimary}>
            <Check size={14} />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </form>
  );
}
