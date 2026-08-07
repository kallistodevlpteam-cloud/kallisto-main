const INR_FORMATTER = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const DATE_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function isIntegerPaise(value: number): boolean {
  return Number.isSafeInteger(value);
}

export function rupeesToPaise(rupees: number): number {
  if (!Number.isSafeInteger(rupees)) {
    throw new Error("Rupee seed values must be safe integers.");
  }

  return rupees * 100;
}

export function parseRupeesToPaise(value: string): number | null {
  const normalized = value.trim().replace(/[₹,\s]/g, "");

  if (!normalized) {
    return null;
  }

  const match = normalized.match(/^(\d+)(?:\.(\d{1,2}))?$/);
  if (!match) {
    return null;
  }

  const wholeRupees = BigInt(match[1]);
  const fractionalPaise = BigInt((match[2] ?? "").padEnd(2, "0"));
  const paise = wholeRupees * BigInt(100) + fractionalPaise;

  if (paise > BigInt(Number.MAX_SAFE_INTEGER)) {
    return null;
  }

  return Number(paise);
}

export function formatINR(amountInPaise: number): string {
  if (!isIntegerPaise(amountInPaise)) {
    return "Amount unavailable";
  }

  return INR_FORMATTER.format(amountInPaise / 100);
}

export function formatINRCompact(amountInPaise: number): string {
  if (!isIntegerPaise(amountInPaise)) {
    return "Unavailable";
  }

  const absoluteRupees = Math.abs(amountInPaise) / 100;
  const sign = amountInPaise < 0 ? "−" : "";

  if (absoluteRupees >= 100_000) {
    const lakhs = absoluteRupees / 100_000;
    return `${sign}₹${Number.isInteger(lakhs) ? lakhs : lakhs.toFixed(1)}L`;
  }

  if (absoluteRupees >= 1_000) {
    const thousands = absoluteRupees / 1_000;
    return `${sign}₹${Number.isInteger(thousands) ? thousands : thousands.toFixed(1)}K`;
  }

  return `${sign}₹${absoluteRupees}`;
}

export function formatFinanceDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : DATE_FORMATTER.format(date);
}

export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) {
    return "Unavailable";
  }

  return `${Math.round(value)}%`;
}
