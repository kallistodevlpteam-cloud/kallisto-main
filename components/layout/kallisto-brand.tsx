export function KallistoBrand({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <span className="brand-lockup brand-lockup--compact" aria-label="Kallisto">
        <span className="brand-mark-badge" title="Kallisto">
          <span className="brand-mark-letter">K</span>
        </span>
      </span>
    );
  }

  return (
    <span className="brand-lockup" aria-label="Kallisto">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/kallisto-logo.png"
        alt="Kallisto"
        className="brand-img-logo"
      />
    </span>
  );
}
