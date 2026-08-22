import React from "react";
import styles from "./provider-logo-tile.module.css";

interface ProviderLogoTileProps {
  name: string;
  className?: string;
}

export function ProviderLogoTile({ name, className }: ProviderLogoTileProps) {
  const normalized = name.trim().toLowerCase();

  // 1. Circuit MEP Design -> High-contrast Dark obsidian + Cyan/White neon trace (Lighthouse / Ascent dark tech vibe)
  if (normalized.includes("circuit")) {
    return (
      <div className={`${styles.brandTileWrap} ${className || ""}`} style={{ backgroundColor: "#0b0d11" }}>
        <svg
          viewBox="0 0 320 165"
          className={styles.brandTileSvg}
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Circuit MEP Design Logo"
        >
          {/* Subtle circuit PCB grid lines */}
          <g opacity="0.08" stroke="#00f0ff" strokeWidth="1" strokeDasharray="3 3">
            <line x1="20" y1="30" x2="300" y2="30" />
            <line x1="20" y1="135" x2="300" y2="135" />
            <line x1="60" y1="10" x2="60" y2="155" />
            <line x1="260" y1="10" x2="260" y2="155" />
          </g>
          
          <g transform="translate(160, 82.5)">
            {/* Minimalist circuit node emblem */}
            <g transform="translate(-108, -13)">
              <circle cx="10" cy="14" r="5.5" fill="none" stroke="#00f0ff" strokeWidth="2.5" />
              <circle cx="10" cy="14" r="2" fill="#00f0ff" />
              <path d="M16 14 L28 14 L33 9 L40 9" fill="none" stroke="#00f0ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>

            {/* Modern bold lowercase wordmark */}
            <text
              x="-62"
              y="19"
              fill="#ffffff"
              fontFamily="system-ui, -apple-system, 'Inter', 'Outfit', sans-serif"
              fontSize="31"
              fontWeight="850"
              letterSpacing="-0.035em"
            >
              circuit
            </text>

            {/* Registered / Trademark Badge */}
            <text
              x="36"
              y="-1"
              fill="#00f0ff"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="11"
              fontWeight="700"
            >
              ®
            </text>
          </g>
        </svg>
      </div>
    );
  }

  // 2. RenderField Studio -> Vibrant Acid Lime + Deep Obsidian Black (Ascent style!)
  if (normalized.includes("renderfield")) {
    return (
      <div className={`${styles.brandTileWrap} ${className || ""}`} style={{ backgroundColor: "#c4ff00" }}>
        <svg
          viewBox="0 0 320 165"
          className={styles.brandTileSvg}
          xmlns="http://www.w3.org/2000/svg"
          aria-label="RenderField Studio Logo"
        >
          <g transform="translate(160, 82.5)">
            {/* Ascent-inspired bold angled geometric emblem */}
            <g transform="translate(-130, -14)">
              <path
                d="M4 26 L4 8 C4 3.5 7.5 0 12 0 L24 0 L24 8 L14 8 C12.5 8 11.5 9 11.5 10.5 L11.5 26 Z"
                fill="#0b0f17"
              />
              <path
                d="M17 12 L29 0 L29 12 Z"
                fill="#0b0f17"
              />
            </g>

            {/* Bold lowercase wordmark */}
            <text
              x="-92"
              y="18"
              fill="#0b0f17"
              fontFamily="system-ui, -apple-system, 'Inter', 'Outfit', sans-serif"
              fontSize="29"
              fontWeight="900"
              letterSpacing="-0.04em"
            >
              renderfield
            </text>

            {/* TM badge */}
            <text
              x="72"
              y="-1"
              fill="#0b0f17"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="10"
              fontWeight="800"
            >
              TM
            </text>
          </g>
        </svg>
      </div>
    );
  }

  // 3. ModuBIM Studio -> Vivid Crimson Red + Pure White (Radius style!)
  if (normalized.includes("modubim")) {
    return (
      <div className={`${styles.brandTileWrap} ${className || ""}`} style={{ backgroundColor: "#ff2727" }}>
        <svg
          viewBox="0 0 320 165"
          className={styles.brandTileSvg}
          xmlns="http://www.w3.org/2000/svg"
          aria-label="ModuBIM Studio Logo"
        >
          <g transform="translate(160, 82.5)">
            {/* Radius-inspired rounded square icon with geometric arc */}
            <g transform="translate(-124, -17)">
              <rect x="0" y="0" width="34" height="34" rx="9" fill="none" stroke="#ffffff" strokeWidth="3.2" />
              <path
                d="M10 24 L10 17 C10 13.5 13 10.5 16.5 10.5 L24 10.5"
                fill="none"
                stroke="#ffffff"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
            </g>

            {/* Modern clean white wordmark */}
            <text
              x="-78"
              y="19"
              fill="#ffffff"
              fontFamily="system-ui, -apple-system, 'Inter', 'Outfit', sans-serif"
              fontSize="31"
              fontWeight="800"
              letterSpacing="-0.035em"
            >
              modubim
            </text>

            {/* Registered badge */}
            <text
              x="57"
              y="-1"
              fill="#ffffff"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="11"
              fontWeight="700"
            >
              ®
            </text>
          </g>
        </svg>
      </div>
    );
  }

  // 4. GreenMetric India -> Concrete Light Grey + Cobalt Royal Blue (Kaiko style!)
  if (normalized.includes("greenmetric")) {
    return (
      <div className={`${styles.brandTileWrap} ${className || ""}`} style={{ backgroundColor: "#e2e5ea" }}>
        <svg
          viewBox="0 0 320 165"
          className={styles.brandTileSvg}
          xmlns="http://www.w3.org/2000/svg"
          aria-label="GreenMetric India Logo"
        >
          <g transform="translate(160, 82.5)">
            {/* Kaiko-inspired bold cobalt blue typography with square accents */}
            <text
              x="-114"
              y="18"
              fill="#0022f5"
              fontFamily="system-ui, -apple-system, 'Inter', 'Outfit', sans-serif"
              fontSize="28.5"
              fontWeight="900"
              letterSpacing="-0.035em"
            >
              greenmetric
            </text>

            {/* Kaiko square accent dot & TM */}
            <rect x="74" y="9" width="6.5" height="6.5" fill="#0022f5" />
            <text
              x="72"
              y="-4"
              fill="#0022f5"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="10"
              fontWeight="900"
            >
              TM
            </text>
          </g>
        </svg>
      </div>
    );
  }

  // 5. BeamWorks Structural Consultants -> Pitch Solid Black + Pure White with Arch (Lighthouse style!)
  if (normalized.includes("beamworks")) {
    return (
      <div className={`${styles.brandTileWrap} ${className || ""}`} style={{ backgroundColor: "#0a0a0a" }}>
        <svg
          viewBox="0 0 320 165"
          className={styles.brandTileSvg}
          xmlns="http://www.w3.org/2000/svg"
          aria-label="BeamWorks Structural Consultants Logo"
        >
          <g transform="translate(160, 82.5)">
            {/* Lighthouse-inspired bold pure white wordmark */}
            <text
              x="-116"
              y="17"
              fill="#ffffff"
              fontFamily="system-ui, -apple-system, 'Inter', 'Outfit', sans-serif"
              fontSize="31"
              fontWeight="850"
              letterSpacing="-0.03em"
            >
              beamworks
            </text>

            {/* Signature smile / structural arch under the baseline */}
            <path
              d="M-38 23 Q-25 31 -12 23"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3.2"
              strokeLinecap="round"
            />

            {/* Registered badge */}
            <text
              x="62"
              y="-3"
              fill="#ffffff"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="11"
              fontWeight="700"
            >
              ®
            </text>
          </g>
        </svg>
      </div>
    );
  }

  // 6. Axis Structures -> Deep Slate Indigo + Vibrant Amber
  if (normalized.includes("axis")) {
    return (
      <div className={`${styles.brandTileWrap} ${className || ""}`} style={{ backgroundColor: "#0f172a" }}>
        <svg viewBox="0 0 320 165" className={styles.brandTileSvg} xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(160, 82.5)">
            <g transform="translate(-105, -14)">
              <circle cx="14" cy="14" r="11" fill="none" stroke="#f97316" strokeWidth="2.5" />
              <line x1="14" y1="0" x2="14" y2="28" stroke="#f97316" strokeWidth="2" />
              <line x1="0" y1="14" x2="28" y2="14" stroke="#f97316" strokeWidth="2" />
            </g>
            <text x="-65" y="19" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="33" fontWeight="900" letterSpacing="-0.03em">
              axis
            </text>
            <text x="10" y="0" fill="#f97316" fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="800">TM</text>
          </g>
        </svg>
      </div>
    );
  }

  // 7. Gridline Engineering -> Matte Dark Graphite + Lemon Yellow
  if (normalized.includes("gridline")) {
    return (
      <div className={`${styles.brandTileWrap} ${className || ""}`} style={{ backgroundColor: "#18181b" }}>
        <svg viewBox="0 0 320 165" className={styles.brandTileSvg} xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(160, 82.5)">
            <g transform="translate(-112, -15)">
              <rect x="0" y="0" width="28" height="28" rx="6" fill="#fef08a" />
              <line x1="9" y1="4" x2="9" y2="24" stroke="#18181b" strokeWidth="2.5" />
              <line x1="19" y1="4" x2="19" y2="24" stroke="#18181b" strokeWidth="2.5" />
              <line x1="4" y1="9" x2="24" y2="9" stroke="#18181b" strokeWidth="2.5" />
              <line x1="4" y1="19" x2="24" y2="19" stroke="#18181b" strokeWidth="2.5" />
            </g>
            <text x="-70" y="18" fill="#fef08a" fontFamily="system-ui, sans-serif" fontSize="30" fontWeight="850" letterSpacing="-0.03em">
              gridline
            </text>
            <text x="50" y="0" fill="#fef08a" fontFamily="system-ui, sans-serif" fontSize="11" fontWeight="700">®</text>
          </g>
        </svg>
      </div>
    );
  }

  // 8. Enviro MEP Consultants -> Forest Pine + Mint Glow
  if (normalized.includes("enviro")) {
    return (
      <div className={`${styles.brandTileWrap} ${className || ""}`} style={{ backgroundColor: "#064e3b" }}>
        <svg viewBox="0 0 320 165" className={styles.brandTileSvg} xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(160, 82.5)">
            <g transform="translate(-110, -14)">
              <circle cx="14" cy="14" r="11" fill="none" stroke="#34d399" strokeWidth="3" />
              <path d="M8 14 C8 10 14 8 14 14 C14 20 20 18 20 14" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" />
            </g>
            <text x="-70" y="18" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="31" fontWeight="850" letterSpacing="-0.03em">
              enviro
            </text>
            <text x="32" y="0" fill="#34d399" fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="800">TM</text>
          </g>
        </svg>
      </div>
    );
  }

  // 9. Vertex Facades -> Deep Ultraviolet + Electric Lilac
  if (normalized.includes("vertex")) {
    return (
      <div className={`${styles.brandTileWrap} ${className || ""}`} style={{ backgroundColor: "#3b0764" }}>
        <svg viewBox="0 0 320 165" className={styles.brandTileSvg} xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(160, 82.5)">
            <polygon points="-100,14 -86,-12 -72,14" fill="none" stroke="#d8b4fe" strokeWidth="3" />
            <text x="-60" y="18" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="31" fontWeight="850" letterSpacing="-0.03em">
              vertex
            </text>
            <text x="40" y="0" fill="#d8b4fe" fontFamily="system-ui, sans-serif" fontSize="11" fontWeight="700">®</text>
          </g>
        </svg>
      </div>
    );
  }

  // 10. Flow HVAC Studio -> Tangerine Red + Clean White
  if (normalized.includes("flow")) {
    return (
      <div className={`${styles.brandTileWrap} ${className || ""}`} style={{ backgroundColor: "#ea580c" }}>
        <svg viewBox="0 0 320 165" className={styles.brandTileSvg} xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(160, 82.5)">
            <path d="M-92 0 C-82 -10 -76 10 -66 0" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M-92 10 C-82 0 -76 20 -66 10" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
            <text x="-52" y="19" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="34" fontWeight="900" letterSpacing="-0.035em">
              flow
            </text>
            <text x="22" y="0" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="800">TM</text>
          </g>
        </svg>
      </div>
    );
  }

  // 11. Terra Geotechnics -> Rich Earth Terra + Warm Sand
  if (normalized.includes("terra")) {
    return (
      <div className={`${styles.brandTileWrap} ${className || ""}`} style={{ backgroundColor: "#78350f" }}>
        <svg viewBox="0 0 320 165" className={styles.brandTileSvg} xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(160, 82.5)">
            <g transform="translate(-104, -12)">
              <line x1="0" y1="4" x2="22" y2="4" stroke="#fef3c7" strokeWidth="3" strokeLinecap="round" />
              <line x1="4" y1="12" x2="26" y2="12" stroke="#fef3c7" strokeWidth="3" strokeLinecap="round" />
              <line x1="0" y1="20" x2="18" y2="20" stroke="#fef3c7" strokeWidth="3" strokeLinecap="round" />
            </g>
            <text x="-64" y="18" fill="#fef3c7" fontFamily="system-ui, sans-serif" fontSize="32" fontWeight="900" letterSpacing="-0.03em">
              terra
            </text>
            <text x="18" y="0" fill="#fef3c7" fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="800">TM</text>
          </g>
        </svg>
      </div>
    );
  }

  // 12. AquaLine Consultants -> Deep Ocean Cyan + White
  if (normalized.includes("aqua")) {
    return (
      <div className={`${styles.brandTileWrap} ${className || ""}`} style={{ backgroundColor: "#0284c7" }}>
        <svg viewBox="0 0 320 165" className={styles.brandTileSvg} xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(160, 82.5)">
            <g transform="translate(-112, -14)">
              <path d="M14 0 C14 0 4 14 4 20 C4 25.5 8.5 30 14 30 C19.5 30 24 25.5 24 20 C24 14 14 0 14 0 Z" fill="#ffffff" />
            </g>
            <text x="-72" y="18" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="30" fontWeight="850" letterSpacing="-0.03em">
              aqualine
            </text>
            <text x="56" y="0" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="11" fontWeight="700">®</text>
          </g>
        </svg>
      </div>
    );
  }

  // 13. SafeCore Fire -> Flame Charcoal + Blaze Orange
  if (normalized.includes("safecore")) {
    return (
      <div className={`${styles.brandTileWrap} ${className || ""}`} style={{ backgroundColor: "#1c1917" }}>
        <svg viewBox="0 0 320 165" className={styles.brandTileSvg} xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(160, 82.5)">
            <g transform="translate(-114, -14)">
              <path d="M14 2 L26 7 L26 18 C26 25 14 30 14 30 C14 30 2 25 2 18 L2 7 Z" fill="none" stroke="#f97316" strokeWidth="2.5" />
              <circle cx="14" cy="16" r="4" fill="#f97316" />
            </g>
            <text x="-70" y="18" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="30" fontWeight="850" letterSpacing="-0.03em">
              safecore
            </text>
            <text x="58" y="0" fill="#f97316" fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="800">TM</text>
          </g>
        </svg>
      </div>
    );
  }

  // 14. Ledger QS -> Minimalist Slate + Crisp White
  if (normalized.includes("ledger")) {
    return (
      <div className={`${styles.brandTileWrap} ${className || ""}`} style={{ backgroundColor: "#334155" }}>
        <svg viewBox="0 0 320 165" className={styles.brandTileSvg} xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(160, 82.5)">
            <g transform="translate(-104, -12)">
              <line x1="0" y1="4" x2="22" y2="4" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
              <line x1="0" y1="14" x2="22" y2="14" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
              <line x1="0" y1="24" x2="22" y2="24" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            </g>
            <text x="-66" y="19" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="32" fontWeight="900" letterSpacing="-0.035em">
              ledger
            </text>
            <text x="40" y="0" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="11" fontWeight="700">®</text>
          </g>
        </svg>
      </div>
    );
  }

  // 15. CostCraft Advisory -> Sun Gold + Obsidian
  if (normalized.includes("costcraft")) {
    return (
      <div className={`${styles.brandTileWrap} ${className || ""}`} style={{ backgroundColor: "#eab308" }}>
        <svg viewBox="0 0 320 165" className={styles.brandTileSvg} xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(160, 82.5)">
            <text x="-80" y="19" fill="#0f172a" fontFamily="system-ui, sans-serif" fontSize="30" fontWeight="900" letterSpacing="-0.035em">
              costcraft
            </text>
            <text x="56" y="0" fill="#0f172a" fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="800">TM</text>
          </g>
        </svg>
      </div>
    );
  }

  // 16. Studio Canopy -> Deep Emerald + Mint Cream
  if (normalized.includes("canopy")) {
    return (
      <div className={`${styles.brandTileWrap} ${className || ""}`} style={{ backgroundColor: "#065f46" }}>
        <svg viewBox="0 0 320 165" className={styles.brandTileSvg} xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(160, 82.5)">
            <path d="M-92 20 Q-78 -4 -64 20" fill="none" stroke="#ecfdf5" strokeWidth="3.5" strokeLinecap="round" />
            <text x="-50" y="18" fill="#ecfdf5" fontFamily="system-ui, sans-serif" fontSize="32" fontWeight="850" letterSpacing="-0.03em">
              canopy
            </text>
            <text x="66" y="0" fill="#ecfdf5" fontFamily="system-ui, sans-serif" fontSize="11" fontWeight="700">®</text>
          </g>
        </svg>
      </div>
    );
  }

  // 17. Luma Lighting Works -> Pitch Black + Radiant Gold Ray
  if (normalized.includes("luma")) {
    return (
      <div className={`${styles.brandTileWrap} ${className || ""}`} style={{ backgroundColor: "#09090b" }}>
        <svg viewBox="0 0 320 165" className={styles.brandTileSvg} xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(160, 82.5)">
            <circle cx="-80" cy="5" r="10" fill="#fbbf24" />
            <text x="-54" y="19" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="34" fontWeight="900" letterSpacing="-0.035em">
              luma
            </text>
            <text x="32" y="0" fill="#fbbf24" fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="800">TM</text>
          </g>
        </svg>
      </div>
    );
  }

  // 18. Echo Acoustic Lab -> Obsidian + Neon Rose
  if (normalized.includes("echo")) {
    return (
      <div className={`${styles.brandTileWrap} ${className || ""}`} style={{ backgroundColor: "#0f172a" }}>
        <svg viewBox="0 0 320 165" className={styles.brandTileSvg} xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(160, 82.5)">
            <path d="M-96 6 C-88 -8 -88 18 -80 6 C-72 -8 -72 18 -64 6" fill="none" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />
            <text x="-50" y="19" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="34" fontWeight="900" letterSpacing="-0.035em">
              echo
            </text>
            <text x="30" y="0" fill="#f43f5e" fontFamily="system-ui, sans-serif" fontSize="11" fontWeight="700">®</text>
          </g>
        </svg>
      </div>
    );
  }

  // 19. PermitPath / NorthGrid / Fallback dynamic generator with high-contrast palette
  const cleanWord = name.split(" ")[0].toLowerCase();
  const hash = Math.abs(
    name.charCodeAt(0) * 19 +
      (name.charCodeAt(1) || 0) * 37 +
      (name.charCodeAt(2) || 0) * 41,
  );

  const fallbackThemes = [
    { bg: "#0a0a0a", text: "#ffffff", accent: "#ffffff", hasArc: true, badge: "®" },
    { bg: "#c4ff00", text: "#0b0f17", accent: "#0b0f17", hasArrow: true, badge: "TM" },
    { bg: "#ff2727", text: "#ffffff", accent: "#ffffff", hasBox: true, badge: "®" },
    { bg: "#e2e5ea", text: "#0022f5", accent: "#0022f5", hasSquare: true, badge: "TM" },
    { bg: "#0f172a", text: "#ffffff", accent: "#38bdf8", hasCircle: true, badge: "®" },
    { bg: "#064e3b", text: "#ecfdf5", accent: "#34d399", hasDiamond: true, badge: "TM" },
  ];

  const theme = fallbackThemes[hash % fallbackThemes.length];

  return (
    <div className={`${styles.brandTileWrap} ${className || ""}`} style={{ backgroundColor: theme.bg }}>
      <svg
        viewBox="0 0 320 165"
        className={styles.brandTileSvg}
        xmlns="http://www.w3.org/2000/svg"
        aria-label={`${name} Brand Logo`}
      >
        <g transform="translate(160, 82.5)">
          {theme.hasBox && (
            <rect x="-106" y="-12" width="24" height="24" rx="6" fill="none" stroke={theme.accent} strokeWidth="3" />
          )}
          {theme.hasArrow && (
            <path d="M-102 12 L-84 -6 M-84 -6 L-94 -6 M-84 -6 L-84 4" fill="none" stroke={theme.accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          )}
          {theme.hasSquare && (
            <rect x="-100" y="-8" width="16" height="16" fill={theme.accent} />
          )}
          {theme.hasCircle && (
            <circle cx="-92" cy="4" r="9" fill="none" stroke={theme.accent} strokeWidth="3" />
          )}
          {theme.hasDiamond && (
            <polygon points="-92,-6 -82,4 -92,14 -102,4" fill={theme.accent} />
          )}
          
          <text
            x={theme.hasBox || theme.hasArrow || theme.hasSquare || theme.hasCircle || theme.hasDiamond ? "-68" : "-80"}
            y="18"
            fill={theme.text}
            fontFamily="system-ui, -apple-system, 'Inter', 'Outfit', sans-serif"
            fontSize="31"
            fontWeight="850"
            letterSpacing="-0.035em"
          >
            {cleanWord}
          </text>

          {theme.hasArc && (
            <path
              d="M-20 23 Q-8 30 4 23"
              fill="none"
              stroke={theme.accent}
              strokeWidth="3"
              strokeLinecap="round"
            />
          )}

          <text
            x="48"
            y="-2"
            fill={theme.accent}
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="10"
            fontWeight="800"
          >
            {theme.badge}
          </text>
        </g>
      </svg>
    </div>
  );
}
