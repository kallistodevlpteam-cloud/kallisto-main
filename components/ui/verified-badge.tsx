import React from "react";

interface VerifiedBadgeProps {
  size?: number;
  className?: string;
  title?: string;
  style?: React.CSSProperties;
}

export function VerifiedBadge({
  size = 18,
  className,
  title = "Verified",
  style,
}: VerifiedBadgeProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
      aria-label={title}
      role="img"
    >
      <title>{title}</title>
      {/* 10-point smooth scalloped verified rosette */}
      <path
        d="M 50.00 5.00 C 56.20 5.00, 56.64 12.73, 61.59 14.34 C 66.53 15.94, 71.43 9.95, 76.45 13.59 C 81.47 17.24, 77.28 23.75, 80.34 27.96 C 83.39 32.16, 90.88 30.20, 92.80 36.09 C 94.71 41.99, 87.50 44.80, 87.50 50.00 C 87.50 55.20, 94.71 58.01, 92.80 63.91 C 90.88 69.80, 83.39 67.84, 80.34 72.04 C 77.28 76.25, 81.47 82.76, 76.45 86.41 C 71.43 90.05, 66.53 84.06, 61.59 85.66 C 56.64 87.27, 56.20 95.00, 50.00 95.00 C 43.80 95.00, 43.36 87.27, 38.41 85.66 C 33.47 84.06, 28.57 90.05, 23.55 86.41 C 18.53 82.76, 22.72 76.25, 19.66 72.04 C 16.61 67.84, 9.12 69.80, 7.20 63.91 C 5.29 58.01, 12.50 55.20, 12.50 50.00 C 12.50 44.80, 5.29 41.99, 7.20 36.09 C 9.12 30.20, 16.61 32.16, 19.66 27.96 C 22.72 23.75, 18.53 17.24, 23.55 13.59 C 28.57 9.95, 33.47 15.94, 38.41 14.34 C 43.36 12.73, 43.80 5.00, 50.00 5.00 Z"
        fill="#21a1f3"
      />
      {/* Bold rounded white checkmark */}
      <polyline
        points="41.5,52.2 47.5,58.2 59.2,42.5"
        stroke="#ffffff"
        strokeWidth="7.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
