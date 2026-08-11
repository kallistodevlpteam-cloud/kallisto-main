function formatRupeeAmount(amount: number): string {
  if (amount >= 10_000_000) {
    const cr = amount / 10_000_000;
    return `${cr}Cr`;
  } else {
    const l = amount / 100_000;
    return `${l}L`;
  }
}

export function formatEnquiryBudgetRange(min: number, max: number): string {
  return `₹${formatRupeeAmount(min)}–${formatRupeeAmount(max)}`;
}

export function formatEnquiryBudgetValue(amount: number): string {
  return `₹${formatRupeeAmount(amount)}`;
}
