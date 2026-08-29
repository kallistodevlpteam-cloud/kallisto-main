import { PartnerType, PartnerUser, PartnerSession } from "../shared/types/partner-domain";

export interface PartnerAuthCredentials {
  emailOrPhone: string;
  password?: string;
  partnerType?: PartnerType;
  rememberMe?: boolean;
}

export interface PartnerAuthResult {
  success: boolean;
  session?: PartnerSession;
  error?: string;
}

export interface PartnerAuthContextState {
  isAuthenticated: boolean;
  isLoading: boolean;
  partnerType: PartnerType;
  user: PartnerUser | null;
  session: PartnerSession | null;
  signIn: (credentials: PartnerAuthCredentials) => Promise<PartnerAuthResult>;
  signInDemo: (partnerType: PartnerType) => Promise<PartnerAuthResult>;
  signOut: () => Promise<void>;
  switchPartnerType: (newPartnerType: PartnerType) => Promise<void>;
}
