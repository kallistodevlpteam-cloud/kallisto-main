"use client";

import { Paperclip, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import {
  CreateFinanceTransactionInput,
  FinanceInvoice,
  FinanceTransactionType,
  PaymentMilestone,
} from "../types/project-finance.types";
import { parseRupeesToPaise } from "../utils/format-inr";
import styles from "./project-finance-workspace.module.css";

interface AddTransactionDrawerProps {
  saving: boolean;
  milestones: PaymentMilestone[];
  invoices: FinanceInvoice[];
  onClose: () => void;
  onSubmit: (input: CreateFinanceTransactionInput) => Promise<void>;
}

interface FormState {
  type: FinanceTransactionType;
  date: string;
  amount: string;
  counterparty: string;
  category: string;
  paymentMethod: string;
  reference: string;
  milestoneId: string;
  invoiceId: string;
  description: string;
}

type FormErrors = Partial<Record<keyof FormState | "form", string>>;

const INITIAL_FORM: FormState = {
  type: "client_receipt",
  date: "",
  amount: "",
  counterparty: "",
  category: "Client collections",
  paymentMethod: "Bank transfer",
  reference: "",
  milestoneId: "",
  invoiceId: "",
  description: "",
};

const CATEGORIES = [
  "Client collections",
  "Design and consultancy",
  "Materials",
  "Labour",
  "Subcontractors",
  "Logistics",
  "Other expenses",
];

export function AddTransactionDrawer({
  saving,
  milestones,
  invoices,
  onClose,
  onSubmit,
}: AddTransactionDrawerProps) {
  const [form, setForm] = useState<FormState>(() => ({
    ...INITIAL_FORM,
    date: new Date().toISOString().slice(0, 10),
  }));
  const [errors, setErrors] = useState<FormErrors>({});
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose, saving]);

  function updateField<Key extends keyof FormState>(
    field: Key,
    value: FormState[Key]
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  }

  function validate(): {
    errors: FormErrors;
    amount: number | null;
  } {
    const nextErrors: FormErrors = {};
    const amount = parseRupeesToPaise(form.amount);

    if (!form.date) {
      nextErrors.date = "Select a transaction date.";
    }

    if (amount === null || amount <= 0) {
      nextErrors.amount = "Enter an amount greater than zero.";
    }

    if (
      (form.type === "expense" || form.type === "commitment") &&
      !form.counterparty.trim()
    ) {
      nextErrors.counterparty =
        "Counterparty is required for expenses and commitments.";
    }

    if (!form.category) {
      nextErrors.category = "Select a project category.";
    }

    return { errors: nextErrors, amount };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) {
      return;
    }

    const validation = validate();
    if (
      Object.values(validation.errors).some(Boolean) ||
      validation.amount === null
    ) {
      setErrors(validation.errors);
      return;
    }

    try {
      await onSubmit({
        idempotencyKey,
        type: form.type,
        date: form.date,
        amount: validation.amount,
        counterparty: form.counterparty,
        category: form.category,
        paymentMethod: form.paymentMethod,
        reference: form.reference,
        milestoneId: form.milestoneId,
        invoiceId: form.invoiceId,
        description: form.description,
        evidenceFile: evidenceFile
          ? {
              name: evidenceFile.name,
              mimeType: evidenceFile.type,
            }
          : undefined,
      });
    } catch (caughtError) {
      setErrors({
        form:
          caughtError instanceof Error
            ? caughtError.message
            : "The transaction could not be saved.",
      });
    }
  }

  const counterpartyRequired =
    form.type === "expense" || form.type === "commitment";

  return (
    <div
      className={styles.drawerOverlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <aside
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-transaction-title"
      >
        <div className={styles.drawerHeader}>
          <div>
            <p>Project finance</p>
            <h2 id="add-transaction-title">Add transaction</h2>
          </div>
          <button
            type="button"
            className={styles.iconButton}
            aria-label="Close add transaction drawer"
            disabled={saving}
            onClick={onClose}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form className={styles.drawerForm} onSubmit={handleSubmit} noValidate>
          {errors.form && (
            <div className={styles.formErrorBanner} role="alert">
              {errors.form}
            </div>
          )}

          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label htmlFor="finance-transaction-type">Transaction type</label>
              <select
                id="finance-transaction-type"
                value={form.type}
                onChange={(event) => {
                  const type = event.target.value as FinanceTransactionType;
                  updateField("type", type);
                  if (type === "client_receipt") {
                    updateField("category", "Client collections");
                  }
                }}
              >
                <option value="client_receipt">Client receipt</option>
                <option value="expense">Expense</option>
                <option value="commitment">Commitment</option>
                <option value="refund">Refund</option>
                <option value="adjustment">Adjustment</option>
              </select>
            </div>
            <div className={styles.formField}>
              <label htmlFor="finance-transaction-date">Date</label>
              <input
                id="finance-transaction-date"
                type="date"
                required
                aria-invalid={Boolean(errors.date)}
                aria-describedby={errors.date ? "finance-date-error" : undefined}
                value={form.date}
                onChange={(event) => updateField("date", event.target.value)}
              />
              {errors.date && (
                <span id="finance-date-error" className={styles.fieldError}>
                  {errors.date}
                </span>
              )}
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label htmlFor="finance-transaction-amount">Amount (INR)</label>
              <input
                id="finance-transaction-amount"
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                required
                aria-invalid={Boolean(errors.amount)}
                aria-describedby={errors.amount ? "finance-amount-error" : undefined}
                value={form.amount}
                onChange={(event) => updateField("amount", event.target.value)}
              />
              {errors.amount && (
                <span id="finance-amount-error" className={styles.fieldError}>
                  {errors.amount}
                </span>
              )}
            </div>
            <div className={styles.formField}>
              <label htmlFor="finance-counterparty">
                Counterparty{counterpartyRequired ? " *" : ""}
              </label>
              <input
                id="finance-counterparty"
                type="text"
                placeholder={
                  form.type === "client_receipt"
                    ? "Client or payer"
                    : "Vendor or payee"
                }
                required={counterpartyRequired}
                aria-invalid={Boolean(errors.counterparty)}
                aria-describedby={
                  errors.counterparty ? "finance-counterparty-error" : undefined
                }
                value={form.counterparty}
                onChange={(event) =>
                  updateField("counterparty", event.target.value)
                }
              />
              {errors.counterparty && (
                <span id="finance-counterparty-error" className={styles.fieldError}>
                  {errors.counterparty}
                </span>
              )}
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label htmlFor="finance-category">Project category</label>
              <select
                id="finance-category"
                value={form.category}
                aria-invalid={Boolean(errors.category)}
                onChange={(event) => updateField("category", event.target.value)}
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <span className={styles.fieldError}>{errors.category}</span>
              )}
            </div>
            <div className={styles.formField}>
              <label htmlFor="finance-payment-method">Payment method</label>
              <select
                id="finance-payment-method"
                value={form.paymentMethod}
                onChange={(event) =>
                  updateField("paymentMethod", event.target.value)
                }
              >
                <option>Bank transfer</option>
                <option>UPI</option>
                <option>Cheque</option>
                <option>Cash</option>
                <option>Purchase order</option>
                <option>Work order</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div className={styles.formField}>
            <label htmlFor="finance-reference">Reference number</label>
            <input
              id="finance-reference"
              type="text"
              placeholder="Invoice, UTR, PO or voucher number"
              value={form.reference}
              onChange={(event) => updateField("reference", event.target.value)}
            />
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label htmlFor="finance-milestone">Related milestone</label>
              <select
                id="finance-milestone"
                value={form.milestoneId}
                onChange={(event) =>
                  updateField("milestoneId", event.target.value)
                }
              >
                <option value="">No milestone</option>
                {milestones.map((milestone) => (
                  <option key={milestone.id} value={milestone.id}>
                    {milestone.title}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formField}>
              <label htmlFor="finance-invoice">Related invoice</label>
              <select
                id="finance-invoice"
                value={form.invoiceId}
                onChange={(event) => updateField("invoiceId", event.target.value)}
              >
                <option value="">No invoice</option>
                {invoices.map((invoice) => (
                  <option key={invoice.id} value={invoice.id}>
                    {invoice.invoiceNumber}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formField}>
            <label htmlFor="finance-description">Description</label>
            <textarea
              id="finance-description"
              rows={3}
              placeholder="Add a clear audit description"
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
            />
          </div>

          <div className={styles.formField}>
            <label htmlFor="finance-evidence">Evidence attachment</label>
            <label className={styles.fileControl} htmlFor="finance-evidence">
              <Paperclip size={15} aria-hidden="true" />
              <span>{evidenceFile?.name ?? "Attach receipt, invoice or evidence"}</span>
            </label>
            <input
              id="finance-evidence"
              className={styles.hiddenFileInput}
              type="file"
              accept="image/*,.pdf,.csv,.xlsx,.xls"
              onChange={(event) => setEvidenceFile(event.target.files?.[0] ?? null)}
            />
            <span className={styles.fieldHint}>Optional during initial entry</span>
          </div>

          <div className={styles.drawerFooter}>
            <button
              type="button"
              className={styles.secondaryButton}
              disabled={saving}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={saving}
            >
              {saving ? "Saving transaction…" : "Save transaction"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
