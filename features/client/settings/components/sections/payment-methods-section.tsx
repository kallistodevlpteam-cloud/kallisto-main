"use client";

import React, { useState } from "react";
import { CreditCard, QrCode, Building, Plus, Check, Trash2 } from "lucide-react";
import type { ClientPaymentMethod } from "../../types/client-settings.types";
import styles from "../../styles/client-settings.module.css";

const INITIAL_METHODS: ClientPaymentMethod[] = [
  {
    id: "pm-1",
    type: "upi",
    label: "UPI Virtual Payment Address",
    details: "ananya.sharma@okhdfcbank",
    isDefault: true,
  },
  {
    id: "pm-2",
    type: "card",
    label: "HDFC Regalia Visa Platinum",
    details: "•••• •••• •••• 4821",
    expiryDate: "08/28",
    brand: "Visa",
    isDefault: false,
  },
  {
    id: "pm-3",
    type: "bank_account",
    label: "Axis Bank Savings",
    details: "Account ending in •••• 2190",
    isDefault: false,
  },
];

export function PaymentMethodsSection() {
  const [methods, setMethods] = useState<ClientPaymentMethod[]>(INITIAL_METHODS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [newType, setNewType] = useState<ClientPaymentMethod["type"]>("upi");
  const [newDetails, setNewDetails] = useState("");
  const [newLabel, setNewLabel] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const setDefault = (id: string) => {
    setMethods(methods.map((m) => ({ ...m, isDefault: m.id === id })));
    showToast("Default payment method updated");
  };

  const removeMethod = (id: string) => {
    setMethods(methods.filter((m) => m.id !== id));
    showToast("Payment method removed");
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPm: ClientPaymentMethod = {
      id: `pm-${Date.now()}`,
      type: newType,
      label: newLabel || (newType === "upi" ? "UPI ID" : newType === "card" ? "Credit/Debit Card" : "Bank Account"),
      details: newDetails,
      isDefault: methods.length === 0,
    };
    setMethods([...methods, newPm]);
    setShowAddModal(false);
    setNewDetails("");
    setNewLabel("");
    showToast("New payment method added");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardHeaderTitle}>Payment Methods</h2>
            <p className={styles.cardHeaderSubtitle}>
              Manage your linked UPI handles, corporate cards, and bank accounts for milestone escrow releases.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {toastMessage && (
              <div className={styles.toastSaved}>
                <Check size={14} />
                <span>{toastMessage}</span>
              </div>
            )}
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={14} />
              <span>Add Payment Method</span>
            </button>
          </div>
        </div>

        <div className={styles.cardBody}>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {methods.map((method) => (
              <div
                key={method.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px",
                  border: "1px solid var(--line, #e2e8f0)",
                  borderRadius: "10px",
                  background: method.isDefault ? "#f8fafc" : "#ffffff",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "8px",
                      background: "#f1f5f9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#0f172a",
                    }}
                  >
                    {method.type === "upi" ? (
                      <QrCode size={20} />
                    ) : method.type === "card" ? (
                      <CreditCard size={20} />
                    ) : (
                      <Building size={20} />
                    )}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontWeight: 600, fontSize: "14px" }}>{method.label}</span>
                      {method.isDefault && (
                        <span className={`${styles.badge} ${styles.badgeActive}`}>Default</span>
                      )}
                    </div>
                    <div style={{ fontSize: "12.5px", color: "#64748b", marginTop: "2px" }}>
                      {method.details} {method.expiryDate && `· Exp ${method.expiryDate}`}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {!method.isDefault && (
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      style={{ fontSize: "12px", padding: "4px 10px" }}
                      onClick={() => setDefault(method.id)}
                    >
                      Set as Default
                    </button>
                  )}
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    style={{ fontSize: "12px", padding: "6px", color: "#ef4444" }}
                    onClick={() => removeMethod(method.id)}
                    aria-label="Remove payment method"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showAddModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "16px",
          }}
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleAddSubmit}
            className={styles.card}
            style={{ width: "100%", maxWidth: "440px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)" }}
          >
            <div className={styles.cardHeader}>
              <h3 className={styles.cardHeaderTitle}>Add Payment Method</h3>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="pmType">Payment Type</label>
                <select
                  id="pmType"
                  className={styles.select}
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as ClientPaymentMethod["type"])}
                >
                  <option value="upi">UPI (GPay / PhonePe / Paytm / BHIM)</option>
                  <option value="card">Credit or Debit Card</option>
                  <option value="bank_account">Bank Account / NetBanking</option>
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="pmLabel">Label / Card Name</label>
                <input
                  id="pmLabel"
                  type="text"
                  className={styles.input}
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. HDFC Personal UPI / ICICI Corporate"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="pmDetails">
                  {newType === "upi"
                    ? "VPA / UPI ID"
                    : newType === "card"
                    ? "Card Number (16 Digits)"
                    : "Account Number & IFSC"}
                </label>
                <input
                  id="pmDetails"
                  type="text"
                  className={styles.input}
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value)}
                  placeholder={
                    newType === "upi"
                      ? "yourname@okhdfcbank"
                      : newType === "card"
                      ? "4111 •••• •••• 1234"
                      : "Account No + IFSC"
                  }
                  required
                />
              </div>
            </div>
            <div className={styles.cardFooter}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className={styles.btnPrimary}>
                Save Payment Method
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
