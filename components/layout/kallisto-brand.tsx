export function KallistoLogoMark({
  className = "",
  size = 20,
}: {
  className?: string;
  size?: number;
}) {
  const width = Math.round((size * 34) / 24);
  return (
    <svg
      width={width}
      height={size}
      viewBox="0 0 34 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Kallisto"
    >
      {/* lowercase 'k' */}
      <path d="M2.5 2C2.5 1.45 2.95 1 3.5 1H6C6.55 1 7 1.45 7 2V12.2L12.2 7.6C12.6 7.25 13.15 7.05 13.7 7.05H16.5C17.2 7.05 17.6 7.85 17.1 8.35L10.8 13.8L17.4 21.85C17.85 22.4 17.45 23 16.7 23H13.6C13.1 23 12.65 22.75 12.35 22.35L7 15.6V22C7 22.55 6.55 23 6 23H3.5C2.95 23 2.5 22.55 2.5 22V2Z" />
      {/* triangle '▲' */}
      <path d="M19.5 22.2L25.3 8.8C25.65 8 26.85 8 27.2 8.8L33 22.2C33.4 23.1 32.7 24 31.7 24H20.8C19.8 24 19.1 23.1 19.5 22.2Z" />
    </svg>
  );
}

export function KallistoBrand({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <span className="brand-lockup brand-lockup--compact" aria-label="Kallisto" title="Kallisto">
        <KallistoLogoMark size={16} className="brand-logo-mark" />
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

