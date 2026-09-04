export type HubOrderStatus =
  | "REQUEST"
  | "REVIEWING"
  | "QUOTED"
  | "CONFIRMED"
  | "PREPARING"
  | "DISPATCHED"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED";

export type HubOrderTab = "requests" | "active" | "completed";

export type HubOrderPaymentStatus = "pending" | "partially_paid" | "paid" | "overdue";

export interface HubOrderItem {
  id: string;
  name: string;
  brand?: string;
  category: string;
  quantity: number;
  unit: string;
  estimatedRate: number;
  quotedRate?: number;
  inStock: boolean;
  availableQty?: number;
  bayLocation?: string;
  status?: "pending" | "ready" | "sourcing" | "dispatched";
}

export interface HubOrderQuote {
  subtotal: number;
  deliveryCharge: number;
  taxAmount: number;
  total: number;
  validUntil: string;
  discount?: number;
  notes?: string;
}

export interface HubOrderDelivery {
  driverName?: string;
  vehicleNo?: string;
  dispatchedTime?: string;
  eta?: string;
  deliveryNotes?: string;
}

export interface HubOrder {
  id: string; // e.g. "ORD-1024"
  project: string; // e.g. "Greenwood Villa"
  customer: string; // e.g. "Arun Kumar (Contractor)"
  phone: string; // e.g. "+91 98471 23456"
  deliveryLocation: string; // e.g. "Kazhakkoottam, Trivandrum, Kerala"
  gstin?: string; // e.g. "32AABCK1234F1Z8"
  items: HubOrderItem[];
  estimatedValue: number;
  finalValue?: number;
  requiredBy: string; // e.g. "Aug 30, 2026"
  status: HubOrderStatus;
  paymentStatus: HubOrderPaymentStatus;
  createdAt: string;
  dispatchedAt?: string;
  completedAt?: string;
  notes?: string;
  needsAttention?: boolean;
  attentionReason?: string;
  quoteDetails?: HubOrderQuote;
  deliveryTracking?: HubOrderDelivery;
}
