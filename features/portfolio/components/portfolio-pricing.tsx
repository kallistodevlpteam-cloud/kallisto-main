"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Sparkles, X } from "lucide-react";
import { RupeeIcon } from "@/components/layout/sidebar-icons";
import type { PortfolioProfile } from "@/features/portfolio/types/portfolio.types";
import { useOdin } from "@/hooks/use-odin";
import styles from "./portfolio.module.css";

function KallistoSparkleIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="#0f172a" />
      <circle cx="5" cy="19" r="1.5" fill="#0f172a" />
      <path d="M19 4L19.8 6.2L22 7L19.8 7.8L19 10L18.2 7.8L16 7L18.2 6.2L19 4Z" fill="#0f172a" opacity="0.6" />
    </svg>
  );
}

function EmeraldBonsaiTree() {
  return (
    <svg width="46" height="46" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Trunk */}
      <path d="M24 41C24 35 21 30 22 24C22.5 21 24.5 19 25 16" stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M22 28C19 26 17 24 16 22" stroke="#451a03" strokeWidth="2" strokeLinecap="round" />
      <path d="M23 22C26 20 28 19 30 18" stroke="#451a03" strokeWidth="2" strokeLinecap="round" />
      {/* Foliage */}
      <circle cx="25" cy="14" r="7.5" fill="#059669" opacity="0.9" />
      <circle cx="17" cy="19" r="6" fill="#10b981" opacity="0.85" />
      <circle cx="32" cy="17" r="6" fill="#047857" opacity="0.85" />
      <circle cx="22" cy="10" r="5" fill="#34d399" />
      <circle cx="29" cy="11" r="4.5" fill="#a7f3d0" />
      {/* Falling leaves */}
      <circle cx="11" cy="27" r="1.2" fill="#10b981" opacity="0.7" />
      <circle cx="36" cy="26" r="1.2" fill="#059669" opacity="0.7" />
      <circle cx="39" cy="33" r="1" fill="#34d399" opacity="0.6" />
      {/* Ground line */}
      <ellipse cx="24" cy="41" rx="8" ry="1.5" fill="#cbd5e1" />
    </svg>
  );
}

function PurpleBonsaiTree() {
  return (
    <svg width="46" height="46" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Trunk */}
      <path d="M24 41C24 35 21 30 22 24C22.5 21 24.5 19 25 16" stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M22 28C19 26 17 24 16 22" stroke="#451a03" strokeWidth="2" strokeLinecap="round" />
      <path d="M23 22C26 20 28 19 30 18" stroke="#451a03" strokeWidth="2" strokeLinecap="round" />
      {/* Foliage */}
      <circle cx="25" cy="14" r="7.5" fill="#9333ea" opacity="0.9" />
      <circle cx="17" cy="19" r="6" fill="#a855f7" opacity="0.85" />
      <circle cx="32" cy="17" r="6" fill="#7e22ce" opacity="0.85" />
      <circle cx="22" cy="10" r="5" fill="#c084fc" />
      <circle cx="29" cy="11" r="4.5" fill="#e9d5ff" />
      {/* Falling petals */}
      <circle cx="11" cy="27" r="1.2" fill="#a855f7" opacity="0.7" />
      <circle cx="36" cy="26" r="1.2" fill="#9333ea" opacity="0.7" />
      <circle cx="39" cy="33" r="1" fill="#c084fc" opacity="0.6" />
      {/* Ground line */}
      <ellipse cx="24" cy="41" rx="8" ry="1.5" fill="#cbd5e1" />
    </svg>
  );
}

