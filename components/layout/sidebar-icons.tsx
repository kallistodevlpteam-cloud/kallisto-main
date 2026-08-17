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
      {/* Tinted lens interior */}
      <circle cx="11" cy="11" r="7" fill="currentColor" opacity="0.35" />
      {/* Solid bezel and handle */}
      <path
        d="M11 2C6 2 2 6 2 11C2 16 6 20 11 20C13.3 20 15.3 19.1 16.8 17.7L20.3 21.2C20.7 21.6 21.3 21.6 21.7 21.2C22.1 20.8 22.1 20.2 21.7 19.8L18.2 16.3C19.3 14.8 20 13 20 11C20 6 16 2 11 2ZM4.5 11C4.5 7.4 7.4 4.5 11 4.5C14.6 4.5 17.5 7.4 17.5 11C17.5 14.6 14.6 17.5 11 17.5C7.4 17.5 4.5 14.6 4.5 11Z"
        fill="currentColor"
      />
    </svg>
  );
}
