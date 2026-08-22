export function KallistoLogoMark({
  className = "",
  size = 22,
}: {
  className?: string;
  size?: number;
}) {
  const width = Math.round((size * 413.63) / 288);
  return (
    <svg
      width={width}
      height={size}
      viewBox="769.31 417.34 413.63 288"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Kallisto"
    >
      <rect x="769.31" y="417.34" width="54" height="288" rx="10" ry="10" />
      <path d="M884.05 602.33l50.8 88c3.85 6.67-.96 15-8.66 15h-39.27c-3.57 0-6.87-1.91-8.66-5l-56.58-98c-1.79-3.09-1.79-6.91 0-10l56.58-98c1.79-3.09 5.09-5 8.66-5h39.27c7.7 0 12.51 8.33 8.66 15l-50.8 88c-1.79 3.09-1.79 6.91 0 10Z" />
      <path d="M1064.16 499.84l-108.31 187.63c-4.59 7.94 1.15 17.87 10.32 17.87h216.77c9.17 0 14.91-9.93 10.32-17.87l-108.31-187.63c-4.62-8-16.17-8-20.79 0Z" />
    </svg>
  );
}

export function KallistoBrand({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <span className="brand-lockup brand-lockup--compact" aria-label="Kallisto" title="Kallisto">
        <KallistoLogoMark size={22} className="brand-logo-mark" />
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

