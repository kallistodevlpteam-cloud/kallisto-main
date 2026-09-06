export interface ClientAttentionItem {
  id: string;
  title: string;
  category: "Approval" | "Payment" | "Review" | "Decision";
  urgency: "high" | "medium";
  date: string;
  actionLabel: string;
  description?: string;
}

export interface ClientUpcomingItem {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: "meeting" | "deadline" | "payment" | "visit";
  location?: string;
}

export interface ClientActivityItem {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
  iconType: "doc" | "payment" | "status" | "approval";
}

export interface ClientProject {
  id: string;
  code: string;
  name: string;
  category: string;
  stage: string;
  location: string;
  progress: number;
  totalBudget: string;
  paidAmount: string;
  pendingAmount: string;
  leadProvider: string;
  fileCount: number;
  activeTaskCount: number;
  targetCompletion: string;
  needsAttention: ClientAttentionItem[];
  upcoming: ClientUpcomingItem[];
  recentActivity: ClientActivityItem[];
  suggestedPrompts: string[];
}

export interface ClientOdinMessage {
  id: string;
  sender: "user" | "odin";
  text: string;
  timestamp: string;
  actionType?: "provider_discovery" | "pending_summary" | "drawing_preview" | "payment_summary" | "schedule_visit" | "quote_lookup" | "general";
  structuredData?: Record<string, unknown>;
}
