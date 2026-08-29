import { PartnerType } from "../shared/types/partner-domain";

export interface OdinSampleQuery {
  id: string;
  prompt: string;
  category: string;
}

export const PARTNER_ODIN_QUERIES: Record<string, OdinSampleQuery[]> = {
  HANDS: [
    { id: "h1", prompt: "Odin, show me today's available workers.", category: "Availability" },
    { id: "h2", prompt: "Odin, which workforce requests are pending?", category: "Requests" },
    { id: "h3", prompt: "Odin, show today's worker assignments.", category: "Deployments" },
    { id: "h4", prompt: "Odin, check trade attendance compliance.", category: "Attendance" },
    { id: "h5", prompt: "Odin, list high-priority masonry crews.", category: "Trades" },
  ],
  HUB: [
    { id: "hb1", prompt: "Odin, show me pending material orders.", category: "Orders" },
    { id: "hb2", prompt: "Odin, which products are low in stock?", category: "Inventory" },
    { id: "hb3", prompt: "Odin, show deliveries currently in transit.", category: "Logistics" },
    { id: "hb4", prompt: "Odin, summarize open purchase orders.", category: "Procurement" },
    { id: "hb5", prompt: "Odin, check cement batch status for Site KVO-01.", category: "Tracking" },
  ],
  BASICS: [
    { id: "b1", prompt: "Odin, what service requests need attention today?", category: "Requests" },
    { id: "b2", prompt: "Odin, show today's bookings.", category: "Bookings" },
    { id: "b3", prompt: "Odin, which assignments are overdue?", category: "Deadlines" },
    { id: "b4", prompt: "Odin, view scheduled customer maintenance.", category: "Schedule" },
    { id: "b5", prompt: "Odin, check client satisfaction feedback.", category: "CSAT" },
  ],
};

export function getOdinQueriesForPartner(partnerType: PartnerType): OdinSampleQuery[] {
  const normalized = (partnerType || "HANDS").toUpperCase();
  return PARTNER_ODIN_QUERIES[normalized] || PARTNER_ODIN_QUERIES["HANDS"];
}

export function getMockOdinResponse(prompt: string, partnerType: PartnerType): string {
  const normalized = (partnerType || "HANDS").toUpperCase();

  if (normalized === "HANDS") {
    if (prompt.toLowerCase().includes("available")) {
      return "There are currently **42 verified workers** available for dispatch today:\n- 14 Masons & Tile Specialists\n- 12 Electricians (Certified Grade 1)\n- 8 Plumbers\n- 8 Shuttering & Steel Workers\n\nAll crews have verified safety equipment and KYC documents on file.";
    }
    if (prompt.toLowerCase().includes("pending") || prompt.toLowerCase().includes("request")) {
      return "You have **4 pending workforce requests**:\n1. **Nila Residence (KVO-01)** — 4 Finish Plasterers (Urgent)\n2. **Azure Villa (KVO-02)** — 3 Senior Wiremen\n3. **Greenfield Villa (KVO-03)** — 6 Tile Fitters\n4. **Calicut Retail Interior** — 2 HVAC Technicians\n\nWould you like to assign available crews to Nila Residence now?";
    }
    return `Kallisto Hands workforce assistant analyzed: "${prompt}". Operational fleet is currently operating at 96.4% attendance compliance with 128 active workers on site across 14 projects.`;
  }

  if (normalized === "HUB") {
    if (prompt.toLowerCase().includes("order") || prompt.toLowerCase().includes("pending")) {
      return "There are **6 pending material orders**:\n1. **Order #OR-448** — 150 Bags Ultratech Cement (Site KVO-01)\n2. **Order #OR-449** — 4 Tonnes Tata Tiscon 550D TMT Steel\n3. **Order #OR-450** — Astral CPVC Pipe Bundles\n\n3 of these are scheduled for batch dispatch this afternoon.";
    }
    if (prompt.toLowerCase().includes("stock") || prompt.toLowerCase().includes("inventory")) {
      return "Current Depot Inventory Value: **₹48.2 Lakhs**.\n\n⚠️ **2 Low-Stock Warnings**:\n- **Ultratech Super Cement**: 45 bags remaining (Reorder threshold: 100)\n- **12mm TMT Steel Rebar**: 1.2 Tonnes remaining (Reorder threshold: 3.0)\n\nReplenishment Purchase Order #PO-902 is currently pending supplier approval.";
    }
    return `Kallisto Hub logistics engine analyzed: "${prompt}". 5 delivery batches are currently in transit with real-time GPS tracking active.`;
  }

  if (normalized === "BASICS") {
    if (prompt.toLowerCase().includes("request") || prompt.toLowerCase().includes("attention")) {
      return "You have **12 active service requests** with **3 requiring immediate attention**:\n1. **Kowdiar Villa** — VRV Air Conditioning commissioning sign-off\n2. **Azure Villa** — Basement waterproofing membrane diagnostic\n3. **Marina Suites** — Final post-turnkey inspection\n\nWould you like to notify the assigned lead technician?";
    }
    if (prompt.toLowerCase().includes("booking") || prompt.toLowerCase().includes("schedule")) {
      return "Today's Schedule: **7 bookings confirmed** across Kochi & Calicut. 5 specialist visits are currently on schedule, with 2 morning sessions successfully completed.";
    }
    return `Kallisto Basics operations assistant analyzed: "${prompt}". Service quality score is 4.9/5.0 with 18 active turnkey packages underway.`;
  }

  return `Odin Partner Assistant processed query: "${prompt}". All operational indicators are normal.`;
}
