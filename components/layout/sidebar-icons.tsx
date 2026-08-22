"use client";

import React from "react";

export interface SidebarIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

/**
 * 1. Home — Solid house silhouette with tinted roof overlay
 */
export function HomeDuotoneIcon({ size = 17, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted roof */}
      <path
        d="M12 2.5L2.8 9.8C2.3 10.2 2 10.8 2 11.4V12C2 12.6 2.4 13 3 13H5V20C5 21.1 5.9 22 7 22H17C18.1 22 19 21.1 19 20V13H21C21.6 13 22 12.6 22 12V11.4C22 10.8 21.7 10.2 21.2 9.8L12 2.5Z"
        fill="currentColor"
        opacity="0.38"
      />
      {/* Solid core body & doorway */}
      <path
        d="M6 11V20C6 20.6 6.4 21 7 21H10V15C10 14.4 10.4 14 11 14H13C13.6 14 14 14.4 14 15V21H17C17.6 21 18 20.6 18 20V11L12 6.2L6 11Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * 2. Enquiries (Inbox) — Inbox drawer with tinted incoming envelope
 */
export function EnquiriesDuotoneIcon({ size = 17, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted top envelope / paper incoming */}
      <path
        d="M6 3C4.9 3 4 3.9 4 5V11H20V5C20 3.9 19.1 3 18 3H6Z"
        fill="currentColor"
        opacity="0.38"
      />
      {/* Solid inbox tray */}
      <path
        d="M3 11C2.4 11 2 11.4 2 12V18C2 19.7 3.3 21 5 21H19C20.7 21 22 19.7 22 18V12C22 11.4 21.6 11 21 11H16.5C16 11 15.5 11.4 15.3 11.9L14.4 13.6C14.2 13.9 13.8 14.1 13.4 14.1H10.6C10.2 14.1 9.8 13.9 9.6 13.6L8.7 11.9C8.5 11.4 8 11 7.5 11H3Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * 3. Projects — Folder with tinted kanban cards
 */
export function ProjectsDuotoneIcon({ size = 17, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted back folder flap */}
      <path
        d="M3 5C3 3.9 3.9 3 5 3H9.4C10.2 3 11 3.4 11.5 4L12.8 5.6C13.1 6 13.5 6.2 14 6.2H19C20.1 6.2 21 7.1 21 8.2V11H3V5Z"
        fill="currentColor"
        opacity="0.38"
      />
      {/* Solid front folder & project board */}
      <path
        d="M2 9.5C2 8.7 2.7 8 3.5 8H20.5C21.3 8 22 8.7 22 9.5V18C22 19.7 20.7 21 19 21H5C3.3 21 2 19.7 2 18V9.5ZM8 12C7.4 12 7 12.4 7 13V17C7 17.6 7.4 18 8 18H9C9.6 18 10 17.6 10 17V13C10 12.4 9.6 12 8 12H8ZM13 12C12.4 12 12 12.4 12 13V15C12 15.6 12.4 16 13 16H14C14.6 16 15 15.6 15 15V13C15 12.4 14.6 12 13 12H13Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * 4. Hive Studio (Sparkles) — Solid primary sparkle with tinted satellite sparkle
 */
export function StudioDuotoneIcon({ size = 17, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted secondary sparkle */}
      <path
        d="M19 2C19.3 3.6 20.4 4.7 22 5C20.4 5.3 19.3 6.4 19 8C18.7 6.4 17.6 5.3 16 5C17.6 4.7 18.7 3.6 19 2ZM5.5 17C5.7 18 6.5 18.8 7.5 19C6.5 19.2 5.7 20 5.5 21C5.3 20 4.5 19.2 3.5 19C4.5 18.8 5.3 18 5.5 17Z"
        fill="currentColor"
        opacity="0.45"
      />
      {/* Solid central studio star */}
      <path
        d="M10.5 3C11 7.2 14.3 10.5 18.5 11C14.3 11.5 11 14.8 10.5 19C10 14.8 6.7 11.5 2.5 11C6.7 10.5 10 7.2 10.5 3Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * 5. Calendar — Solid calendar pad with tinted binder header
 */
export function CalendarDuotoneIcon({ size = 17, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted top binder header */}
      <path
        d="M5 4C3.9 4 3 4.9 3 6V9H21V6C21 4.9 20.1 4 19 4H17V3C17 2.4 16.6 2 16 2C15.4 2 15 2.4 15 3V4H9V3C9 2.4 8.6 2 8 2C7.4 2 7 2.4 7 3V4H5Z"
        fill="currentColor"
        opacity="0.38"
      />
      {/* Solid calendar body & date grid */}
      <path
        d="M3 9V19C3 20.7 4.3 22 6 22H18C19.7 22 21 20.7 21 19V9H3ZM8 12C8.6 12 9 12.4 9 13C9 13.6 8.6 14 8 14C7.4 14 7 13.6 7 13C7 12.4 7.4 12 8 12ZM12 12C12.6 12 13 12.4 13 13C13 13.6 12.6 14 12 14C11.4 14 11 13.6 11 13C11 12.4 11.4 12 12 12ZM16 12C16.6 12 17 12.4 17 13C17 13.6 16.6 14 16 14C15.4 14 15 13.6 15 13C15 12.4 15.4 12 16 12ZM8 16C8.6 16 9 16.4 9 17C9 17.6 8.6 18 8 18C7.4 18 7 17.6 7 17C7 16.4 7.4 16 8 16ZM12 16C12.6 16 13 16.4 13 17C13 17.6 12.6 18 12 18C11.4 18 11 17.6 11 17C11 16.4 11.4 16 12 16ZM16 16C16.6 16 17 16.4 17 17C17 17.6 16.6 18 16 18C15.4 18 15 17.6 15 17C15 16.4 15.4 16 16 16Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * 6. Team (Users) — Exactly matching reference duotone avatar concept
 */
export function TeamDuotoneIcon({ size = 17, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted background user companion */}
      <circle cx="16" cy="7" r="3.5" fill="currentColor" opacity="0.38" />
      <path
        d="M16 12C18.2 12 21.5 13.1 21.9 15.4C22 15.7 22 16.1 22 16.5V18C22 18.6 21.6 19 21 19H15.5C15.8 18.1 16 17.1 16 16C16 14.4 15.2 13 14 12.2C14.6 12.1 15.3 12 16 12Z"
        fill="currentColor"
        opacity="0.38"
      />
      {/* Solid foreground user */}
      <circle cx="9" cy="8" r="4" fill="currentColor" />
      <path
        d="M9 13.5C5.7 13.5 2 15.2 2 18.5V19.5C2 20.3 2.7 21 3.5 21H14.5C15.3 21 16 20.3 16 19.5V18.5C16 15.2 12.3 13.5 9 13.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Documents — Dual-tone document sheet with tinted corner fold and lines
 */
export function DocumentsDuotoneIcon({ size = 17, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted sheet base */}
      <path
        d="M6 2C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2H6Z"
        fill="currentColor"
        opacity="0.38"
      />
      {/* Solid folded corner and document lines */}
      <path
        d="M14 2V7C14 7.6 14.4 8 15 8H20L14 2ZM7 11.5C7 11 7.4 10.5 8 10.5H16C16.6 10.5 17 11 17 11.5C17 12 16.6 12.5 16 12.5H8C7.4 12.5 7 12 7 11.5ZM7 15C7 14.4 7.4 14 8 14H16C16.6 14 17 14.4 17 15C17 15.6 16.6 16 16 16H8C7.4 16 7 15.6 7 15ZM7 18.5C7 18 7.4 17.5 8 17.5H13C13.6 17.5 14 18 14 18.5C14 19 13.6 19.5 13 19.5H8C7.4 19.5 7 19 7 18.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Spreadsheet (XLSX/BOQ/Sheets) — Duotone table grid sheet with tinted header & solid cell lines
 */
export function SpreadsheetDuotoneIcon({ size = 16, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted table header & sheet base */}
      <rect x="3" y="3" width="18" height="18" rx="4" fill="currentColor" opacity="0.38" />
      {/* Solid table grid lines & borders */}
      <path
        d="M3 8.5H21M3 14H21M9 8.5V21M15 8.5V21M3 7C3 4.8 4.8 3 7 3H17C19.2 3 21 4.8 21 7V17C21 19.2 19.2 21 17 21H7C4.8 21 3 19.2 3 17V7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * 7. Payments — Credit card with tinted magnetic stripe & chip
 */
export function PaymentsDuotoneIcon({ size = 17, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted magnetic stripe header */}
      <path
        d="M5 4C3.3 4 2 5.3 2 7V8.5H22V7C22 5.3 20.7 4 19 4H5Z"
        fill="currentColor"
        opacity="0.38"
      />
      {/* Solid card base & security chip */}
      <path
        d="M2 11.5V17C2 18.7 3.3 20 5 20H19C20.7 20 22 18.7 22 17V11.5H2ZM6 14.5C6 13.9 6.4 13.5 7 13.5H9C9.6 13.5 10 13.9 10 14.5V16C10 16.6 9.6 17 9 17H7C6.4 17 6 16.6 6 16V14.5ZM13 15.5C13 15 13.4 14.5 14 14.5H18C18.6 14.5 19 15 19 15.5C19 16 18.6 16.5 18 16.5H14C13.4 16.5 13 16 13 15.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * 8. Analytics — Dual-tone staggered growth bar chart
 */
export function AnalyticsDuotoneIcon({ size = 17, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted background chart bars */}
      <rect x="2" y="13" width="4.5" height="8" rx="2" fill="currentColor" opacity="0.38" />
      <rect x="12.5" y="9" width="4.5" height="12" rx="2" fill="currentColor" opacity="0.38" />
      {/* Solid key metric bars */}
      <rect x="7.25" y="4" width="4.5" height="17" rx="2" fill="currentColor" />
      <rect x="17.75" y="7" width="4.5" height="14" rx="2" fill="currentColor" />
    </svg>
  );
}

/**
 * 9. Portfolio — Photo frame with tinted scenic layers
 */
export function PortfolioDuotoneIcon({ size = 17, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted back canvas layer */}
      <rect x="3" y="3" width="18" height="18" rx="4" fill="currentColor" opacity="0.35" />
      {/* Solid sun & mountain foreground */}
      <circle cx="8" cy="8" r="2" fill="currentColor" />
      <path
        d="M3 17L8.5 10.5C8.9 10 9.7 10 10.1 10.5L14 15L16.4 12.2C16.8 11.7 17.6 11.7 18 12.2L21 16V17C21 18.7 19.7 20 18 20H6C4.3 20 3 18.7 3 17Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * 10. Hub (Network) — Central solid hub with tinted connector nodes
 */
export function HubDuotoneIcon({ size = 17, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted satellite nodes & links */}
      <circle cx="5" cy="6" r="3" fill="currentColor" opacity="0.38" />
      <circle cx="19" cy="6" r="3" fill="currentColor" opacity="0.38" />
      <path
        d="M6.8 7.5L10.5 10.5M17.2 7.5L13.5 10.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.38"
      />
      {/* Solid primary central nucleus & root */}
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <circle cx="12" cy="20" r="2.5" fill="currentColor" opacity="0.38" />
      <path d="M12 16V17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.38" />
    </svg>
  );
}

/**
 * 11. Hands (Handshake) — Duotone partnership silhouette
 */
export function HandsDuotoneIcon({ size = 17, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted left cuff & wrist */}
      <path
        d="M2 9.5C2 8.7 2.7 8 3.5 8H6.5C7.3 8 8 8.7 8 9.5V14.5C8 15.3 7.3 16 6.5 16H3.5C2.7 16 2 15.3 2 14.5V9.5Z"
        fill="currentColor"
        opacity="0.38"
      />
      <path
        d="M16 8H19.5C20.3 8 21 8.7 21 9.5V14.5C21 15.3 20.3 16 19.5 16H16V8Z"
        fill="currentColor"
        opacity="0.38"
      />
      {/* Solid interlocking hands */}
      <path
        d="M7 10L10.2 13.2C10.7 13.7 11.5 13.7 12 13.2L15.5 9.7C16.1 9.1 16.1 8.2 15.5 7.6L14.4 6.5C13.8 5.9 12.9 5.9 12.3 6.5L8.5 10.3C8.1 10.7 8.1 11.3 8.5 11.7L9.8 13"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 14L13.5 16.5C14.1 17.1 15 17.1 15.6 16.5L17.5 14.6C18.1 14 18.1 13.1 17.5 12.5L14.5 9.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 12. Basics (BookOpen) — Open manual with tinted pages
 */
export function BasicsDuotoneIcon({ size = 17, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted background book flap */}
      <path
        d="M4 4C4 2.9 4.9 2 6 2H11C11.6 2 12 2.4 12 3V19C11.4 18.4 10.3 18 9 18H4V4Z"
        fill="currentColor"
        opacity="0.38"
      />
      <path
        d="M20 4C20 2.9 19.1 2 18 2H13C12.4 2 12 2.4 12 3V19C12.6 18.4 13.7 18 15 18H20V4Z"
        fill="currentColor"
        opacity="0.38"
      />
      {/* Solid book spine & foreground bookmark */}
      <path
        d="M2 6.5C2 5.1 3.1 4 4.5 4H10C11.1 4 12 4.9 12 6V21C12 21.6 11.4 22 10.8 21.8C9.5 21.3 7.8 21 6 21C4.1 21 2.5 21.4 2 21.8V6.5Z"
        fill="currentColor"
      />
      <path
        d="M22 6.5C22 5.1 20.9 4 19.5 4H14C12.9 4 12 4.9 12 6V21C12 21.6 12.6 22 13.2 21.8C14.5 21.3 16.2 21 18 21C19.9 21 21.5 21.4 22 21.8V6.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * 13. Developer — Code brackets with tinted cursor/slash
 */
export function DeveloperDuotoneIcon({ size = 17, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted center slash */}
      <path
        d="M14.5 4.5L9.5 19.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.4"
      />
      {/* Solid code brackets */}
      <path
        d="M7.5 7.5L3.5 11.5C3.2 11.8 3.2 12.2 3.5 12.5L7.5 16.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.5 7.5L20.5 11.5C20.8 11.8 20.8 12.2 20.5 12.5L16.5 16.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 14. More tools — Solid central dot with tinted satellite pill dots
 */
export function MoreToolsDuotoneIcon({ size = 17, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <rect x="2" y="5" width="20" height="14" rx="7" fill="currentColor" opacity="0.35" />
      <circle cx="7" cy="12" r="2" fill="currentColor" />
      <circle cx="12" cy="12" r="2.25" fill="#ffffff" />
      <circle cx="17" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

/**
 * 15. Feedback — Duotone speech bubble with tinted message lines
 */
export function FeedbackDuotoneIcon({ size = 14, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted background bubble */}
      <path
        d="M20 2H4C2.9 2 2 2.9 2 4V18C2 19.1 2.9 20 4 20H18L22 24V4C22 2.9 21.1 2 20 2Z"
        fill="currentColor"
        opacity="0.38"
      />
      {/* Solid text lines & speech bubble outline */}
      <path
        d="M2 4C2 2.9 2.9 2 4 2H20C21.1 2 22 2.9 22 4V17C22 18.1 21.1 19 20 19H6L2 23V4ZM6 7C5.4 7 5 7.4 5 8C5 8.6 5.4 9 6 9H18C18.6 9 19 8.6 19 8C19 7.4 18.6 7 18 7H6ZM6 11C5.4 11 5 11.4 5 12C5 12.6 5.4 13 6 13H14C14.6 13 15 12.6 15 12C15 11.4 14.6 11 14 11H6Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * 16. Ask Odin (Sparkles) — Solid primary star with tinted secondary sparkles
 */
export function OdinDuotoneIcon({ size = 14, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted satellite stars */}
      <path
        d="M19 2C19.3 3.6 20.4 4.7 22 5C20.4 5.3 19.3 6.4 19 8C18.7 6.4 17.6 5.3 16 5C17.6 4.7 18.7 3.6 19 2ZM5.5 17C5.7 18 6.5 18.8 7.5 19C6.5 19.2 5.7 20 5.5 21C5.3 20 4.5 19.2 3.5 19C4.5 18.8 5.3 18 5.5 17Z"
        fill="currentColor"
        opacity="0.45"
      />
      {/* Solid central star */}
      <path
        d="M10.5 3C11 7.2 14.3 10.5 18.5 11C14.3 11.5 11 14.8 10.5 19C10 14.8 6.7 11.5 2.5 11C6.7 10.5 10 7.2 10.5 3Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * 17. Bell (Notifications) — Solid bell with tinted ring and clapper
 */
export function BellDuotoneIcon({ size = 16, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted top loop ring & clapper */}
      <circle cx="12" cy="3" r="2" fill="currentColor" opacity="0.38" />
      <path
        d="M9.5 19C9.5 20.4 10.6 21.5 12 21.5C13.4 21.5 14.5 20.4 14.5 19H9.5Z"
        fill="currentColor"
        opacity="0.38"
      />
      {/* Solid bell body */}
      <path
        d="M12 4C8.7 4 6 6.7 6 10V14L4 16C3.4 16.6 3.8 17.5 4.6 17.5H19.4C20.2 17.5 20.6 16.6 20 16L18 14V10C18 6.7 15.3 4 12 4Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * 18. Search — Solid rim & handle with tinted lens interior
 */
export function SearchDuotoneIcon({ size = 14, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Pure white lens interior */}
      <circle cx="11" cy="11" r="6.5" fill="#ffffff" />
      {/* Solid bezel and handle */}
      <path
        d="M11 2C6 2 2 6 2 11C2 16 6 20 11 20C13.3 20 15.3 19.1 16.8 17.7L20.3 21.2C20.7 21.6 21.3 21.6 21.7 21.2C22.1 20.8 22.1 20.2 21.7 19.8L18.2 16.3C19.3 14.8 20 13 20 11C20 6 16 2 11 2ZM4.5 11C4.5 7.4 7.4 4.5 11 4.5C14.6 4.5 17.5 7.4 17.5 11C17.5 14.6 14.6 17.5 11 17.5C7.4 17.5 4.5 14.6 4.5 11Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * 19. Outputs (Layers/Stack) — Duotone layer stack with tinted base layers
 */
export function OutputsDuotoneIcon({ size = 14, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted bottom layer */}
      <path d="M12 21.5L3 17L12 12.5L21 17L12 21.5Z" fill="currentColor" opacity="0.38" />
      {/* Tinted middle layer */}
      <path d="M12 16.5L3 12L12 7.5L21 12L12 16.5Z" fill="currentColor" opacity="0.38" />
      {/* Solid top layer */}
      <path d="M12 11.5L3 7L12 2.5L21 7L12 11.5Z" fill="currentColor" />
    </svg>
  );
}

/**
 * 20. History (Clock/Revisions) — Tinted dial with solid arrow hands
 */
export function HistoryDuotoneIcon({ size = 14, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted dial base */}
      <circle cx="12" cy="12" r="8.5" fill="currentColor" opacity="0.32" />
      {/* Solid reverse path & hands */}
      <path
        d="M12 7V12L15 14M3.5 12C3.5 7.3 7.3 3.5 12 3.5C16.7 3.5 20.5 7.3 20.5 12C20.5 16.7 16.7 20.5 12 20.5C8.6 20.5 5.6 18.4 4.3 15.3M2 8.5L4 12L7.5 10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 21. Explore / Compass — Duotone compass rose
 */
export function ExploreDuotoneIcon({ size = 15, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted circle bezel */}
      <circle cx="12" cy="12" r="9.5" fill="currentColor" opacity="0.35" />
      {/* Solid needle & outer ring */}
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M16 8L13.5 13.5L8 16L10.5 10.5L16 8Z" fill="currentColor" />
    </svg>
  );
}

/**
 * 22. Build / Hammer — Duotone tool with tinted head & solid handle
 */
export function BuildDuotoneIcon({ size = 15, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted tool head */}
      <path d="M14 2L22 10L19 13L16 10L14 12L12 10L14 8L11 5L14 2Z" fill="currentColor" opacity="0.4" />
      {/* Solid handle */}
      <path
        d="M15 9L5 19C4.2 19.8 3 19.8 2.2 19C1.4 18.2 1.4 17 2.2 16.2L12.2 6.2L15 9Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * 23. Review / Refine — Duotone circular refresh arrows
 */
export function ReviewDuotoneIcon({ size = 15, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted central core */}
      <circle cx="12" cy="12" r="4.5" fill="currentColor" opacity="0.35" />
      {/* Solid cyclical arrows */}
      <path
        d="M21 12C21 17 17 21 12 21C7.6 21 4 17.8 3.2 13.5M3 12C3 7 7 3 12 3C16.4 3 20 6.2 20.8 10.5M21 3V8H16M3 21V16H8"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 24. Resolve / Alert — Duotone shield alert badge
 */
export function ResolveDuotoneIcon({ size = 15, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted shield badge */}
      <path d="M12 2.5L20 6V12C20 17 16.5 21 12 22.5C7.5 21 4 17 4 12V6L12 2.5Z" fill="currentColor" opacity="0.35" />
      {/* Solid alert exclamation */}
      <path d="M12 7V13M12 16.5V17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * 25. Plus (Attachment/Add) — Tinted background circle with solid plus crosshair
 */
export function PlusDuotoneIcon({ size = 16, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="9.5" fill="currentColor" opacity="0.18" />
      <path d="M12 7.5V16.5M7.5 12H16.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * 26. Microphone (Voice Input) — Solid capsule with tinted stand & pickup ring
 */
export function MicDuotoneIcon({ size = 17, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted stand & pickup arc */}
      <path
        d="M5.5 10.5C5.5 14 8.4 17 12 17C15.6 17 18.5 14 18.5 10.5M12 17V21M8 21H16"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.45"
      />
      {/* Solid capsule */}
      <rect x="8.5" y="3" width="7" height="11" rx="3.5" fill="currentColor" />
    </svg>
  );
}

/**
 * 27. Drawings / Blueprint — Architecture blueprint with ruler grid
 */
export function DrawingsDuotoneIcon({ size = 16, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted base blueprint pad */}
      <rect x="3" y="3" width="18" height="18" rx="4" fill="currentColor" opacity="0.35" />
      {/* Solid blueprint ruler & drafting lines */}
      <path
        d="M3 9H9V3M15 3V9H21M9 21V15H3M21 15H15V21M9 9H15V15H9V9Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 28. Mail (Email Input) — Tinted top envelope flap fold with clean structured envelope
 */
export function MailDuotoneIcon({ size = 16, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted top fold flap triangle */}
      <path
        d="M3.5 6.5L12 13L20.5 6.5H3.5Z"
        fill="currentColor"
        opacity="0.3"
      />
      {/* Crisp envelope outline */}
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Fold lines */}
      <path
        d="M3.5 6.5L12 13L20.5 6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 29. Lock (Password Input) — Refined padlock with tinted interior & solid keyhole
 */
export function LockDuotoneIcon({ size = 16, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted shackle arch fill */}
      <path
        d="M8 10V7C8 4.79 9.79 3 12 3C14.21 3 16 4.79 16 7V10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.38"
      />
      {/* Tinted body fill */}
      <rect
        x="5"
        y="10"
        width="14"
        height="11"
        rx="2.5"
        fill="currentColor"
        opacity="0.18"
      />
      {/* Crisp body outline */}
      <rect
        x="5"
        y="10"
        width="14"
        height="11"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Solid keyhole */}
      <circle cx="12" cy="14.5" r="1.3" fill="currentColor" />
      <path d="M12 15.8V17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * 30. Eye (Password Visible) — Crisp duotone eye with tinted iris ring & solid pupil
 */
export function EyeDuotoneIcon({ size = 16, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted iris ring */}
      <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.25" />
      {/* Solid pupil */}
      <circle cx="12" cy="12" r="1.8" fill="currentColor" />
      {/* Crisp eyelid contours */}
      <path
        d="M2.5 12C4.2 7.8 7.8 5 12 5C16.2 5 19.8 7.8 21.5 12C19.8 16.2 16.2 19 12 19C7.8 19 4.2 16.2 2.5 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 31. EyeOff (Password Hidden) — Crisp duotone eye with diagonal strike
 */
export function EyeOffDuotoneIcon({ size = 16, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted pupil remnant */}
      <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.3" />
      {/* Eyelid arcs */}
      <path
        d="M9.88 9.88C9.33 10.43 9 11.18 9 12C9 13.66 10.34 15 12 15C12.82 15 13.57 14.67 14.12 14.12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.73 5.08C11.15 5.03 11.57 5 12 5C16.2 5 19.8 7.8 21.5 12C20.77 13.72 19.65 15.2 18.25 16.35M6.53 6.53C4.65 7.95 3.25 9.88 2.5 12C4.2 16.2 7.8 19 12 19C13.75 19 15.4 18.5 16.85 17.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Strike slash */}
      <path d="M3 3L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * 32. Shield (Governance & Security) — Tinted shield crest with solid checkmark
 */
export function ShieldDuotoneIcon({ size = 16, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M12 2.5L20 6V12C20 17 16.5 21 12 22.5C7.5 21 4 17 4 12V6L12 2.5Z"
        fill="currentColor"
        opacity="0.32"
      />
      <path
        d="M9 12L11 14L15 10"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 2.5L20 6V12C20 17 16.5 21 12 22.5C7.5 21 4 17 4 12V6L12 2.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 33. MapPin / Location — Solid precision pin silhouette with tinted radar aura
 */
export function MapPinDuotoneIcon({ size = 16, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted radar base pulse */}
      <ellipse cx="12" cy="20.5" rx="5.5" ry="2" fill="currentColor" opacity="0.35" />
      {/* Solid precision location pin silhouette */}
      <path
        d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 21.5 12 21.5C12 21.5 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 12C10.34 12 9 10.66 9 9C9 7.34 10.34 6 12 6C13.66 6 15 7.34 15 9C15 10.66 13.66 12 12 12Z"
        fill="currentColor"
      />
      <circle cx="12" cy="9" r="1.75" fill="#ffffff" />
    </svg>
  );
}

export const LocationDuotoneIcon = MapPinDuotoneIcon;

/**
 * 34. Building / Architecture (Project Type) — Duotone skyscraper & facade
 */
export function BuildingDuotoneIcon({ size = 17, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted background building block */}
      <path
        d="M3 21V5C3 3.9 3.9 3 5 3H13C14.1 3 15 3.9 15 5V21H3Z"
        fill="currentColor"
        opacity="0.3"
      />
      {/* Solid side tower & windows */}
      <path
        d="M15 9H19C20.1 9 21 9.9 21 11V21H15V9Z"
        fill="currentColor"
      />
      <rect x="6" y="6" width="2.5" height="2" rx="0.5" fill="#ffffff" />
      <rect x="9.5" y="6" width="2.5" height="2" rx="0.5" fill="#ffffff" />
      <rect x="6" y="10" width="2.5" height="2" rx="0.5" fill="#ffffff" />
      <rect x="9.5" y="10" width="2.5" height="2" rx="0.5" fill="#ffffff" />
      <rect x="6" y="14" width="2.5" height="2" rx="0.5" fill="#ffffff" />
      <rect x="9.5" y="14" width="2.5" height="2" rx="0.5" fill="#ffffff" />
      <rect x="17" y="12" width="2" height="2" rx="0.5" fill="#ffffff" opacity="0.9" />
      <rect x="17" y="15.5" width="2" height="2" rx="0.5" fill="#ffffff" opacity="0.9" />
      {/* Base baseline */}
      <path d="M2 21H22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/**
 * 35. Clock / Duration — Duotone clock dial with tinted circular disc & solid hands
 */
export function ClockDuotoneIcon({ size = 17, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted circular clock disc */}
      <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.28" />
      {/* Solid outer ring */}
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      {/* Solid hands */}
      <path
        d="M12 7V12L15.5 14"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 36. Layers / Built-up Area — Duotone stacked planes with tinted bottom sheets
 */
export function LayersDuotoneIcon({ size = 17, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted bottom layer */}
      <path d="M12 21.5L3 17L12 12.5L21 17L12 21.5Z" fill="currentColor" opacity="0.32" />
      {/* Tinted middle layer */}
      <path d="M12 16.5L3 12L12 7.5L21 12L12 16.5Z" fill="currentColor" opacity="0.45" />
      {/* Solid top layer */}
      <path d="M12 11.5L3 7L12 2.5L21 7L12 11.5Z" fill="currentColor" />
    </svg>
  );
}

/**
 * 37. Rupee / Budget — Duotone Indian Rupee coin with tinted background halo
 */
export function RupeeDuotoneIcon({ size = 17, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted circular coin background */}
      <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.2" />
      {/* Precision authentic Indian Rupee glyph */}
      <path
        d="M6.5 4.5H17.5M6.5 8.5H15M6.5 4.5V13H9C14.2 13 14.2 4.5 9 4.5M6.5 13L14.5 20.5"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Sun / Daylight & Ventilation — Duotone sun with tinted core & crisp rays
 */
export function SunDuotoneIcon({ size = 17, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted central sun aura */}
      <circle cx="12" cy="12" r="4.5" fill="currentColor" opacity="0.28" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      {/* Solid sun rays */}
      <path
        d="M12 2.5V4.5M12 19.5V21.5M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M2.5 12H4.5M19.5 12H21.5M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Workspace / Study & Home Office — Duotone laptop workspace
 */
export function WorkspaceDuotoneIcon({ size = 17, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted display screen */}
      <rect x="3.5" y="4.5" width="17" height="10.5" rx="2" fill="currentColor" opacity="0.22" />
      <rect x="3.5" y="4.5" width="17" height="10.5" rx="2" stroke="currentColor" strokeWidth="1.6" />
      {/* Solid base keyboard */}
      <path
        d="M2 18H22C22.6 18 23 17.6 22.8 17L21.5 15H2.5L1.2 17C1 17.6 1.4 18 2 18Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Energy / Efficiency & Sustainability — Duotone dynamic clean energy spark
 */
export function EnergyDuotoneIcon({ size = 17, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted background aura */}
      <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.18" />
      {/* Solid energy lightning spark */}
      <path
        d="M13 2.5L5.5 13H12L11 21.5L18.5 11H12L13 2.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * 38. User / Client — Duotone individual user profile
 */
export function UserDuotoneIcon({ size = 17, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted background aura halo */}
      <circle cx="12" cy="7.5" r="5.5" fill="currentColor" opacity="0.28" />
      {/* Solid user head */}
      <circle cx="12" cy="7.5" r="4" fill="currentColor" />
      {/* Solid user body silhouette */}
      <path
        d="M4.5 19.5C4.5 15.9 7.9 13.5 12 13.5C16.1 13.5 19.5 15.9 19.5 19.5V20.5C19.5 21.1 19 21.5 18.5 21.5H5.5C4.9 21.5 4.5 21.1 4.5 20.5V19.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * 39. CAD / DWG Drawing — Duotone blueprint drafting sheet
 */
export function CadDuotoneIcon({ size = 17, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted document sheet base */}
      <path
        d="M6 2C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2H6Z"
        fill="currentColor"
        opacity="0.32"
      />
      {/* Folded corner */}
      <path d="M14 2V7C14 7.6 14.4 8 15 8H20L14 2Z" fill="currentColor" />
      {/* Solid CAD drafting compass / blueprint mark */}
      <path
        d="M8.5 17.5L12 11.5L15.5 17.5M9.5 15.5H14.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 40. PDF Document — Duotone PDF sheet with document lines
 */
export function PdfDuotoneIcon({ size = 17, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted document sheet base */}
      <path
        d="M6 2C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2H6Z"
        fill="currentColor"
        opacity="0.32"
      />
      {/* Folded corner */}
      <path d="M14 2V7C14 7.6 14.4 8 15 8H20L14 2Z" fill="currentColor" />
      {/* Clean document text bars */}
      <path
        d="M8 12H16M8 15H14M8 18H12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * 41. Task — Smooth Rounded Squircle Checkbox with Bold Checkmark
 */
export function TaskDuotoneIcon({ size = 17, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted smooth squircle base */}
      <rect x="3" y="3" width="18" height="18" rx="5.5" fill="currentColor" opacity="0.22" />
      {/* Crisp outer border */}
      <rect x="3" y="3" width="18" height="18" rx="5.5" stroke="currentColor" strokeWidth="1.6" />
      {/* Bold precision checkmark */}
      <path
        d="M7.5 12.3L10.5 15.3L16.5 8.7"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 42. Drive / Folder — Duotone folder with tinted back flap & solid front pocket
 */
export function DriveDuotoneIcon({ size = 17, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted back folder flap */}
      <path
        d="M3 5C3 3.9 3.9 3 5 3H9.4C10.2 3 11 3.4 11.5 4L12.8 5.6C13.1 6 13.5 6.2 14 6.2H19C20.1 6.2 21 7.1 21 8.2V11H3V5Z"
        fill="currentColor"
        opacity="0.32"
      />
      {/* Solid front folder envelope */}
      <path
        d="M2 9.5C2 8.7 2.7 8 3.5 8H20.5C21.3 8 22 8.7 22 9.5V18C22 19.7 20.7 21 19 21H5C3.3 21 2 19.7 2 18V9.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * 43. BOQ / Bill of Quantities — Solid Duotone Itemized Estimate Table matching Drive/Finance/Site silhouette style
 */
export function BoqDuotoneIcon({ size = 17, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted top table header with dual column indicators */}
      <path
        d="M5 4C3.3 4 2 5.3 2 7V8.5H22V7C22 5.3 20.7 4 19 4H5Z"
        fill="currentColor"
        opacity="0.32"
      />
      {/* Solid table body with compound transparent cutout itemized grid cells */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2 9.5C2 8.7 2.7 8 3.5 8H20.5C21.3 8 22 8.7 22 9.5V18C22 19.7 20.7 21 19 21H5C3.3 21 2 19.7 2 18V9.5ZM5.5 11.5C5.5 10.9 5.9 10.5 6.5 10.5H10.5C11.1 10.5 11.5 10.9 11.5 11.5V12.5C11.5 13.1 11.1 13.5 10.5 13.5H6.5C5.9 13.5 5.5 13.1 5.5 12.5V11.5ZM14 11.5C14 10.9 14.4 10.5 15 10.5H18C18.6 10.5 19 10.9 19 11.5V12.5C19 13.1 18.6 13.5 18 13.5H15C14.4 13.5 14 13.1 14 12.5V11.5ZM5.5 16C5.5 15.4 5.9 15 6.5 15H10.5C11.1 15 11.5 15.4 11.5 16V17C11.5 17.6 11.1 18 10.5 18H6.5C5.9 18 5.5 17.6 5.5 17V16ZM14 16C14 15.4 14.4 15 15 15H18C18.6 15 19 15.4 19 16V17C19 17.6 18.6 18 18 18H15C14.4 18 14 17.6 14 17V16Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * 44. Finance / Card & Payments — Duotone payment card with magnetic header
 */
export function FinanceDuotoneIcon({ size = 17, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted magnetic stripe header */}
      <path
        d="M5 4C3.3 4 2 5.3 2 7V8.5H22V7C22 5.3 20.7 4 19 4H5Z"
        fill="currentColor"
        opacity="0.32"
      />
      {/* Solid card base & security chip */}
      <path
        d="M2 11.5V17C2 18.7 3.3 20 5 20H19C20.7 20 22 18.7 22 17V11.5H2ZM6 14.5C6 13.9 6.4 13.5 7 13.5H9C9.6 13.5 10 13.9 10 14.5V16C10 16.6 9.6 17 9 17H7C6.4 17 6 16.6 6 16V14.5ZM13 15.5C13 15 13.4 14.5 14 14.5H18C18.6 14.5 19 15 19 15.5C19 16 18.6 16.5 18 16.5H14C13.4 16.5 13 16 13 15.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * 45. Site / Building — Duotone architectural site structure
 */
export function SiteDuotoneIcon({ size = 17, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted background building block */}
      <path
        d="M3 21V5C3 3.9 3.9 3 5 3H13C14.1 3 15 3.9 15 5V21H3Z"
        fill="currentColor"
        opacity="0.3"
      />
      {/* Solid side tower */}
      <path
        d="M15 9H19C20.1 9 21 9.9 21 11V21H15V9Z"
        fill="currentColor"
      />
      <rect x="6" y="6.5" width="2.5" height="2" rx="0.5" fill="#ffffff" />
      <rect x="9.5" y="6.5" width="2.5" height="2" rx="0.5" fill="#ffffff" />
      <rect x="6" y="10.5" width="2.5" height="2" rx="0.5" fill="#ffffff" />
      <rect x="9.5" y="10.5" width="2.5" height="2" rx="0.5" fill="#ffffff" />
      <rect x="6" y="14.5" width="2.5" height="2" rx="0.5" fill="#ffffff" />
      <rect x="9.5" y="14.5" width="2.5" height="2" rx="0.5" fill="#ffffff" />
      <rect x="17" y="12" width="2" height="2" rx="0.5" fill="#ffffff" opacity="0.9" />
      <rect x="17" y="15.5" width="2" height="2" rx="0.5" fill="#ffffff" opacity="0.9" />
      {/* Base line */}
      <path d="M2 21H22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Fullscreen Expand — 4-way directional arrows (Outward) in Kallisto duotone theme
 */
export function FullscreenExpandDuotoneIcon({ size = 16, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted center cross / stems */}
      <path
        d="M12 7.5V11.5M12 16.5V12.5M7.5 12H11.5M16.5 12H12.5"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.38"
      />
      {/* Solid 4-way outward arrowheads with stems */}
      {/* Up */}
      <path
        d="M8.5 7L12 3.5L15.5 7"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 4.5V10.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* Down */}
      <path
        d="M8.5 17L12 20.5L15.5 17"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 19.5V13.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* Left */}
      <path
        d="M7 8.5L3.5 12L7 15.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 12H10.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* Right */}
      <path
        d="M17 8.5L20.5 12L17 15.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.5 12H13.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Fullscreen Exit — 4-way directional arrows (Inward) in Kallisto duotone theme
 */
export function FullscreenExitDuotoneIcon({ size = 16, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted outer stems */}
      <path
        d="M12 3V6.5M12 21V17.5M3 12H6.5M21 12H17.5"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.38"
      />
      {/* Solid inward arrowheads */}
      {/* Top pointing down */}
      <path
        d="M8.5 7.5L12 10.5L15.5 7.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 4V10"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* Bottom pointing up */}
      <path
        d="M8.5 16.5L12 13.5L15.5 16.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 20V14"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* Left pointing right */}
      <path
        d="M7.5 8.5L10.5 12L7.5 15.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 12H10"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* Right pointing left */}
      <path
        d="M16.5 8.5L13.5 12L16.5 15.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 12H14"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * All Documents (Drive Inbox Tray) — Solid tray with tinted document paper sheet
 */
export function AllDocumentsDuotoneIcon({ size = 16, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted top document sheet */}
      <path
        d="M6 3.5C6 2.7 6.7 2 7.5 2H16.5C17.3 2 18 2.7 18 3.5V11H6V3.5Z"
        fill="currentColor"
        opacity="0.38"
      />
      <path
        d="M8.5 6H15.5"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.9"
      />
      {/* Solid documents tray */}
      <path
        d="M3 11C2.4 11 2 11.4 2 12V18C2 19.7 3.3 21 5 21H19C20.7 21 22 19.7 22 18V12C22 11.4 21.6 11 21 11H16.5C16 11 15.5 11.4 15.3 11.9L14.4 13.6C14.2 13.9 13.8 14.1 13.4 14.1H10.6C10.2 14.1 9.8 13.9 9.6 13.6L8.7 11.9C8.5 11.4 8 11 7.5 11H3Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Shared with me — Solid user silhouette with tinted collaborator
 */
export function SharedWithMeDuotoneIcon({ size = 16, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted companion collaborator */}
      <circle cx="16.5" cy="7.5" r="3" fill="currentColor" opacity="0.38" />
      <path
        d="M16 12.5C18.2 12.5 21.5 13.6 21.9 15.8C22 16.1 22 16.5 22 17V18.5C22 19.1 21.6 19.5 21 19.5H15.5C15.8 18.6 16 17.6 16 16.5C16 14.9 15.2 13.5 14 12.7C14.6 12.6 15.3 12.5 16 12.5Z"
        fill="currentColor"
        opacity="0.38"
      />
      {/* Solid primary user */}
      <circle cx="9" cy="8" r="4" fill="currentColor" />
      <path
        d="M9 13.5C5.7 13.5 2 15.2 2 18.5V19.5C2 20.3 2.7 21 3.5 21H14.5C15.3 21 16 20.3 16 19.5V18.5C16 15.2 12.3 13.5 9 13.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Starred — Solid star silhouette with tinted outer glow/aura
 */
export function StarredDuotoneIcon({ size = 16, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted glowing soft background star */}
      <path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill="currentColor"
        opacity="0.38"
      />
      {/* Solid defined star */}
      <path
        d="M12 3.5L14.5 8.5L20 9.3L16 13.2L16.9 18.7L12 16.1L7.1 18.7L8 13.2L4 9.3L9.5 8.5L12 3.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Task List (List View Tab) — Solid bullet checkpoints with tinted task lines
 */
export function TaskListDuotoneIcon({ size = 15, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted horizontal task bars */}
      <rect x="9" y="5" width="12" height="2.5" rx="1.25" fill="currentColor" opacity="0.38" />
      <rect x="9" y="11" width="12" height="2.5" rx="1.25" fill="currentColor" opacity="0.38" />
      <rect x="9" y="17" width="8" height="2.5" rx="1.25" fill="currentColor" opacity="0.38" />
      {/* Solid checkpoint markers */}
      <rect x="3" y="4.5" width="3.5" height="3.5" rx="1" fill="currentColor" />
      <rect x="3" y="10.5" width="3.5" height="3.5" rx="1" fill="currentColor" />
      <rect x="3" y="16.5" width="3.5" height="3.5" rx="1" fill="currentColor" />
    </svg>
  );
}

/**
 * Timeline (Timeline View Tab) — Solid milestone track nodes with tinted schedule bars
 */
export function TimelineDuotoneIcon({ size = 15, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted schedule duration spans */}
      <rect x="4" y="4.5" width="10" height="3.5" rx="1.75" fill="currentColor" opacity="0.38" />
      <rect x="9" y="10.5" width="11" height="3.5" rx="1.75" fill="currentColor" opacity="0.38" />
      <rect x="6" y="16.5" width="8" height="3.5" rx="1.75" fill="currentColor" opacity="0.38" />
      {/* Solid key activity / milestone heads */}
      <circle cx="5.5" cy="6.25" r="2.25" fill="currentColor" />
      <circle cx="10.5" cy="12.25" r="2.25" fill="currentColor" />
      <circle cx="7.5" cy="18.25" r="2.25" fill="currentColor" />
    </svg>
  );
}

/**
 * Drawings Section — Blueprint canvas with architectural floorplan geometry & drafting marks
 */
export function DrawingsSectionDuotoneIcon({ size = 17, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted blueprint canvas */}
      <rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" opacity="0.38" />
      {/* Solid architectural drafting floorplan walls & crosshairs */}
      <path
        d="M7 7H17V17H7V7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M7 12H13M13 7V13M10 17V14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="15.5" cy="15.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

/**
 * Documents Section — Dual-tone document sheet with tinted corner fold and lines
 */
export function DocumentsSectionDuotoneIcon({ size = 17, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted sheet base */}
      <path
        d="M6 2C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2H6Z"
        fill="currentColor"
        opacity="0.38"
      />
      {/* Solid folded corner and document lines */}
      <path
        d="M14 2V7C14 7.6 14.4 8 15 8H20L14 2ZM7 11.5C7 11 7.4 10.5 8 10.5H16C16.6 10.5 17 11 17 11.5C17 12 16.6 12.5 16 12.5H8C7.4 12.5 7 12 7 11.5ZM7 15C7 14.4 7.4 14 8 14H16C16.6 14 17 14.4 17 15C17 15.6 16.6 16 16 16H8C7.4 16 7 15.6 7 15ZM7 18.5C7 18 7.4 17.5 8 17.5H13C13.6 17.5 14 18 14 18.5C14 19 13.6 19.5 13 19.5H8C7.4 19.5 7 19 7 18.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Approvals Section — Verification shield with solid approval check emblem
 */
export function ApprovalsSectionDuotoneIcon({ size = 17, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted verification shield backdrop */}
      <path
        d="M12 2L4 5.5V11.5C4 16.5 7.4 21.1 12 22.3C16.6 21.1 20 16.5 20 11.5V5.5L12 2Z"
        fill="currentColor"
        opacity="0.38"
      />
      {/* Solid verification checkmark */}
      <path
        d="M8.5 11.8L11 14.3L15.8 9.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Contracts Section — Agreement parchment with legal clauses & solid wax seal quill
 */
export function ContractsSectionDuotoneIcon({ size = 17, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted contract sheet */}
      <path
        d="M5 3C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H16C17.1 21 18 20.1 18 19V5C18 3.9 17.1 3 16 3H5Z"
        fill="currentColor"
        opacity="0.38"
      />
      {/* Solid contract clauses & signature quill */}
      <path d="M6.5 7H14.5M6.5 10.5H12M6.5 14H10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M13 18C14.5 17 16 16.5 17.5 17.5C18.5 18.5 19.5 20 20.5 18.5C21 17.8 21.5 16 21 14L15.5 13L14 16.5L13 18Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Site Reports Section — Inspection clipboard with checklist bullets
 */
export function SiteReportsSectionDuotoneIcon({ size = 17, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted clipboard body */}
      <rect x="4" y="4" width="16" height="18" rx="3" fill="currentColor" opacity="0.38" />
      {/* Solid header clip */}
      <path d="M8 3C8 2.4 8.4 2 9 2H15C15.6 2 16 2.4 16 3V5H8V3Z" fill="currentColor" />
      {/* Solid checklist lines & bullet checks */}
      <path d="M7.5 9.5L9 11L11.5 8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.5 10H16.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7.5 15L9 16.5L11.5 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.5 15.5H16.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Renderings Section — 3D isometric perspective model with tinted canvas
 */
export function RenderingsSectionDuotoneIcon({ size = 17, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted render canvas */}
      <rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" opacity="0.38" />
      {/* Solid isometric 3D render model */}
      <path d="M12 6L18 9.5V16.5L12 20L6 16.5V9.5L12 6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 6V20M6 9.5L12 13M18 9.5L12 13" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

/**
 * More Folders Section — Folder with tinted back flap
 */
export function MoreFoldersSectionDuotoneIcon({ size = 17, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted back folder flap */}
      <path
        d="M3 5C3 3.9 3.9 3 5 3H9.4C10.2 3 11 3.4 11.5 4L12.8 5.6C13.1 6 13.5 6.2 14 6.2H19C20.1 6.2 21 7.1 21 8.2V11H3V5Z"
        fill="currentColor"
        opacity="0.38"
      />
      {/* Solid front folder */}
      <path
        d="M2 9.5C2 8.7 2.7 8 3.5 8H20.5C21.3 8 22 8.7 22 9.5V18C22 19.7 20.7 21 19 21H5C3.3 21 2 19.7 2 18V9.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Archive System — Solid storage lid with tinted box base
 */
export function ArchiveSystemDuotoneIcon({ size = 17, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted archive box body */}
      <path
        d="M4 8.5V19C4 20.1 4.9 21 6 21H18C19.1 21 20 20.1 20 19V8.5H4Z"
        fill="currentColor"
        opacity="0.38"
      />
      {/* Solid archive lid with handle */}
      <rect x="3" y="3.5" width="18" height="5" rx="1.5" fill="currentColor" />
      <rect x="10" y="11.5" width="4" height="2" rx="1" fill="currentColor" />
    </svg>
  );
}

/**
 * Bin System — Solid bin lid & handle with tinted trash bucket
 */
export function BinSystemDuotoneIcon({ size = 17, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted trash bucket */}
      <path
        d="M5.5 7.5L6.8 19.4C6.9 20.3 7.7 21 8.6 21H15.4C16.3 21 17.1 20.3 17.2 19.4L18.5 7.5H5.5Z"
        fill="currentColor"
        opacity="0.38"
      />
      {/* Solid ribs */}
      <path d="M10 11V17M14 11V17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      {/* Solid lid bar */}
      <rect x="3.5" y="5" width="17" height="2.5" rx="1.25" fill="currentColor" />
      {/* Solid lid handle */}
      <path
        d="M9 5V3.5C9 2.7 9.7 2 10.5 2H13.5C14.3 2 15 2.7 15 3.5V5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Storage System — Stacked server / drive trays with solid chassis & tinted upper bay
 */
export function StorageSystemDuotoneIcon({ size = 17, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted upper drive bay */}
      <rect x="3" y="3.5" width="18" height="7" rx="2" fill="currentColor" opacity="0.38" />
      <circle cx="17" cy="7" r="1.2" fill="currentColor" />
      {/* Solid lower drive chassis */}
      <rect x="3" y="13.5" width="18" height="7" rx="2" fill="currentColor" />
      <path d="M6 17H13" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
      <circle cx="17" cy="17" r="1.2" fill="#ffffff" opacity="0.9" />
    </svg>
  );
}

/**
 * List View — Signature duotone list rows with tinted bars and solid bullet endpoints
 */
export function ListViewDuotoneIcon({ size = 17, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted list row bars */}
      <rect x="8" y="5" width="13" height="3" rx="1.5" fill="currentColor" opacity="0.38" />
      <rect x="8" y="10.5" width="13" height="3" rx="1.5" fill="currentColor" opacity="0.38" />
      <rect x="8" y="16" width="13" height="3" rx="1.5" fill="currentColor" opacity="0.38" />
      {/* Solid bullet marks */}
      <circle cx="4.5" cy="6.5" r="1.75" fill="currentColor" />
      <circle cx="4.5" cy="12" r="1.75" fill="currentColor" />
      <circle cx="4.5" cy="17.5" r="1.75" fill="currentColor" />
    </svg>
  );
}

/**
 * Grid View — Signature duotone 2x2 grid with alternating solid and tinted tiles
 */
export function GridViewDuotoneIcon({ size = 17, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted tiles */}
      <rect x="13.5" y="3.5" width="7" height="7" rx="2" fill="currentColor" opacity="0.38" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="2" fill="currentColor" opacity="0.38" />
      {/* Solid tiles */}
      <rect x="3.5" y="3.5" width="7" height="7" rx="2" fill="currentColor" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="2" fill="currentColor" />
    </svg>
  );
}

/**
 * Sort — Signature duotone slider adjustments icon with bold tracks and thumb nodules
 */
export function SortDuotoneIcon({ size = 18, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Top track line */}
      <line x1="3.5" y1="6" x2="20.5" y2="6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" opacity="0.48" />
      {/* Top solid adjustment knob */}
      <circle cx="8" cy="6" r="3.25" fill="currentColor" />
      {/* Middle track line */}
      <line x1="3.5" y1="12" x2="20.5" y2="12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" opacity="0.48" />
      {/* Middle solid adjustment knob */}
      <circle cx="16" cy="12" r="3.25" fill="currentColor" />
      {/* Bottom track line */}
      <line x1="3.5" y1="18" x2="20.5" y2="18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" opacity="0.48" />
      {/* Bottom solid adjustment knob */}
      <circle cx="10" cy="18" r="3.25" fill="currentColor" />
    </svg>
  );
}

/**
 * Import — Signature duotone upload icon with bold tray and solid arrow
 */
export function ImportDuotoneIcon({ size = 18, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted base tray */}
      <path
        d="M4 15.5v3a2.5 2.5 0 0 0 2.5 2.5h11a2.5 2.5 0 0 0 2.5-2.5v-3"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.48"
      />
      {/* Solid upload arrow */}
      <path d="M12 15.5V3.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="m6.5 9 5.5-5.5 5.5 5.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Export — Signature duotone download icon with bold tray and solid arrow
 */
export function ExportDuotoneIcon({ size = 18, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted base tray */}
      <path
        d="M4 15.5v3a2.5 2.5 0 0 0 2.5 2.5h11a2.5 2.5 0 0 0 2.5-2.5v-3"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.48"
      />
      {/* Solid download arrow */}
      <path d="M12 3.5v12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="m6.5 10 5.5 5.5 5.5-5.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * BOQ Items — Signature duotone filter/list items icon
 */
export function BoqItemsDuotoneIcon({ size = 16, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Top wide line */}
      <line x1="3.5" y1="6" x2="20.5" y2="6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      {/* Middle tinted line */}
      <line x1="6" y1="12" x2="18" y2="12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" opacity="0.48" />
      {/* Bottom solid line */}
      <line x1="8.5" y1="18" x2="15.5" y2="18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Rate Analysis — Signature duotone financial rate analysis bar chart
 */
export function RateAnalysisDuotoneIcon({ size = 16, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Bar 1 */}
      <rect x="3.5" y="11" width="3.5" height="9.5" rx="1.5" fill="currentColor" opacity="0.48" />
      {/* Bar 2 (tallest) */}
      <rect x="10.25" y="3.5" width="3.5" height="17" rx="1.5" fill="currentColor" />
      {/* Bar 3 */}
      <rect x="17" y="8" width="3.5" height="12.5" rx="1.5" fill="currentColor" opacity="0.48" />
    </svg>
  );
}

/**
 * Variations — Signature duotone branch variations icon
 */
export function VariationsDuotoneIcon({ size = 16, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Trunk line */}
      <path d="M6 4.5v12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" opacity="0.48" />
      {/* Branch curve */}
      <path d="M6 9.5a8.5 8.5 0 0 1 8.5 8.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      {/* Top node */}
      <circle cx="6" cy="4" r="2.75" fill="currentColor" />
      {/* Bottom node */}
      <circle cx="6" cy="18.5" r="2.75" fill="currentColor" opacity="0.48" />
      {/* Branch node */}
      <circle cx="17.5" cy="18.5" r="2.75" fill="currentColor" />
    </svg>
  );
}

/**
 * Versions — Signature duotone history / version timeline icon
 */
export function VersionsDuotoneIcon({ size = 16, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Clock rim with rollback arrow */}
      <path
        d="M3.5 12a8.5 8.5 0 1 0 8.5-8.5 9 9 0 0 0-6.2 2.5L3.5 8.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.48"
      />
      <path d="M3.5 3.5v5h5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      {/* Clock hands */}
      <path d="M12 7.5v4.5l3 2" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Sidebar Collapse / Expand Toggle — Solid left rail with tinted main canvas pane
 */
export function SidebarToggleDuotoneIcon({ size = 18, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted right canvas pane */}
      <path
        d="M9 3H19C20.1 3 21 3.9 21 5V19C21 20.1 20.1 21 19 21H9V3Z"
        fill="currentColor"
        opacity="0.35"
      />
      {/* Solid left navigation column */}
      <path
        d="M5 3C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H9V3H5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export const PanelLeftDuotoneIcon = SidebarToggleDuotoneIcon;



/**
 * Case Studies (Documents / Case Studies Tab) — Tinted document sheet with solid folded corner & lines
 */
export function CaseStudiesDuotoneIcon({ size = 16, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted sheet base */}
      <path
        d="M6 2C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2H6Z"
        fill="currentColor"
        opacity="0.38"
      />
      {/* Solid folded corner and document lines */}
      <path
        d="M14 2V7C14 7.6 14.4 8 15 8H20L14 2ZM7.5 11.5C7.5 11 7.9 10.5 8.5 10.5H15.5C16.1 10.5 16.5 11 16.5 11.5C16.5 12 16.1 12.5 15.5 12.5H8.5C7.9 12.5 7.5 12 7.5 11.5ZM7.5 15C7.5 14.4 7.9 14 8.5 14H15.5C16.1 14 16.5 14.4 16.5 15C16.5 15.6 16.1 16 15.5 16H8.5C7.9 16 7.5 15.6 7.5 15ZM7.5 18.5C7.5 18 7.9 17.5 8.5 17.5H12.5C13.1 17.5 13.5 18 13.5 18.5C13.5 19 13.1 19.5 12.5 19.5H8.5C7.9 19.5 7.5 19 7.5 18.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Tag (Tagged Tab) — Price / Category tag with tinted body and solid eyelet & accent
 */
export function TagDuotoneIcon({ size = 16, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted background tag */}
      <path
        d="M12.5 2H5C3.3 2 2 3.3 2 5V12.5C2 13.3 2.3 14.1 2.9 14.6L11.4 23.1C12.5 24.2 14.3 24.2 15.4 23.1L21.1 17.4C22.2 16.3 22.2 14.5 21.1 13.4L12.5 2Z"
        fill="currentColor"
        opacity="0.38"
      />
      {/* Solid tag corner, eyelet and outline */}
      <path
        d="M10.6 3H5C3.9 3 3 3.9 3 5V10.6C3 11.4 3.3 12.1 3.9 12.7L12.7 21.5C13.5 22.3 14.8 22.3 15.6 21.5L20.5 16.6C21.3 15.8 21.3 14.5 20.5 13.7L11.7 4.9C11.1 4.3 10.9 3 10.6 3ZM6.5 8C5.7 8 5 7.3 5 6.5C5 5.7 5.7 5 6.5 5C7.3 5 8 5.7 8 6.5C8 7.3 7.3 8 6.5 8Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Reviews (Reviews Tab) — Heart with tinted aura & solid core
 */
export function ReviewsDuotoneIcon({ size = 16, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted heart aura */}
      <path
        d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"
        fill="currentColor"
        opacity="0.38"
      />
      {/* Solid inner heart */}
      <path
        d="M12 18.6L10.8 17.5C6.5 13.6 3.7 11.1 3.7 8C3.7 5.6 5.6 3.7 8 3.7C9.4 3.7 10.8 4.4 11.6 5.4L12 5.8L12.4 5.4C13.2 4.4 14.6 3.7 16 3.7C18.4 3.7 20.3 5.6 20.3 8C20.3 11.1 17.5 13.6 13.2 17.5L12 18.6Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Pricing (Pricing Tab) — Banknote currency bill with tinted body & solid emblem
 */
export function PricingDuotoneIcon({ size = 16, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted banknote background */}
      <rect x="2" y="5" width="20" height="14" rx="3" fill="currentColor" opacity="0.38" />
      {/* Solid central coin & border markings */}
      <circle cx="12" cy="12" r="3.2" fill="currentColor" />
      <path
        d="M2 9C3.7 9 5 7.7 5 6H2V9ZM2 15C3.7 15 5 16.3 5 18H2V15ZM22 9C20.3 9 19 7.7 19 6H22V9ZM22 15C20.3 15 19 16.3 19 18H22V15ZM2 8V16C2 17.7 3.3 19 5 19H19C20.7 19 22 17.7 22 16V8C22 6.3 20.7 5 19 5H5C3.3 5 2 6.3 2 8ZM4 7H20C20.6 7 21 7.4 21 8V16C21 16.6 20.6 17 20 17H4C3.4 17 3 16.6 3 16V8C3 7.4 3.4 7 4 7Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Briefcase / Experience — Duotone portfolio briefcase with tinted body and solid handle & lock
 */
export function BriefcaseDuotoneIcon({ size = 16, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted briefcase body */}
      <rect x="2" y="7" width="20" height="14" rx="3" fill="currentColor" opacity="0.35" />
      {/* Solid handle, center lock & divider straps */}
      <path
        d="M8 7V5C8 3.9 8.9 3 10 3H14C15.1 3 16 3.9 16 5V7M2 12H22M10 12V14C10 14.6 10.4 15 11 15H13C13.6 15 14 14.6 14 14V12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="2"
        y="7"
        width="20"
        height="14"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

/**
 * Star / Rating — Duotone star with tinted aura & solid core star
 */
export function StarDuotoneIcon({ size = 16, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted circular background halo */}
      <circle cx="12" cy="12" r="9.5" fill="currentColor" opacity="0.2" />
      {/* Solid precision 5-point star */}
      <path
        d="M12 2.5L14.9 8.6L21.6 9.5L16.8 14.2L17.9 20.9L12 17.7L6.1 20.9L7.2 14.2L2.4 9.5L9.1 8.6L12 2.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Quick Action / Lightning (Zap) — Solid precision bolt with tinted energy layer
 */
export function ZapDuotoneIcon({ size = 16, className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tinted background energy overlay */}
      <path
        d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
        fill="currentColor"
        opacity="0.32"
      />
      {/* Solid precision lightning bolt */}
      <path
        d="M12.5 3L4.5 13H11.5L10.5 21L18.5 11H11.5L12.5 3Z"
        fill="currentColor"
      />
    </svg>
  );
}

