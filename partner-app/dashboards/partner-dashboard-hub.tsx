"use client";

import React from "react";
import { usePartnerAuth } from "../auth/context/partner-auth-context";
import { HandsDashboard } from "./hands-dashboard";
import { HubDashboard } from "./hub-dashboard";
import { BasicsDashboard } from "./basics-dashboard";
import { PartnerType } from "../shared/types/partner-domain";

interface PartnerDashboardHubProps {
  forcedType?: PartnerType;
}

export function PartnerDashboardHub({ forcedType }: PartnerDashboardHubProps) {
  const { partnerType } = usePartnerAuth();
  const activeType = (forcedType || partnerType || "HANDS").toUpperCase();

  switch (activeType) {
    case "HANDS":
      return <HandsDashboard />;
    case "HUB":
      return <HubDashboard />;
    case "BASICS":
      return <BasicsDashboard />;
    default:
      return <HandsDashboard />;
  }
}