function AutumnBonsaiTree() {
  return (
    <svg width="46" height="46" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Trunk */}
      <path d="M24 41C24 35 22 31 23 25C23.5 22 25.5 20 26 17" stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M23 29C20 27 18 25 17 23" stroke="#451a03" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 23C27 21 29 20 31 19" stroke="#451a03" strokeWidth="2" strokeLinecap="round" />
      {/* Foliage */}
      <circle cx="25" cy="14" r="7.5" fill="#d97706" opacity="0.9" />
      <circle cx="17" cy="19" r="6" fill="#f59e0b" opacity="0.85" />
      <circle cx="32" cy="17" r="6" fill="#b45309" opacity="0.85" />
      <circle cx="22" cy="10" r="5" fill="#fbbf24" />
      <circle cx="29" cy="11" r="4.5" fill="#fde68a" />
      {/* Falling leaves */}
      <circle cx="12" cy="27" r="1.2" fill="#d97706" opacity="0.7" />
      <circle cx="37" cy="26" r="1.2" fill="#f59e0b" opacity="0.7" />
      <circle cx="38" cy="34" r="1" fill="#fbbf24" opacity="0.6" />
      {/* Ground line */}
      <ellipse cx="24" cy="41" rx="8" ry="1.5" fill="#cbd5e1" />
    </svg>
  );
}

function DiamondBulletIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="#94a3b8" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M8 1L10 6L8 8L6 6L8 1Z" />
      <path d="M15 8L10 10L8 8L10 6L15 8Z" />
      <path d="M8 15L6 10L8 8L10 10L8 15Z" />
      <path d="M1 8L6 6L8 8L6 10L1 8Z" />
    </svg>
  );
}

export interface PricingCardItem {
  id: string;
  category: "design" | "execution";
  tierKey: "emerald" | "purple" | "autumn";
  title: string;
  price: string;
  priceUnit?: string;
  subLabel: string;
  description: string;
  deliverables: string[];
  duration: string;
  revisionText: string;
}

interface PortfolioPricingProps {
  profile?: PortfolioProfile;
  isOwner?: boolean;
}

