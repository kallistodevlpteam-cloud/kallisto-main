"use client";

import {
  ArrowRight,
  CheckCircle2,
  Clock,
  MessageSquareText,
  Send,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { BasicsProvider, BasicsProviderService } from "../types/basics.types";
import { formatCurrency, pricingLabels } from "../utils/basics-formatters";
import styles from "./basics-workspace.module.css";

export function ProviderOrderPanel({
  provider,
  projectId,
  initialServiceId,
}: {
  provider: BasicsProvider;
  projectId?: string;
  initialServiceId?: string;
}) {
  const services = provider.services.length > 0 ? provider.services : [];
  const defaultService =
    services.find((s) => s.id === initialServiceId) ?? services[0] ?? null;

  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    defaultService ? defaultService.id : "",
  );

  const selectedService: BasicsProviderService | null =
    services.find((s) => s.id === selectedServiceId) ?? defaultService;

  const inviteParams = new URLSearchParams({ providerId: provider.id });
  if (projectId) inviteParams.set("projectId", projectId);
  if (selectedService) inviteParams.set("serviceId", selectedService.id);

  const orderUrl = `/basics/requirements/new?${inviteParams.toString()}&intent=order`;
  const proposalUrl = `/basics/requirements/new?${inviteParams.toString()}&intent=proposal`;

  return (
    <aside className={styles.orderPanelContainer} aria-label="Place an order with this provider">
      <div className={styles.orderCard}>
        {/* Header */}
        <div className={styles.orderCardHeader}>
          <div className={styles.orderCardBadge}>
            <Zap size={13} aria-hidden="true" />
            <span>Direct Order</span>
          </div>
          <span className={styles.orderStatusPill}>
            {provider.availability === "available_now" ||
            provider.availability === "available_this_week"
              ? "Accepting Orders"
              : "Limited Slots"}
          </span>
        </div>

        {/* Service Selector Tabs if provider has multiple services */}
        {services.length > 1 ? (
          <div className={styles.orderServicePicker}>
            <label htmlFor="order-service-select" className={styles.orderLabel}>
              Select Service Package
            </label>
            <div className={styles.orderServiceTabs} role="tablist" aria-label="Service packages">
              {services.map((svc) => (
                <button
                  key={svc.id}
                  type="button"
                  role="tab"
                  aria-selected={selectedService?.id === svc.id}
                  className={`${styles.orderServiceTab} ${
                    selectedService?.id === svc.id ? styles.orderServiceTabActive : ""
                  }`}
                  onClick={() => setSelectedServiceId(svc.id)}
                >
                  <span className={styles.orderServiceTabTitle}>{svc.title}</span>
                  {svc.startingPrice ? (
                    <span className={styles.orderServiceTabPrice}>
                      {formatCurrency(svc.startingPrice, provider.pricing.currency)}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {/* Selected Package Details & Pricing */}
        <div className={styles.orderPricingSection}>
          <div className={styles.orderPricingMain}>
            <span className={styles.orderPriceAmount}>
              {selectedService?.startingPrice
                ? formatCurrency(selectedService.startingPrice, provider.pricing.currency)
                : provider.pricing.startingFrom
                ? formatCurrency(provider.pricing.startingFrom, provider.pricing.currency)
                : "Custom Quote"}
            </span>
            <span className={styles.orderPricingModel}>
              {selectedService
                ? pricingLabels[selectedService.pricingModel]
                : pricingLabels[provider.pricing.model]}
            </span>
          </div>

          <div className={styles.orderDurationRow}>
            <span className={styles.orderDurationItem}>
              <Clock size={13} aria-hidden="true" />
              <span>
                {selectedService?.estimatedDuration ?? "4–7 business days"} delivery
              </span>
            </span>
            <span className={styles.orderDurationItem}>
              <Sparkles size={13} aria-hidden="true" />
              <span>2 revision cycles</span>
            </span>
          </div>
        </div>

        {/* Package Scope & Deliverables */}
        <div className={styles.orderDeliverablesSection}>
          <h3 className={styles.orderSectionTitle}>
            {selectedService ? selectedService.title : "Scope & Deliverables"}
          </h3>
          <p className={styles.orderServiceDesc}>
            {selectedService?.description ?? provider.bio}
          </p>

          <ul className={styles.orderDeliverablesList}>
            {(selectedService?.deliverables ?? [
              "Detailed engineering drawings",
              "Design calculations & SLD",
              "Compliance with NBC / NFPA standards",
              "Direct specialist chat & coordination",
            ]).map((item) => (
              <li key={item} className={styles.orderDeliverableItem}>
                <CheckCircle2 size={14} className={styles.orderCheckIcon} aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className={styles.orderActionButtons}>
          <Link href={orderUrl} className={styles.orderPrimaryButton}>
            <span>Place Order</span>
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
          <Link href={proposalUrl} className={styles.orderSecondaryButton}>
            <Send size={13} aria-hidden="true" />
            <span>Request Custom Proposal</span>
          </Link>
          <Link
            href={`/tools?tool=messages&providerId=${encodeURIComponent(provider.id)}`}
            className={styles.orderTertiaryButton}
          >
            <MessageSquareText size={13} aria-hidden="true" />
            <span>Message {provider.name.split(" ")[0]}</span>
          </Link>
        </div>

        {/* Trust & Guarantee Banner */}
        <div className={styles.orderTrustBanner}>
          <div className={styles.orderTrustItem}>
            <ShieldCheck size={16} className={styles.orderTrustIcon} aria-hidden="true" />
            <div>
              <strong>Kallisto Milestone Protection</strong>
              <p>Funds are secured and only released upon your approval of each deliverable.</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
