import { PartnerMetric, PartnerActivityItem, PartnerQuickAction, PartnerUser } from "../types/partner-domain";

export const MOCK_PARTNER_USERS: Record<string, PartnerUser> = {
  HANDS: {
    id: "user-hands-01",
    name: "Vikram Menon",
    email: "vikram.menon@kallisto-hands.com",
    phone: "+91 98470 12345",
    role: "partner_admin",
    partnerType: "HANDS",
    partnerBusinessName: "Kallisto Hands Trade Fleet Kochi",
    location: "Kochi, Kerala",
    verified: true,
  },
  HUB: {
    id: "user-hub-01",
    name: "Ananya Pillai",
    email: "ananya.pillai@kallisto-hub.com",
    phone: "+91 94471 67890",
    role: "partner_admin",
    partnerType: "HUB",
    partnerBusinessName: "Kallisto Hub Materials & Depot #4",
    location: "Ernakulam Hub, Kerala",
    verified: true,
  },
  BASICS: {
    id: "user-basics-01",
    name: "Rohan Varma",
    email: "rohan.varma@kallisto-basics.com",
    phone: "+91 98950 54321",
    role: "partner_admin",
    partnerType: "BASICS",
    partnerBusinessName: "Kallisto Basics Turnkey & Specialist Crew",
    location: "Calicut & Kochi, Kerala",
    verified: true,
  },
};

export const HANDS_DASHBOARD_METRICS: PartnerMetric[] = [
  {
    id: "available_workers",
    label: "Available Workers",
    value: "42",
    change: "+6 today",
    trend: "up",
    caption: "Ready for on-demand dispatch across 6 trade categories",
    colorTheme: "#0284c7",
  },
  {
    id: "deployed_workers",
    label: "Active On-Site Fleet",
    value: "128",
    change: "14 sites",
    trend: "neutral",
    caption: "Deployed on verified Kallisto project sites",
    colorTheme: "#0f172a",
  },
  {
    id: "pending_requests",
    label: "Pending Requests",
    value: "4",
    change: "2 urgent",
    trend: "down",
    caption: "Architect & general contractor crew requests awaiting quote",
    colorTheme: "#ea580c",
  },
  {
    id: "attendance_compliance",
    label: "Attendance Rate",
    value: "96.4%",
    change: "+1.2% vs last wk",
    trend: "up",
    caption: "Biometric & site geotag check-in verification",
    colorTheme: "#10b981",
  },
];

export const HANDS_ACTIVITIES: PartnerActivityItem[] = [
  {
    id: "act-h1",
    title: "Masonry & Shuttering Crew deployed",
    subtitle: "8 workers checked in at Nila Residence (Site KVO-01)",
    timeAgo: "25m ago",
    type: "deployment",
    status: "completed",
  },
  {
    id: "act-h2",
    title: "Urgent Electrician Request received",
    subtitle: "Arjun Architects requested 3 senior wiremen for Azure Villa",
    timeAgo: "1h ago",
    type: "request",
    status: "urgent",
  },
  {
    id: "act-h3",
    title: "Weekly Trade Attendance Audited",
    subtitle: "128 / 132 recorded shifts verified with supervisor biometric sign-off",
    timeAgo: "3h ago",
    type: "system",
    status: "approved",
  },
  {
    id: "act-h4",
    title: "Plumbing Specialist Shift Completed",
    subtitle: "Greenfield Villa rough-in milestone phase inspected by field engineer",
    timeAgo: "5h ago",
    type: "deployment",
    status: "completed",
  },
];

export const HANDS_QUICK_ACTIONS: PartnerQuickAction[] = [
  {
    id: "deploy-crew",
    label: "Deploy Trade Crew",
    description: "Assign available workers or teams to an active project site",
    href: "/partner/hands/assignments",
    primary: true,
  },
  {
    id: "review-requests",
    label: "Review Workforce Requests",
    description: "4 pending contractor requests waiting for allocation",
    href: "/partner/hands/requests",
  },
  {
    id: "verify-attendance",
    label: "Audit Live Attendance",
    description: "Inspect check-in logs and biometric sync status",
    href: "/partner/hands/attendance",
  },
];

export const HUB_DASHBOARD_METRICS: PartnerMetric[] = [
  {
    id: "inventory_value",
    label: "Depot Inventory Value",
    value: "₹48.2 L",
    change: "+₹3.4L restocked",
    trend: "up",
    caption: "Audited stock across 4 regional warehouse bays",
    colorTheme: "#7c3aed",
  },
  {
    id: "pending_orders",
    label: "Pending Orders",
    value: "6",
    change: "3 dispatched",
    trend: "neutral",
    caption: "Material orders from verified contractor projects",
    colorTheme: "#0f172a",
  },
  {
    id: "deliveries_in_transit",
    label: "Deliveries in Transit",
    value: "5",
    change: "2 arriving today",
    trend: "up",
    caption: "Fleet GPS tracking enabled on live delivery batches",
    colorTheme: "#0284c7",
  },
  {
    id: "low_stock_alerts",
    label: "Low Stock Items",
    value: "2",
    change: "Restock PO sent",
    trend: "down",
    caption: "Ultratech Cement & 12mm TMT Steel reorder thresholds reached",
    colorTheme: "#ea580c",
  },
];