export function PortfolioPricing({ profile, isOwner = false }: PortfolioPricingProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string>("design-basic");
  const [confirmingPackage, setConfirmingPackage] = useState<PricingCardItem | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const { openOdin } = useOdin();

  // 1. Design Packages (3 Cards)
  const designPackages: PricingCardItem[] = useMemo(
    () => [
      {
        id: "design-basic",
        category: "design",
        tierKey: "emerald",
        title: "Basic Design Package",
        price: "2,50,000",
        subLabel: "Starting from ₹2.5L+",
        description:
          "Essential architectural and engineering design package tailored for standard residential and commercial spaces.",
        deliverables: [
          "Conceptual layout & spatial planning",
          "Statutory municipal approval drawings (KMBR / KPBR)",
          "3D exterior perspective visuals",
        ],
        duration: "4 to 5 weeks",
        revisionText: "2 revision cycles included",
      },
      {
        id: "design-advanced",
        category: "design",
        tierKey: "purple",
        title: "Advanced Design Package",
        price: "5,00,000",
        subLabel: "Comprehensive scope from ₹5L+",
        description:
          "Full coordinated architectural & structural drawing set with photorealistic 3D renders and detailed BOQs.",
        deliverables: [
          "Detailed working & execution drawings",
          "Coordinated structural, plumbing & electrical layouts",
          "High-definition 3D walkthrough visuals",
          "Itemized Bill of Quantities (BOQ)",
        ],
        duration: "6 to 8 weeks",
        revisionText: "3 revision cycles included",
      },
      {
        id: "design-luxury",
        category: "design",
        tierKey: "autumn",
        title: "Luxury Bespoke Package",
        price: "15,00,000",
        subLabel: "Signature turnkey from ₹15L+",
        description:
          "End-to-end bespoke luxury design with custom joinery, premium material schedules, and dedicated site supervision.",
        deliverables: [
          "Bespoke architectural & luxury interior package",
          "Custom material specifications & physical palette",
          "Full BIM 3D clash-detection coordination model",
          "Dedicated site supervision & milestone sign-offs",
          "Priority principal architect direct coordination",
        ],
        duration: "10 to 12 weeks",
        revisionText: "Unlimited revision cycles",
      },
    ],
    [],
  );

  // 2. Full Execution Packages with Sq.Ft Charges (3 Cards)
  const executionPackages: PricingCardItem[] = useMemo(
    () => [
      {
        id: "exec-standard",
        category: "execution",
        tierKey: "emerald",
        title: "Standard Turnkey Execution",
        price: "2,150",
        priceUnit: "/ sq.ft",
        subLabel: "Per built-up sq.ft area",
        description:
          "End-to-end structural civil construction, solid masonry, standard electrical, sanitary fittings, and vitrified finishes.",
        deliverables: [
          "RCC framed structure with Fe550 certified steel",
          "Solid concrete block masonry & external weatherproofing",
          "Standard branded electrical & sanitary fixtures",
          "Vitrified tile flooring (up to ₹70/sq.ft allowance)",
        ],
        duration: "8 to 10 months completion",
        revisionText: "5-year structural warranty",
      },
      {
        id: "exec-premium",
        category: "execution",
        tierKey: "purple",
        title: "Premium Architectural Build",
        price: "2,850",
        priceUnit: "/ sq.ft",
        subLabel: "Per built-up sq.ft area",
        description:
          "High-spec execution featuring exposed concrete finishes, teakwood joinery, designer bathrooms, and branded fixtures.",
        deliverables: [
          "Precision RCC structure with waterproof casting",
          "Premium teak wood frames & designer flush doors",
          "Italian marble / premium large-format vitrified slabs",
          "Concealed Grohe / Kohler premium bathroom fittings",
        ],
        duration: "10 to 12 months completion",
        revisionText: "10-year structural warranty",
      },
      {
        id: "exec-luxury",
        category: "execution",
        tierKey: "autumn",
        title: "Luxury Signature Construction",
        price: "3,650",
        priceUnit: "/ sq.ft",
        subLabel: "Per built-up sq.ft area",
        description:
          "Top-tier luxury execution with custom facade glazing, home automation, VRV centralized air conditioning, and bespoke finishes.",
        deliverables: [
          "Bespoke structural execution & architectural facade",
          "Full smart home automation & lighting control integration",
          "VRV centralized air conditioning infrastructure",
          "Imported marble, custom joinery & acoustic ceiling treatments",
          "Dedicated full-time site engineer & quality audit reports",
        ],
        duration: "12 to 14 months completion",
        revisionText: "Lifetime structural support & maintenance",
      },
    ],
    [],
  );

  const handleCardClick = (pkg: PricingCardItem) => {
    setSelectedPlanId(pkg.id);
    setConfirmingPackage(pkg);
    setIsDropdownOpen(false);
  };

  const handleSelectDropdownPackage = (pkg: PricingCardItem) => {
    setSelectedPlanId(pkg.id);
    setConfirmingPackage(pkg);
    setIsDropdownOpen(false);
  };

  const router = useRouter();

  const handleConfirmAndProceedToOdin = () => {
    if (!confirmingPackage) return;

    const providerName = profile?.name || "Arjun Architects";
    const packageTitle = confirmingPackage.title;
    const packageRate = `₹${confirmingPackage.price}${confirmingPackage.priceUnit ? ` ${confirmingPackage.priceUnit}` : ""}`;

    const promptText = `I would like to confirm and proceed with the "${packageTitle}" (${packageRate}) from ${providerName}. Please assist me in setting up the project brief, verifying site feasibility, and finalizing the consultation order.`;

    setConfirmingPackage(null);
    router.push(`/client/overview?prompt=${encodeURIComponent(promptText)}&providerId=${encodeURIComponent(profile?.providerId || "provider-arjun-architects")}`);
  };

  const renderCard = (pkg: PricingCardItem) => {
    const isSelected = selectedPlanId === pkg.id;

    return (
      <article
        className={`${styles.modernServiceCard} ${
          isSelected ? styles.modernServiceCardSelected : ""
        }`}
        key={pkg.id}
      >
        {/* Top Floating White Header Box */}
        <div className={styles.serviceInsertHeaderBox}>
          <div className={styles.serviceInsertHeaderLeft}>
            <span className={styles.serviceInsertTitle}>{pkg.title}</span>
            <div className={styles.serviceInsertPriceRow}>
              <RupeeIcon size={18} className={styles.serviceRupeeIcon} aria-hidden="true" />
              <span className={styles.serviceInsertPrice}>{pkg.price}</span>
              {pkg.priceUnit ? (
                <span className={styles.serviceInsertPriceUnit}>{pkg.priceUnit}</span>
              ) : null}
            </div>
            <span className={styles.serviceInsertSubLabel}>{pkg.subLabel}</span>
          </div>

          {/* Decorative Tree Illustration matching tier */}
          <div className={styles.serviceTreeIllustration}>
            {pkg.tierKey === "emerald" ? (
              <EmeraldBonsaiTree />
            ) : pkg.tierKey === "purple" ? (
              <PurpleBonsaiTree />
            ) : (
              <AutumnBonsaiTree />
            )}
          </div>
        </div>

        {/* Description Statement */}
        <p className={styles.modernServiceDesc}>{pkg.description}</p>

        {/* Deliverables Checklist with Diamond Icons */}
        <ul className={styles.modernServiceDeliverables}>
          {pkg.deliverables.map((deliverable) => (
            <li key={deliverable} className={styles.modernServiceDeliverableItem}>
              <DiamondBulletIcon />
              <span>{deliverable}</span>
            </li>
          ))}
          <li className={styles.modernServiceDeliverableItem}>
            <DiamondBulletIcon />
            <span>{pkg.duration}</span>
          </li>
          <li className={styles.modernServiceDeliverableItem}>
            <DiamondBulletIcon />
            <span>{pkg.revisionText}</span>
          </li>
        </ul>

        {/* Full Width Send Enquiry / Selection Action Button */}
        <button
          type="button"
          className={
            isSelected
              ? styles.modernServiceButtonSelected
              : styles.modernServiceButton
          }
          onClick={() => handleCardClick(pkg)}
        >
          {isSelected ? "Selected ✓" : "Send enquiry"}
        </button>
      </article>
    );
  };

  const bannerImg = profile?.coverImageUrl || "/assets/nila-hero.jpg";
  const providerName = profile?.name || "Arjun Architects";

  return (
    <div className={styles.pricingSectionsStack}>
      {/* 1. Design Packages Section */}
      <section className={styles.pricingCategorySection}>
        <div className={styles.pricingCategoryHeader}>
          <h2 className={styles.pricingCategoryTitle}>Design Packages</h2>
          <p className={styles.pricingCategorySubtitle}>
            Comprehensive architectural, structural, and interior design deliverables.
          </p>
        </div>
        <div className={styles.serviceCards3Grid}>
          {designPackages.map(renderCard)}
        </div>
      </section>

      {/* 2. Full Execution Section with Sq.Ft Charges */}
      <section className={styles.pricingCategorySection}>
        <div className={styles.pricingCategoryHeader}>
          <h2 className={styles.pricingCategoryTitle}>Full Execution</h2>
          <p className={styles.pricingCategorySubtitle}>
            Turnkey on-site civil construction, material procurement, and milestone-verified execution per sq.ft.
          </p>
        </div>
        <div className={styles.serviceCards3Grid}>
          {executionPackages.map(renderCard)}
        </div>
      </section>

      {/* Pop-up Confirmation Modal adapted from Reference Card */}
      {confirmingPackage ? (
        <div className={styles.refModalBackdrop} onClick={() => setConfirmingPackage(null)}>
          <div
            className={styles.refModalCard}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ref-modal-title"
          >
            {/* Top Graphic Hero Banner */}
            <div className={styles.refModalHero}>
              <Image
                src={bannerImg}
                alt={`${providerName} banner`}
                fill
                priority
                className={styles.refModalHeroImg}
                sizes="(max-width: 768px) 100vw, 460px"
              />

              {/* Close Button */}
              <button
                type="button"
                className={styles.refModalCloseBtn}
                onClick={() => setConfirmingPackage(null)}
                aria-label="Close dialog"
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Body Info */}
            <div className={styles.refModalBody}>
              <h3 id="ref-modal-title" className={styles.refModalTitle}>
                Confirm Package Enquiry
              </h3>
              <p className={styles.refModalDesc}>
                You are about to initiate an enquiry with <strong>{providerName}</strong>. Ask Odin will structure your project requirements, review site feasibility, and finalize the consultation order.
              </p>

              {/* Interactive Package Selector Dropdown */}
              <div className={styles.refModalDropdownWrapper}>
                <button
                  type="button"
                  className={`${styles.refModalPackageStripBtn} ${
                    isDropdownOpen ? styles.refModalPackageStripBtnActive : ""
                  }`}
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="listbox"
                >
                  <div className={styles.refModalPackageStripLeft}>
                    <KallistoSparkleIcon size={16} />
                    <span className={styles.refModalPackageTitle}>
                      {confirmingPackage.title}
                    </span>
                    <span className={styles.refModalPackageDivider}>•</span>
                    <div className={styles.refModalPriceWrap}>
                      <RupeeIcon size={14} className={styles.refModalRupeeIcon} aria-hidden="true" />
                      <span className={styles.refModalPriceVal}>{confirmingPackage.price}</span>
                      {confirmingPackage.priceUnit ? <small>{confirmingPackage.priceUnit}</small> : null}
                    </div>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`${styles.refModalChevronIcon} ${
                      isDropdownOpen ? styles.refModalChevronRotated : ""
                    }`}
                  />
                </button>

                {/* Dropdown Options List */}
                {isDropdownOpen ? (
                  <div className={styles.refModalDropdownMenu} role="listbox">
                    <div className={styles.refDropdownCategoryHeading}>Design Packages</div>
                    {designPackages.map((pkg) => {
                      const isItemActive = confirmingPackage.id === pkg.id;
                      return (
                        <button
                          key={pkg.id}
                          type="button"
                          className={`${styles.refDropdownItem} ${
                            isItemActive ? styles.refDropdownItemActive : ""
                          }`}
                          onClick={() => handleSelectDropdownPackage(pkg)}
                          role="option"
                          aria-selected={isItemActive}
                        >
                          <div className={styles.refDropdownItemLeft}>
                            <span className={styles.refDropdownItemTitle}>{pkg.title}</span>
                            <span className={styles.refDropdownItemPrice}>
                              ₹{pkg.price}
                            </span>
                          </div>
                          {isItemActive ? <Check size={14} className={styles.refDropdownCheck} /> : null}
                        </button>
                      );
                    })}

                    <div className={styles.refDropdownCategoryHeading}>Full Execution (per sq.ft)</div>
                    {executionPackages.map((pkg) => {
                      const isItemActive = confirmingPackage.id === pkg.id;
                      return (
                        <button
                          key={pkg.id}
                          type="button"
                          className={`${styles.refDropdownItem} ${
                            isItemActive ? styles.refDropdownItemActive : ""
                          }`}
                          onClick={() => handleSelectDropdownPackage(pkg)}
                          role="option"
                          aria-selected={isItemActive}
                        >
                          <div className={styles.refDropdownItemLeft}>
                            <span className={styles.refDropdownItemTitle}>{pkg.title}</span>
                            <span className={styles.refDropdownItemPrice}>
                              ₹{pkg.price} {pkg.priceUnit}
                            </span>
                          </div>
                          {isItemActive ? <Check size={14} className={styles.refDropdownCheck} /> : null}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Bottom Action Footer with single Continue CTA */}
            <div className={styles.refModalFooter}>
              <button
                type="button"
                className={styles.refModalContinueBtnFull}
                onClick={handleConfirmAndProceedToOdin}
              >
                <span>Continue</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
