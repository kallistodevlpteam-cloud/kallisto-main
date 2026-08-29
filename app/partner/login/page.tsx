import { Suspense } from "react";
import { PartnerAuthProvider } from "@/partner-app/auth/context/partner-auth-context";
import { PartnerSignInCard } from "@/partner-app/auth/components/partner-sign-in-card";

export default function PartnerLoginPage() {
  return (
    <PartnerAuthProvider>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8fafc",
          backgroundImage: "radial-gradient(#e2e8f0 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          padding: "24px",
        }}
      >
        <Suspense fallback={<div style={{ color: "#64748b" }}>Loading Partner Login...</div>}>
          <PartnerSignInCard />
        </Suspense>
      </div>
    </PartnerAuthProvider>
  );
}