export const HUB_ACTIVITIES: PartnerActivityItem[] = [
  {
    id: "act-hb1",
    title: "Batch Dispatch #KL-7801 in Transit",
    subtitle: "120 Bags Ultratech Cement out for delivery to Nila Residence",
    timeAgo: "15m ago",
    type: "delivery",
    status: "in_transit",
  },
  {
    id: "act-hb2",
    title: "Material Purchase Order #PO-902 Approved",
    subtitle: "Tata Tiscon 550D Steel batch confirmed by central supplier",
    timeAgo: "1h ago",
    type: "inventory",
    status: "approved",
  },
  {
    id: "act-hb3",
    title: "Contractor Order #OR-441 Delivered",
    subtitle: "CPVC Plumbing Fittings received & signed by Site In-Charge at Palm Heights",
    timeAgo: "4h ago",
    type: "delivery",
    status: "completed",
  },
  {
    id: "act-hb4",
    title: "Inventory Restock Threshold Triggered",
    subtitle: "Asian Paints Royale Luxury Emulsion 20L stock below safety buffer",
    timeAgo: "6h ago",
    type: "alert",
    status: "urgent",
  },
];

export const HUB_QUICK_ACTIONS: PartnerQuickAction[] = [
  {
    id: "new-dispatch",
    label: "Dispatch Delivery Batch",
    description: "Create gate pass and assign carrier to ready orders",
    href: "/partner/hub/deliveries",
    primary: true,
  },
  {
    id: "inventory-lookup",
    label: "Inspect Inventory Stock",
    description: "Check SKU counts, bay locations, and reorder levels",
    href: "/partner/hub/inventory",
  },
  {
    id: "create-po",
    label: "Raise Supplier PO",
    description: "Generate bulk replenishment purchase order",
    href: "/partner/hub/purchase-orders",
  },
];

export const BASICS_DASHBOARD_METRICS: PartnerMetric[] = [
  {
    id: "active_requests",
    label: "Active Service Requests",
    value: "12",
    change: "+4 this week",
    trend: "up",
    caption: "Specialist maintenance, HVAC & waterproofing jobs",
    colorTheme: "#059669",
  },
  {
    id: "todays_bookings",
    label: "Today's Bookings",
    value: "7",
    change: "5 on schedule",
    trend: "neutral",
    caption: "Scheduled site visits by certified specialists",
    colorTheme: "#0f172a",
  },
  {
    id: "assigned_services",
    label: "Active Project Tasks",
    value: "18",
    change: "across 9 sites",
    trend: "up",
    caption: "Contractor turnkey packages under active execution",
    colorTheme: "#0284c7",
  },
  {
    id: "client_rating",
    label: "Customer CSAT Score",
    value: "4.9 / 5.0",
    change: "48 reviews",
    trend: "up",
    caption: "Service provider and homeowner satisfaction rating",
    colorTheme: "#10b981",
  },
];

export const BASICS_ACTIVITIES: PartnerActivityItem[] = [
  {
    id: "act-b1",
    title: "Specialist HVAC Diagnostic Completed",
    subtitle: "VRV indoor unit pressure tested at Kowdiar Villa (Report uploaded)",
    timeAgo: "30m ago",
    type: "request",
    status: "completed",
  },
  {
    id: "act-b2",
    title: "Waterproofing Inspection Scheduled",
    subtitle: "Basement membrane scan scheduled for Azure Villa at 3:00 PM today",
    timeAgo: "2h ago",
    type: "request",
    status: "pending",
  },
  {
    id: "act-b3",
    title: "Deep Cleaning Package Handover",
    subtitle: "Post-construction deep clean finished with client sign-off at Marina Suites",
    timeAgo: "4h ago",
    type: "payment",
    status: "approved",
  },
  {
    id: "act-b4",
    title: "Modular Joinery Service Assigned",
    subtitle: "Master carpenter dispatched for custom walnut veneer detailing",
    timeAgo: "6h ago",
    type: "deployment",
    status: "completed",
  },
];

export const BASICS_QUICK_ACTIONS: PartnerQuickAction[] = [
  {
    id: "schedule-service",
    label: "Schedule Specialist Booking",
    description: "Book expert consultant or maintenance engineer to site",
    href: "/partner/basics/schedule",
    primary: true,
  },
  {
    id: "review-requests",
    label: "Review Service Requests",
    description: "3 incoming client enquiries waiting for quote estimation",
    href: "/partner/basics/requests",
  },
  {
    id: "service-catalog",
    label: "Manage Service Catalog",
    description: "Update hourly rates, service tiers, and specialist roster",
    href: "/partner/basics/services",
  },
];
