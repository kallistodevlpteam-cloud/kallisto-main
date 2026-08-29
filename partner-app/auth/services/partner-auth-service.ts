import { PartnerType, PartnerSession, PartnerUser } from "../../shared/types/partner-domain";
import { MOCK_PARTNER_USERS } from "../../shared/mock/partner-mock-data";
import { PartnerAuthCredentials, PartnerAuthResult } from "../types";

const PARTNER_TYPE_COOKIE = "kallisto_partner_type";
const PARTNER_AUTH_TOKEN_COOKIE = "kallisto_auth_token";
const PARTNER_USER_ID_COOKIE = "kallisto_partner_user_id";

export class PartnerAuthService {
  /**
   * Retrieves active partner type from cookies or localStorage
   */
  static getStoredPartnerType(): PartnerType {
    if (typeof window === "undefined") return "HANDS";

    // 1. Try reading from cookie
    const cookies = document.cookie.split(";").map((c) => c.trim());
    const typeCookie = cookies.find((c) => c.startsWith(`${PARTNER_TYPE_COOKIE}=`));
    if (typeCookie) {
      const val = decodeURIComponent(typeCookie.split("=")[1]);
      if (val) return val.toUpperCase();
    }

    // 2. Try reading from localStorage
    try {
      const stored = localStorage.getItem("kallisto_partner_type");
      if (stored) return stored.toUpperCase();
    } catch {
      // Ignore storage errors in private browsing modes
    }

    return "HANDS";
  }

  /**
   * Authenticates partner credentials or demo context
   */
  static async authenticate(credentials: PartnerAuthCredentials): Promise<PartnerAuthResult> {
    const partnerType = (credentials.partnerType || "HANDS").toUpperCase();
    const user: PartnerUser = MOCK_PARTNER_USERS[partnerType] || {
      id: `user-${partnerType.toLowerCase()}-01`,
      name: `Kallisto ${partnerType} Lead`,
      email: credentials.emailOrPhone.includes("@") ? credentials.emailOrPhone : `${partnerType.toLowerCase()}@kallisto.com`,
      phone: "+91 98765 43210",
      role: "partner_admin",
      partnerType,
      partnerBusinessName: `Kallisto ${partnerType} Operations`,
      location: "Kochi, Kerala",
      verified: true,
    };

    const token = `tok_partner_${partnerType.toLowerCase()}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const session: PartnerSession = {
      user,
      partnerType,
      token,
      permissions: ["view_dashboard", "manage_fleet", "manage_orders", "view_documents", "access_odin"],
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    };

    // Persist session to cookies and localStorage
    this.persistSession(session);

    return {
      success: true,
      session,
    };
  }

  /**
   * Persists partner session securely in client cookies and localStorage
   */
  static persistSession(session: PartnerSession): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem("kallisto_partner_type", session.partnerType);
      localStorage.setItem("kallisto_partner_user", JSON.stringify(session.user));
      localStorage.setItem("kallisto_auth_token", session.token);
    } catch {
      // Storage safe
    }

    const maxAge = 60 * 60 * 24 * 7; // 7 days
    document.cookie = `${PARTNER_TYPE_COOKIE}=${encodeURIComponent(session.partnerType)}; path=/; max-age=${maxAge}; SameSite=Lax`;
    document.cookie = `${PARTNER_AUTH_TOKEN_COOKIE}=${encodeURIComponent(session.token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
    document.cookie = `${PARTNER_USER_ID_COOKIE}=${encodeURIComponent(session.user.id)}; path=/; max-age=${maxAge}; SameSite=Lax`;
    document.cookie = `kallisto_simulated_role=partner_${session.partnerType.toLowerCase()}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }

  /**
   * Clears partner session
   */
  static clearSession(): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem("kallisto_partner_type");
      localStorage.removeItem("kallisto_partner_user");
      localStorage.removeItem("kallisto_auth_token");
    } catch {
      // Storage safe
    }

    document.cookie = `${PARTNER_TYPE_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
    document.cookie = `${PARTNER_AUTH_TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
    document.cookie = `${PARTNER_USER_ID_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
    document.cookie = `kallisto_simulated_role=; path=/; max-age=0; SameSite=Lax`;
  }

  /**
   * Validates existing session
   */
  static restoreSession(): PartnerSession | null {
    if (typeof window === "undefined") return null;

    const partnerType = this.getStoredPartnerType();
    let token = "";

    try {
      token = localStorage.getItem("kallisto_auth_token") || "";
    } catch {
      // Ignore
    }

    if (!token) {
      const cookies = document.cookie.split(";").map((c) => c.trim());
      const tokenCookie = cookies.find((c) => c.startsWith(`${PARTNER_AUTH_TOKEN_COOKIE}=`));
      if (tokenCookie) {
        token = decodeURIComponent(tokenCookie.split("=")[1]);
      }
    }

    if (!token) return null;

    let user = MOCK_PARTNER_USERS[partnerType] || MOCK_PARTNER_USERS["HANDS"];
    try {
      const storedUser = localStorage.getItem("kallisto_partner_user");
      if (storedUser) {
        user = JSON.parse(storedUser);
      }
    } catch {
      // Fallback to mock
    }

    return {
      user,
      partnerType,
      token,
      permissions: ["view_dashboard", "manage_fleet", "manage_orders", "view_documents", "access_odin"],
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    };
  }
}
