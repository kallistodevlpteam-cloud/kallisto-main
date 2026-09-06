import { StudioWorkspaceType } from "./studio";
import { StudioIntent, StudioSource } from "@/features/studio/types/studio-source";

export interface StudioMessageAction {
  id: string;
  label: string;
  intent: StudioIntent;
  outputType?: StudioWorkspaceType;
  suggestedPrompt: string;
}

export interface StudioRetryPayload {
  taskId: string;
  submissionId: string;
  messageId: string;
  prompt: string;
  sources: StudioSource[];
}

export interface StudioOutputReference {
  outputId: string;
  versionId: string;
  title?: string;
  statusBadge?: string;
  eventType: "created" | "revised" | "linked";
}

export interface StudioProviderCardReference {
  providerId: string;
  name: string;
  avatarUrl?: string;
  rating?: number;
  reviewsCount?: number;
  packageTitle: string;
  packagePrice: string;
  isVerified?: boolean;
}

export interface StudioChatMessage {
  id: string;
  taskId: string;
  role: "user" | "assistant" | "system";
  kind: "text" | "status" | "validation" | "output" | "error";
  content: string;
  createdAt: string;
  actions?: StudioMessageAction[];
  outputId?: string;
  outputReference?: StudioOutputReference;
  providerCard?: StudioProviderCardReference;
  sources?: StudioSource[];
  retryPayload?: StudioRetryPayload;
}
